(function () {
  // Signaler que le script est chargé (pour la détection des bloqueurs)
  window.hectorAnalyticsLoaded = true;
  
  let heartbeatInterval = null;
  let lastActivityTime = Date.now();
  
  function sendHeartbeat() {
    // Ne pas envoyer si l'onglet n'est pas visible
    if (document.hidden) {
      return;
    }
    
    let sessionId = localStorage.getItem("user_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("user_session_id", sessionId);
    }

    // Send regular analytics tracking
    const trackingPromise = fetch("https://www.hectoranalytics.com/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        page: location.pathname,
        domain: window.location.hostname,
        referrer: document.referrer || null,
        urlParams: window.location.search,
      }),
      keepalive: true,
    }).catch(() => {
      // silent fail en dev
    });

    // Send funnel tracking (after getting site ID from main tracking)
    trackingPromise.then(() => {
      trackFunnels(sessionId);
    });
    
    lastActivityTime = Date.now();
  }

  function trackFunnels(sessionId) {
    // Extract site ID from the domain - this should match the logic in /api/track
    const domain = window.location.hostname;
    
    fetch("https://www.hectoranalytics.com/api/track-funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteId: domain, // The API will resolve domain to siteId
        sessionId,
        currentUrl: window.location.href,
      }),
      keepalive: true,
    }).catch(() => {
      // silent fail
    });
  }

  function startHeartbeat() {
    // Arrêter l'ancien interval s'il existe
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
    
    // Envoyer immédiatement si l'onglet est visible
    if (!document.hidden) {
      sendHeartbeat();
    }
    
    // Démarrer le heartbeat périodique (toutes les 60 secondes)
    heartbeatInterval = setInterval(() => {
      // Vérifier si l'utilisateur a été inactif pendant plus de 30 minutes
      if (Date.now() - lastActivityTime > 30 * 60 * 1000) {
        stopHeartbeat();
        return;
      }
      sendHeartbeat();
    }, 60_000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  // Gestion de la visibilité de l'onglet
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
      // L'onglet est devenu invisible - arrêter les heartbeats
      stopHeartbeat();
    } else {
      // L'onglet est redevenu visible - reprendre les heartbeats
      startHeartbeat();
    }
  });

  // Détection d'activité de l'utilisateur
  const resetActivityTimer = () => {
    lastActivityTime = Date.now();
  };

  // Écouter les événements d'activité
  document.addEventListener("mousemove", resetActivityTimer);
  document.addEventListener("keypress", resetActivityTimer);
  document.addEventListener("scroll", resetActivityTimer);
  document.addEventListener("click", resetActivityTimer);
  document.addEventListener("touchstart", resetActivityTimer);

  // Exécute de suite ou si load déjà passé
  if (document.readyState === "complete") {
    startHeartbeat();
  } else {
    window.addEventListener("load", () => startHeartbeat(), { once: true });
  }
})();
