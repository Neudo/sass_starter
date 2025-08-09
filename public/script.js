(function () {
  function sendHeartbeat() {
    let sessionId = localStorage.getItem("user_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("user_session_id", sessionId);
    }

    // Get UTM parameters and ref from current URL
    const currentUrl = new URL(window.location.href);
    
    // Build the tracking payload with all parameters
    const payload = {
      sessionId,
      page: location.pathname,
      domain: window.location.hostname,
      referrer: document.referrer || null,
      // Add UTM parameters and ref if present
      ref: currentUrl.searchParams.get("ref") || undefined,
      utm_source: currentUrl.searchParams.get("utm_source") || undefined,
      utm_medium: currentUrl.searchParams.get("utm_medium") || undefined,
      utm_campaign: currentUrl.searchParams.get("utm_campaign") || undefined,
      utm_term: currentUrl.searchParams.get("utm_term") || undefined,
      utm_content: currentUrl.searchParams.get("utm_content") || undefined,
    };

    fetch("https://www.hectoranalytics.com/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
