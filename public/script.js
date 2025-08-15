(function () {
  // Signaler que le script est chargé (pour la détection des bloqueurs)
  window.hectorAnalyticsLoaded = true;
  
  function sendHeartbeat() {
    let sessionId = localStorage.getItem("user_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("user_session_id", sessionId);
    }

    fetch("https://www.hectoranalytics.com/api/track", {
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
  }

  // Exécute de suite ou si load déjà passé
  if (document.readyState === "complete") {
    sendHeartbeat();
  } else {
    window.addEventListener("load", sendHeartbeat, { once: true });
  }

  // Heartbeat périodique pour maintenir la session "active"
  setInterval(sendHeartbeat, 60_000);
})();
