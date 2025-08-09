(function () {
  function sendHeartbeat() {
    let sessionId = localStorage.getItem("user_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("user_session_id", sessionId);
    }

    // Get UTM parameters and ref from current URL
    const currentUrl = new URL(window.location.href);
    
    // Build the tracking payload - only include params that exist
    const payload = {
      sessionId,
      page: location.pathname,
      domain: window.location.hostname,
      referrer: document.referrer || null,
    };
    
    // Only add UTM parameters if they exist
    const ref = currentUrl.searchParams.get("ref");
    const utm_source = currentUrl.searchParams.get("utm_source");
    const utm_medium = currentUrl.searchParams.get("utm_medium");
    const utm_campaign = currentUrl.searchParams.get("utm_campaign");
    const utm_term = currentUrl.searchParams.get("utm_term");
    const utm_content = currentUrl.searchParams.get("utm_content");
    
    if (ref) payload.ref = ref;
    if (utm_source) payload.utm_source = utm_source;
    if (utm_medium) payload.utm_medium = utm_medium;
    if (utm_campaign) payload.utm_campaign = utm_campaign;
    if (utm_term) payload.utm_term = utm_term;
    if (utm_content) payload.utm_content = utm_content;

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
