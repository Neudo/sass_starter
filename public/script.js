(function () {
  const siteId = "a0f448fd-ef6a-428e-a8fe-7125e1671512"; // <--- remplacer avec l'ID réel du site

  function sendHeartbeat() {
    let sessionId = localStorage.getItem("sa_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("sa_session_id", sessionId);
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        siteId,
        page: location.pathname,
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
