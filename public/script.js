!(function () {
  let h,
    a = Date.now(),
    s,
    p = location.pathname;
  const g = () =>
      s ||
      (s =
        localStorage.getItem("ha_s") ||
        (localStorage.setItem("ha_s", (s = crypto.randomUUID())), s)),
    f = (p, d) =>
      fetch(
        (location.hostname == "localhost"
          ? "http://localhost:3000"
          : "https://hectoranalytics.com") +
          "/api/" +
          p,
        {
          method: d ? "POST" : "GET",
          headers: { "Content-Type": "application/json" },
          body: d ? JSON.stringify(d) : void 0,
          keepalive: !0,
        }
      ).catch(() => {}),
    t = () => {
      (document.hidden ||
        f("track", {
          sessionId: g(),
          page: location.pathname,
          domain: location.hostname,
          referrer: document.referrer || null,
          urlParams: location.search,
          language: navigator.language || "en",
        }),
        (a = Date.now()));
    },
    r = () => {
      (h && clearInterval(h),
        document.hidden || t(),
        (h = setInterval(() => {
          Date.now() - a > 18e5 ? (clearInterval(h), (h = null)) : t();
        }, 6e4)));
    };
  window.hector = (a, e, d) => {
    "track" == a &&
      e &&
      f("track-custom-event", {
        site_domain: location.hostname,
        event_name: e,
        session_id: g(),
        page_url: location.href,
        metadata: d || {},
      });
  };
  document.addEventListener("visibilitychange", () => {
    document.hidden ? h && (clearInterval(h), (h = null)) : r();
  });
  ["mousemove", "keypress", "scroll", "click", "touchstart"].forEach((e) => {
    document.addEventListener(e, () => (a = Date.now()));
  });
  setInterval(() => {
    p != location.pathname && ((p = location.pathname), t());
  }, 1e3);
  addEventListener("popstate", () => t());
  "complete" == document.readyState
    ? r()
    : addEventListener("load", r, { once: !0 });
})();
