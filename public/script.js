(function () {
  // Prevent multiple executions
  if (window.h && window.h.initialized) return;
  window.h = { initialized: true };
  let i,
    t = Date.now(),
    s = new Set(),
    f = [],
    e = [],
    c = [],
    g = false;
  const u = (p) => {
    // Use relative URL for local development, absolute for production
    const host = location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.includes('localhost:')) {
      return `/api/${p}`;
    }
    return `https://hectoranalytics.com/api/${p}`;
  };
  const r = (url, data) =>
    fetch(url, {
      method: data ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : void 0,
      keepalive: true,
    }).catch(() => {});
  const d = () => {
    // Check if we already have the ID in memory (prevents race conditions)
    if (window.h_session_id) return window.h_session_id;
    
    try {
      let id = localStorage.getItem("user_session_id");
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("user_session_id", id);
      }
      // Store in memory to prevent race conditions
      window.h_session_id = id;
      return id;
    } catch (e) {
      // If localStorage fails, use a session-only ID stored in memory
      if (!window.h_session_id) {
        window.h_session_id = crypto.randomUUID();
      }
      return window.h_session_id;
    }
  };
  const l = () => navigator.language || navigator.languages?.[0] || "en";
  function h() {
    if (document.hidden) return;
    const id = d(),
      dom = location.hostname;
    r(u("track"), {
      sessionId: id,
      page: location.pathname,
      domain: dom,
      referrer: document.referrer || null,
      urlParams: location.search,
      language: l(),
    }).then(() => {
      if (!f.length && !e.length) k(dom, id);
      else o(dom, id);
    });
    t = Date.now();
  }
  function k(dom, id) {
    r(u(`tracking-config?siteId=${dom}`))
      .then((res) => res?.ok ? res.json() : null)
      .then((config) => {
        if (config) {
          f = config.funnelSteps || [];
          e = config.customEvents || [];
          o(dom, id);
        }
      })
      .catch(() => {});
  }
  function o(dom, id) {
    const p = location.pathname;
    s.clear();
    f.forEach((step) => {
      if (step.step_type === "page_view") {
        const match =
          !step.url_pattern ||
          (step.match_type === "exact"
            ? p === step.url_pattern
            : p.includes(step.url_pattern));
        if (match) {
          r(u("track-funnel-step"), {
            step_id: step.id,
            session_id: id,
            site_domain: dom,
          })
          .catch(() => {});
        }
        return;
      }
      if (step.step_type !== "custom_event" || !step.event_config) return;
      const shouldTrack =
        !step.event_config.page_pattern ||
        p.includes(step.event_config.page_pattern);
      if (!shouldTrack) return;
      const { event_type, event_config } = step;
      if (event_type === "click" && event_config.selector) {
        m(event_config.selector, () =>
          r(u("track-funnel-step"), {
            step_id: step.id,
            session_id: id,
            site_domain: dom,
          })
        );
      } else if (event_type === "scroll") {
        n(step, dom, id, true);
      } else if (event_type === "click_link" && event_config.url_pattern) {
        v(event_config, () =>
          r(u("track-funnel-step"), {
            step_id: step.id,
            session_id: id,
            site_domain: dom,
          })
        );
      }
    });
    c = [];
    const clicks = e.filter(
      (ev) => ev.event_type === "click" && ev.event_selector
    );
    if (clicks.length) {
      c = clicks.map((ev) => ({ event: ev, domain: dom, sessionId: id }));
      if (!g) {
        g = true;
        document.addEventListener("click", (ev) => {
          c.forEach(({ event, domain, sessionId }) => {
            try {
              let target = ev.target.matches?.(event.event_selector)
                ? ev.target
                : ev.target.closest?.(event.event_selector);
              if (target) {
                w(event.name, domain, sessionId, {
                  selector: event.event_selector,
                  element: target.tagName.toLowerCase(),
                  text: target.textContent?.trim().substring(0, 100) || "",
                });
              }
            } catch {}
          });
        });
      }
    }
    e.forEach((ev) => {
      const { event_type, event_selector, trigger_config } = ev;
      if (event_type === "form_submit") {
        const sel = event_selector || "form";
        document.addEventListener("submit", (e) => {
          try {
            if (e.target.matches?.(sel)) {
              w(ev.name, dom, id, {
                form_id: e.target.id || "no-id",
                form_action: e.target.action || location.href,
              });
            }
          } catch {}
        });
      } else if (event_type === "scroll" && trigger_config?.scroll_percentage) {
        const pattern = trigger_config?.page_pattern;
        if (pattern) {
          if (pattern === "/" && p !== "/") return;
          else if (pattern.includes("*")) {
            try {
              const escaped = pattern
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                .replace(/\\\*/g, ".*");
              const regex = new RegExp("^" + escaped + "$");
              if (!regex.test(p)) return;
            } catch {
              if (!p.includes(pattern.replace(/\*/g, ""))) return;
            }
          } else if (!p.includes(pattern)) return;
        }
        n(ev, dom, id, false);
      } else if (event_type === "page_view") {
        const pattern = trigger_config?.page_pattern;
        if (!pattern || p.includes(pattern)) {
          w(ev.name, dom, id, {
            page_url: location.href,
            page_pattern: pattern || "all",
          });
        }
      }
    });
  }
  function m(sel, cb) {
    document.addEventListener("click", (e) => {
      try {
        let target = e.target.matches?.(sel)
          ? e.target
          : e.target.closest?.(sel);
        if (target) {
          cb({
            selector: sel,
            element: target.tagName.toLowerCase(),
            text: target.textContent?.trim().substring(0, 100) || "",
          });
        }
      } catch {}
    });
  }
  function n(config, dom, id, isFunnel) {
    const pct = isFunnel
      ? config.event_config?.scroll_percentage
      : config.trigger_config?.scroll_percentage;
    const key = `scroll_${config.id}_${pct || "any"}`;
    if (s.has(key)) return;
    s.add(key);
    let triggered = false;
    const handle = () => {
      if (triggered) return;
      const scrollPct =
        ((window.pageYOffset || document.documentElement.scrollTop) /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      if (!pct || scrollPct >= pct) {
        triggered = true;
        const data = {
          scroll_percentage: pct ? Math.round(scrollPct) : "any",
          target_percentage: pct,
        };
        if (isFunnel) {
          r(u("track-funnel-step"), {
            step_id: config.id,
            session_id: id,
            site_domain: dom,
          })
          .catch(() => {});
        } else {
          w(config.name, dom, id, data);
        }
        window.removeEventListener("scroll", handle);
      }
    };
    window.addEventListener("scroll", handle, { passive: true });
  }
  function v(config, cb) {
    const { url_pattern, link_text, exact_match } = config;
    document.addEventListener("click", (e) => {
      try {
        const link =
          e.target.tagName === "A" ? e.target : e.target.closest("a");
        if (!link?.href) return;
        let linkPath;
        try {
          linkPath = new URL(link.href).pathname;
        } catch {
          linkPath = link.href;
        }
        const urlMatches = exact_match
          ? linkPath === url_pattern
          : linkPath.includes(url_pattern);
        if (!urlMatches) return;
        if (link_text?.trim() && !link.textContent?.includes(link_text)) return;
        cb({
          url_pattern,
          link_href: link.href,
          link_text: link.textContent?.trim() || "",
          exact_match,
        });
      } catch {}
    });
  }
  function w(name, dom, id, metadata) {
    r(u("track-custom-event"), {
      site_domain: dom,
      event_name: name,
      session_id: id,
      page_url: location.href,
      metadata: metadata || {},
    });
  }
  window.hector = (action, eventName, data) => {
    if (action === "track" && eventName) {
      const id = localStorage.getItem("user_session_id");
      if (id) w(eventName, location.hostname, id, data || {});
    }
  };
  function startHeartbeat() {
    if (i) clearInterval(i);
    if (!document.hidden) h();
    i = setInterval(() => {
      if (Date.now() - t > 18e5) {
        stopHeartbeat();
      } else {
        h();
      }
    }, 6e4);
  }
  function stopHeartbeat() {
    if (i) {
      clearInterval(i);
      i = null;
    }
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopHeartbeat();
    } else {
      startHeartbeat();
    }
  });
  ["mousemove", "keypress", "scroll", "click", "touchstart"].forEach((ev) => {
    document.addEventListener(ev, () => {
      t = Date.now();
    });
  });
  let currentPath = location.pathname;
  const checkPath = () => {
    if (currentPath !== location.pathname) {
      currentPath = location.pathname;
      f = [];
      e = [];
      g = false;
      c = [];
      const id = d();
      k(location.hostname, id);
    }
  };
  setInterval(checkPath, 1000);
  window.addEventListener("popstate", checkPath);
  if (document.readyState === "complete") {
    startHeartbeat();
  } else {
    window.addEventListener("load", startHeartbeat, { once: true });
  }
})();
