(function () {
  window.hectorAnalyticsLoaded = true;
  
  let heartbeatInterval, lastActivityTime = Date.now();
  let trackedScrollEvents = new Set();
  let funnelSteps = [], customEvents = [];
  let clickEventsConfig = [], globalClickListenerAdded = false;
  
  // API URL helper
  const getApiUrl = (path) => {
    const isLocal = window.location.hostname === 'localhost';
    const base = isLocal ? 'http://localhost:3000' : 'https://www.hectoranalytics.com';
    return `${base}/api/${path}`;
  };
  
  // Fetch helper with silent fail
  const fetchApi = (url, data) => {
    return fetch(url, {
      method: data ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
      keepalive: true
    }).catch(() => {});
  };
  
  // Get or create session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem("user_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("user_session_id", sessionId);
    }
    return sessionId;
  };
  
  // Main heartbeat function
  function sendHeartbeat() {
    if (document.hidden) return;
    
    const sessionId = getSessionId();
    const domain = window.location.hostname;
    
    fetchApi(getApiUrl('track'), {
      sessionId,
      page: location.pathname,
      domain,
      referrer: document.referrer || null,
      urlParams: window.location.search
    }).then(() => {
      trackFunnels(sessionId);
      trackCustomEvents(sessionId);
    });
    
    lastActivityTime = Date.now();
  }
  
  // Track funnels - simplified approach
  function trackFunnels(sessionId) {
    const domain = window.location.hostname;
    
    if (!funnelSteps.length) {
      console.log('[Hector Debug] Loading funnel steps for domain:', domain);
      fetchApi(getApiUrl('public-funnel-steps') + `?siteId=${domain}`)
        .then(r => r?.ok ? r.json() : null)
        .then(steps => {
          console.log('[Hector Debug] Received funnel steps:', steps);
          if (steps && steps.length > 0) {
            funnelSteps = steps;
            setupFunnelListeners(domain, sessionId);
          } else {
            console.log('[Hector Debug] No funnel steps found for domain:', domain);
          }
        })
        .catch(error => {
          console.error('[Hector Debug] Error loading funnel steps:', error);
        });
    } else {
      console.log('[Hector Debug] Using cached funnel steps:', funnelSteps.length);
      setupFunnelListeners(domain, sessionId);
    }
  }
  
  // Setup funnel event listeners
  function setupFunnelListeners(domain, sessionId) {
    const currentPage = window.location.pathname;
    trackedScrollEvents = new Set();
    
    funnelSteps.forEach(step => {
      // Handle page_view funnel steps
      if (step.step_type === 'page_view') {
        const shouldTrack = !step.url_pattern || 
          (step.match_type === 'exact' ? currentPage === step.url_pattern : 
           currentPage.includes(step.url_pattern));
        
        if (shouldTrack) {
          console.log('[Hector Debug] Triggering page_view funnel step:', step.name);
          trackFunnelEvent(step, domain, sessionId, 'page_view', {
            page_url: window.location.href,
            page_pattern: step.url_pattern || 'all'
          });
        }
        return;
      }
      
      // Handle custom_event funnel steps
      if (step.step_type !== 'custom_event' || !step.event_config) return;
      
      const shouldTrack = !step.event_config.page_pattern || 
        currentPage.includes(step.event_config.page_pattern);
      
      if (!shouldTrack) return;
      
      const { event_type, event_config } = step;
      
      if (event_type === 'click' && event_config.selector) {
        setupClickHandler(event_config.selector, data => 
          trackFunnelEvent(step, domain, sessionId, 'click', data));
      } else if (event_type === 'scroll') {
        setupScrollHandler(step, domain, sessionId, true);
      } else if (event_type === 'click_link' && event_config.url_pattern) {
        setupLinkHandler(event_config, data => 
          trackFunnelEvent(step, domain, sessionId, 'click_link', data));
      }
    });
  }
  
  // Generic click handler
  function setupClickHandler(selector, callback) {
    document.addEventListener('click', e => {
      try {
        let target = e.target.matches?.(selector) ? e.target : 
                    e.target.closest?.(selector);
        if (target) {
          callback({
            selector,
            element: target.tagName.toLowerCase(),
            text: target.textContent?.trim().substring(0, 100) || ''
          });
        }
      } catch {}
    });
  }
  
  // Generic scroll handler
  function setupScrollHandler(config, domain, sessionId, isFunnel) {
    const percentage = isFunnel ? config.event_config?.scroll_percentage : 
                                 config.trigger_config?.scroll_percentage;
    const eventKey = `scroll_${config.id}_${percentage || 'any'}`;
    
    if (trackedScrollEvents.has(eventKey)) return;
    trackedScrollEvents.add(eventKey);
    
    let triggered = false;
    const handleScroll = () => {
      if (triggered) return;
      
      const scrollPct = (window.pageYOffset || document.documentElement.scrollTop) / 
                       (document.documentElement.scrollHeight - window.innerHeight) * 100;
      
      if (!percentage || scrollPct >= percentage) {
        triggered = true;
        const data = {
          scroll_percentage: percentage ? Math.round(scrollPct) : 'any',
          target_percentage: percentage
        };
        
        if (isFunnel) {
          trackFunnelEvent(config, domain, sessionId, 'scroll', data);
        } else {
          triggerCustomEvent(config.name, domain, sessionId, data);
        }
        
        window.removeEventListener('scroll', handleScroll);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  
  // Link click handler
  function setupLinkHandler(config, callback) {
    const { url_pattern, link_text, exact_match } = config;
    
    document.addEventListener('click', e => {
      try {
        const link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
        if (!link?.href) return;
        
        let linkPath;
        try {
          linkPath = new URL(link.href).pathname;
        } catch {
          linkPath = link.href;
        }
        
        const urlMatches = exact_match ? linkPath === url_pattern : 
                                        linkPath.includes(url_pattern);
        
        if (!urlMatches) return;
        
        if (link_text?.trim() && !link.textContent?.includes(link_text)) return;
        
        callback({
          url_pattern,
          link_href: link.href,
          link_text: link.textContent?.trim() || '',
          exact_match
        });
      } catch {}
    });
  }
  
  // Track custom events
  function trackCustomEvents(sessionId) {
    const domain = window.location.hostname;
    
    if (!customEvents.length) {
      fetchApi(getApiUrl('public-custom-events') + `?siteId=${domain}`)
        .then(r => r?.ok ? r.json() : null)
        .then(events => {
          if (events) {
            customEvents = events.filter(e => e.is_active);
            if (customEvents.length) setupCustomListeners(domain, sessionId);
          }
        });
    } else {
      setupCustomListeners(domain, sessionId);
    }
  }
  
  // Setup custom event listeners
  function setupCustomListeners(domain, sessionId) {
    clickEventsConfig = [];
    
    // Handle click events with single listener
    const clickEvents = customEvents.filter(e => e.event_type === 'click' && e.event_selector);
    if (clickEvents.length) {
      clickEventsConfig = clickEvents.map(event => ({ event, domain, sessionId }));
      
      if (!globalClickListenerAdded) {
        globalClickListenerAdded = true;
        document.addEventListener('click', e => {
          clickEventsConfig.forEach(({ event, domain, sessionId }) => {
            try {
              let target = e.target.matches?.(event.event_selector) ? e.target : 
                          e.target.closest?.(event.event_selector);
              if (target) {
                triggerCustomEvent(event.name, domain, sessionId, {
                  selector: event.event_selector,
                  element: target.tagName.toLowerCase(),
                  text: target.textContent?.trim().substring(0, 100) || ''
                });
              }
            } catch {}
          });
        });
      }
    }
    
    // Handle other event types
    customEvents.forEach(event => {
      const { event_type, event_selector, trigger_config } = event;
      
      if (event_type === 'form_submit') {
        const selector = event_selector || 'form';
        document.addEventListener('submit', e => {
          try {
            if (e.target.matches?.(selector)) {
              triggerCustomEvent(event.name, domain, sessionId, {
                form_id: e.target.id || 'no-id',
                form_action: e.target.action || window.location.href
              });
            }
          } catch {}
        });
      } else if (event_type === 'scroll' && trigger_config?.scroll_percentage) {
        setupScrollHandler(event, domain, sessionId, false);
      } else if (event_type === 'page_view') {
        const pattern = trigger_config?.page_pattern;
        if (!pattern || window.location.pathname.includes(pattern)) {
          triggerCustomEvent(event.name, domain, sessionId, {
            page_url: window.location.href,
            page_pattern: pattern || 'all'
          });
        }
      }
    });
  }
  
  // Send custom event
  function triggerCustomEvent(eventName, domain, sessionId, metadata) {
    fetchApi(getApiUrl('track-custom-event'), {
      site_domain: domain,
      event_name: eventName,
      session_id: sessionId,
      page_url: window.location.href,
      metadata: metadata || {}
    });
  }
  
  // Track funnel event - simplified to just increment step count
  function trackFunnelEvent(step, domain, sessionId, eventType, eventData) {
    console.log('[Hector Debug] Tracking funnel step:', {
      step_name: step.name,
      step_id: step.id,
      domain,
      eventType
    });
    
    fetchApi(getApiUrl('track-funnel-step'), {
      step_id: step.id,
      session_id: sessionId,
      site_domain: domain
    }).then(response => response.json())
    .then(data => {
      if (data.already_completed) {
        console.log('[Hector Debug] Step already completed by this session:', step.name);
      } else if (data.success) {
        console.log('[Hector Debug] Funnel step completed:', step.name);
      }
    }).catch(error => {
      console.error('[Hector Debug] Funnel step error:', error);
    });
  }
  
  // Global API for programmatic tracking
  window.hector = (action, eventName, data) => {
    if (action === 'track' && eventName) {
      const sessionId = localStorage.getItem("user_session_id");
      if (sessionId) {
        triggerCustomEvent(eventName, window.location.hostname, sessionId, data || {});
      }
    }
  };
  
  // Heartbeat management
  function startHeartbeat() {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (!document.hidden) sendHeartbeat();
    
    heartbeatInterval = setInterval(() => {
      if (Date.now() - lastActivityTime > 18e5) { // 30 min
        stopHeartbeat();
      } else {
        sendHeartbeat();
      }
    }, 6e4); // 60 sec
  }
  
  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }
  
  // Event listeners
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stopHeartbeat() : startHeartbeat();
  });
  
  // Activity tracking
  ['mousemove', 'keypress', 'scroll', 'click', 'touchstart'].forEach(event => {
    document.addEventListener(event, () => { lastActivityTime = Date.now(); });
  });
  
  // SPA navigation handling
  let currentPath = window.location.pathname;
  const checkPathChange = () => {
    if (currentPath !== window.location.pathname) {
      currentPath = window.location.pathname;
      funnelSteps = [];
      customEvents = [];
      globalClickListenerAdded = false;
      clickEventsConfig = [];
      
      const sessionId = getSessionId();
      trackFunnels(sessionId);
      trackCustomEvents(sessionId);
    }
  };
  
  setInterval(checkPathChange, 1000);
  window.addEventListener('popstate', checkPathChange);
  
  // Initialize
  if (document.readyState === "complete") {
    startHeartbeat();
  } else {
    window.addEventListener("load", startHeartbeat, { once: true });
  }
})();