(function () {
  function sendHeartbeat() {
    let sessionId = localStorage.getItem("user_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("user_session_id", sessionId);
    }

    // Build tracking URL with UTM parameters
    const currentUrl = new URL(window.location.href);
    const trackingUrl = new URL("https://www.hectoranalytics.com/api/track");
    
    // Copy UTM parameters if present
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(param => {
      const value = currentUrl.searchParams.get(param);
      if (value) {
        trackingUrl.searchParams.set(param, value);
      }
    });

    fetch(trackingUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        page: location.pathname,
        domain: window.location.hostname,
        referrer: document.referrer || null,
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
