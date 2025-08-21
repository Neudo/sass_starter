(function () {
  // Signaler que le script est chargé (pour la détection des bloqueurs)
  window.hectorAnalyticsLoaded = true;
  
  let heartbeatInterval = null;
  let lastActivityTime = Date.now();
  let trackedScrollEvents = new Set(); // Track scroll events per page to avoid duplicates
  let funnelSteps = []; // Cache for funnel steps to avoid repeated API calls
  let customEvents = []; // Cache for custom events to avoid repeated API calls
  
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

    // Send funnel tracking and custom events tracking (after getting site ID from main tracking)
    trackingPromise.then(() => {
      trackFunnels(sessionId);
      trackCustomEvents(sessionId);
    });
    
    lastActivityTime = Date.now();
  }

  function trackFunnels(sessionId) {
    // Use hectoranalytics.com domain for testing in both dev and prod
    const domain = window.location.hostname === 'localhost' 
      ? 'hectoranalytics.com' 
      : window.location.hostname;
    
    // Determine the API URL based on current environment
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api/track-funnel'
      : 'https://www.hectoranalytics.com/api/track-funnel';
    
    // Track page view first
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteId: domain,
        sessionId,
        currentUrl: window.location.href,
        eventType: 'page_view'
      }),
      keepalive: true,
    }).catch(() => {
      // silent fail
    });

    // Get funnel steps for custom event tracking if not already cached
    if (funnelSteps.length === 0) {
      loadFunnelSteps(domain, sessionId);
    } else {
      // Setup custom event listeners for cached steps
      setupCustomEventListeners(domain, sessionId);
    }
  }

  function loadFunnelSteps(domain, sessionId) {
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api/funnel-steps'
      : 'https://www.hectoranalytics.com/api/funnel-steps';
    
    fetch(`${apiUrl}?siteId=${domain}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to load funnel steps');
    }).then(steps => {
      funnelSteps = steps || [];
      setupCustomEventListeners(domain, sessionId);
    }).catch(() => {
      // silent fail
    });
  }

  function setupCustomEventListeners(domain, sessionId) {
    // Clear previous scroll events for this page
    const currentPage = window.location.pathname;
    trackedScrollEvents = new Set();

    // Setup event listeners
    funnelSteps.forEach(step => {
      if (step.step_type === 'custom_event' && step.event_type === 'click' && step.event_config?.selector) {
        // Check if this event should trigger on this page
        const shouldTrackOnThisPage = !step.event_config.page_pattern || 
          currentPage.includes(step.event_config.page_pattern);
        
        if (shouldTrackOnThisPage) {
          setupClickListener(step, domain, sessionId);
        }
      }
      
      if (step.step_type === 'custom_event' && step.event_type === 'scroll') {
        // Check if this event should trigger on this page
        const shouldTrackOnThisPage = !step.event_config?.page_pattern || 
          currentPage.includes(step.event_config.page_pattern);
        
        if (shouldTrackOnThisPage) {
          setupScrollListener(step, domain, sessionId);
        }
      }

      if (step.step_type === 'custom_event' && step.event_type === 'click_link' && step.event_config?.url_pattern) {
        // Check if this event should trigger on this page
        const shouldTrackOnThisPage = !step.event_config.page_pattern || 
          currentPage.includes(step.event_config.page_pattern);
        
        if (shouldTrackOnThisPage) {
          setupClickLinkListener(step, domain, sessionId);
        }
      }
    });
  }

  function setupClickListener(step, domain, sessionId) {
    const selector = step.event_config.selector;
    
    // Use event delegation to handle dynamically added elements
    document.addEventListener('click', function(event) {
      try {
        if (event.target.matches && event.target.matches(selector)) {
          trackCustomEvent(step, domain, sessionId, 'click', {
            selector: selector,
            element: event.target.tagName.toLowerCase(),
            text: event.target.textContent?.trim().substring(0, 100) || ''
          });
        } else if (event.target.closest && event.target.closest(selector)) {
          // Also check if the clicked element is inside the target selector
          const targetElement = event.target.closest(selector);
          trackCustomEvent(step, domain, sessionId, 'click', {
            selector: selector,
            element: targetElement.tagName.toLowerCase(),
            text: targetElement.textContent?.trim().substring(0, 100) || ''
          });
        }
      } catch (error) {
        // Invalid selector or other error - silent fail
        console.warn('Hector Analytics: Invalid selector for click tracking:', selector, error);
      }
    });
  }

  function setupScrollListener(step, domain, sessionId) {
    const scrollPercentage = step.event_config?.scroll_percentage;
    const eventKey = `scroll_${step.id}_${scrollPercentage || 'any'}`;
    
    // Avoid duplicate listeners for the same scroll event
    if (trackedScrollEvents.has(eventKey)) {
      return;
    }
    
    trackedScrollEvents.add(eventKey);
    
    let scrollTriggered = false;
    
    function handleScroll() {
      if (scrollTriggered) return;
      
      if (scrollPercentage) {
        // Calculate scroll percentage
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentScrollPercentage = (scrollTop / scrollHeight) * 100;
        
        if (currentScrollPercentage >= scrollPercentage) {
          scrollTriggered = true;
          trackCustomEvent(step, domain, sessionId, 'scroll', {
            scroll_percentage: Math.round(currentScrollPercentage),
            target_percentage: scrollPercentage
          });
          
          // Remove listener after triggering
          window.removeEventListener('scroll', handleScroll);
        }
      } else {
        // Track any scroll
        scrollTriggered = true;
        trackCustomEvent(step, domain, sessionId, 'scroll', {
          scroll_percentage: 'any'
        });
        
        // Remove listener after triggering
        window.removeEventListener('scroll', handleScroll);
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  function setupClickLinkListener(step, domain, sessionId) {
    const { url_pattern, link_text, exact_match } = step.event_config;
    
    // Use event delegation to handle dynamically added links
    document.addEventListener('click', function(event) {
      try {
        // Check if the clicked element is a link
        let linkElement = null;
        if (event.target.tagName === 'A') {
          linkElement = event.target;
        } else {
          // Check if clicked inside a link
          linkElement = event.target.closest('a');
        }
        
        if (!linkElement || !linkElement.href) return;
        
        // Extract the pathname from the link's href
        let linkPath;
        try {
          linkPath = new URL(linkElement.href).pathname;
        } catch (e) {
          // If it's a relative URL, use it as is
          linkPath = linkElement.href;
        }
        
        // Check if URL pattern matches
        const urlMatches = exact_match 
          ? linkPath === url_pattern 
          : linkPath.includes(url_pattern);
        
        if (!urlMatches) return;
        
        // Check if link text matches (if specified)
        if (link_text && link_text.trim() !== '') {
          const linkTextContent = linkElement.textContent?.trim() || '';
          if (!linkTextContent.includes(link_text)) return;
        }
        
        // Track the event
        trackCustomEvent(step, domain, sessionId, 'click_link', {
          url_pattern: url_pattern,
          link_href: linkElement.href,
          link_text: linkElement.textContent?.trim() || '',
          exact_match: exact_match
        });
        
      } catch (error) {
        // Invalid configuration or other error - silent fail
        console.warn('Hector Analytics: Error in click_link tracking:', error);
      }
    });
  }

  // Custom Events standalone tracking
  function trackCustomEvents(sessionId) {
    console.log('[Hector Debug] trackCustomEvents called with sessionId:', sessionId);
    // Use actual hostname for custom events
    const domain = window.location.hostname;
    
    console.log('[Hector Debug] Using domain for custom events:', domain);
    
    // Get custom events if not already cached
    if (customEvents.length === 0) {
      console.log('[Hector Debug] No cached custom events, loading from API...');
      loadCustomEvents(domain, sessionId);
    } else {
      console.log('[Hector Debug] Using cached custom events:', customEvents.length);
      // Setup custom event listeners for cached events
      setupStandaloneCustomEventListeners(domain, sessionId);
    }
  }

  function loadCustomEvents(domain, sessionId) {
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api/public-custom-events'
      : 'https://www.hectoranalytics.com/api/public-custom-events';
    
    console.log('[Hector Debug] Loading custom events from:', `${apiUrl}?siteId=${domain}`);
    
    fetch(`${apiUrl}?siteId=${domain}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then(response => {
      console.log('[Hector Debug] Custom events API response status:', response.status);
      if (response.ok) {
        return response.json();
      }
      // Log the error response
      return response.text().then(text => {
        console.error('[Hector Debug] API Error Response:', text);
        throw new Error(`Failed to load custom events: ${response.status} - ${text}`);
      });
    }).then(events => {
      console.log('[Hector Debug] Received custom events:', events);
      customEvents = (events || []).filter(event => event.is_active);
      console.log('[Hector Debug] Filtered active custom events:', customEvents.length);
      if (customEvents.length > 0) {
        setupStandaloneCustomEventListeners(domain, sessionId);
      } else {
        console.log('[Hector Debug] No active custom events found for this site');
      }
    }).catch((error) => {
      console.error('[Hector Debug] Error loading custom events:', error);
      // silent fail
    });
  }

  // Store click events configuration
  let clickEventsConfig = [];
  
  function setupStandaloneCustomEventListeners(domain, sessionId) {
    console.log('[Hector Debug] Setting up listeners for', customEvents.length, 'custom events');
    
    // Clear previous click events configuration
    clickEventsConfig = [];
    
    // Collect all click events first
    const clickEvents = customEvents.filter(event => event.event_type === 'click' && event.event_selector);
    if (clickEvents.length > 0) {
      clickEventsConfig = clickEvents.map(event => ({
        event,
        domain,
        sessionId
      }));
      setupGlobalClickListener();
    }
    
    // Setup other event types
    customEvents.forEach(event => {
      console.log('[Hector Debug] Setting up listener for event:', event.name, event.event_type);
      
      if (event.event_type === 'form_submit') {
        setupStandaloneFormListener(event, domain, sessionId);
      } else if (event.event_type === 'scroll' && event.trigger_config?.scroll_percentage) {
        setupStandaloneScrollListener(event, domain, sessionId);
      } else if (event.event_type === 'page_view') {
        setupStandalonePageViewListener(event, domain, sessionId);
      }
    });
  }

  // Global click listener that handles all click events
  let globalClickListenerAdded = false;
  
  function setupGlobalClickListener() {
    // Only add the global listener once
    if (globalClickListenerAdded) {
      console.log('[Hector Debug] Global click listener already added, skipping');
      return;
    }
    
    globalClickListenerAdded = true;
    console.log('[Hector Debug] Adding global click listener for', clickEventsConfig.length, 'click events');
    
    document.addEventListener('click', function(clickEvent) {
      console.log('[Hector Debug] Global click detected on:', clickEvent.target);
      
      // Check each click event configuration
      clickEventsConfig.forEach(config => {
        const { event, domain, sessionId } = config;
        const selector = event.event_selector;
        
        console.log('[Hector Debug] Checking selector:', selector, 'for event:', event.name);
        
        try {
          let matched = false;
          let targetElement = null;
          
          if (clickEvent.target.matches && clickEvent.target.matches(selector)) {
            matched = true;
            targetElement = clickEvent.target;
            console.log('[Hector Debug] Direct match for selector:', selector);
          } else if (clickEvent.target.closest && clickEvent.target.closest(selector)) {
            matched = true;
            targetElement = clickEvent.target.closest(selector);
            console.log('[Hector Debug] Closest match for selector:', selector);
          }
          
          if (matched && targetElement) {
            console.log('[Hector Debug] Click matches selector:', selector, 'triggering event:', event.name);
            triggerCustomEvent(event.name, domain, sessionId, {
              selector: selector,
              element: targetElement.tagName.toLowerCase(),
              text: targetElement.textContent?.trim().substring(0, 100) || ''
            });
          }
        } catch (error) {
          console.warn('Hector Analytics: Invalid selector for custom event:', selector, error);
        }
      });
    });
  }

  function setupCustomEventListener(event, domain, sessionId) {
    // This function is no longer needed as click events are handled globally
    // Keeping it for backward compatibility if called elsewhere
    const eventType = event.event_type;
    
    if (eventType === 'form_submit') {
      setupStandaloneFormListener(event, domain, sessionId);
    } else if (eventType === 'scroll' && event.trigger_config?.scroll_percentage) {
      setupStandaloneScrollListener(event, domain, sessionId);
    } else if (eventType === 'page_view') {
      setupStandalonePageViewListener(event, domain, sessionId);
    }
  }

  function setupStandaloneFormListener(event, domain, sessionId) {
    const selector = event.event_selector || 'form';
    
    document.addEventListener('submit', function(submitEvent) {
      try {
        if (submitEvent.target.matches && submitEvent.target.matches(selector)) {
          triggerCustomEvent(event.name, domain, sessionId, {
            form_id: submitEvent.target.id || 'no-id',
            form_action: submitEvent.target.action || window.location.href
          });
        }
      } catch (error) {
        console.warn('Hector Analytics: Error in form submit tracking:', error);
      }
    });
  }

  function setupStandaloneScrollListener(event, domain, sessionId) {
    const scrollPercentage = event.trigger_config.scroll_percentage;
    const eventKey = `custom_scroll_${event.id}_${scrollPercentage}`;
    
    if (trackedScrollEvents.has(eventKey)) {
      return;
    }
    
    trackedScrollEvents.add(eventKey);
    let scrollTriggered = false;
    
    function handleScroll() {
      if (scrollTriggered) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScrollPercentage = (scrollTop / scrollHeight) * 100;
      
      if (currentScrollPercentage >= scrollPercentage) {
        scrollTriggered = true;
        triggerCustomEvent(event.name, domain, sessionId, {
          scroll_percentage: Math.round(currentScrollPercentage),
          target_percentage: scrollPercentage
        });
        
        window.removeEventListener('scroll', handleScroll);
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  function setupStandalonePageViewListener(event, domain, sessionId) {
    const pagePattern = event.trigger_config?.page_pattern;
    const currentPath = window.location.pathname;
    
    // Check if current page matches the pattern
    if (!pagePattern || currentPath.includes(pagePattern)) {
      triggerCustomEvent(event.name, domain, sessionId, {
        page_url: window.location.href,
        page_pattern: pagePattern || 'all'
      });
    }
  }

  function triggerCustomEvent(eventName, domain, sessionId, metadata) {
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api/track-custom-event'
      : 'https://www.hectoranalytics.com/api/track-custom-event';
    
    console.log('[Hector Debug] Triggering custom event:', eventName, 'to:', apiUrl);
    console.log('[Hector Debug] Event data:', {
      site_domain: domain,
      event_name: eventName,
      session_id: sessionId,
      page_url: window.location.href,
      metadata: metadata || {}
    });
    
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site_domain: domain,
        event_name: eventName,
        session_id: sessionId,
        page_url: window.location.href,
        metadata: metadata || {}
      }),
      keepalive: true,
    }).then(response => {
      console.log('[Hector Debug] Custom event API response status:', response.status);
      return response.json();
    }).then(data => {
      console.log('[Hector Debug] Custom event API response:', data);
    }).catch((error) => {
      console.log('[Hector Debug] Custom event API error:', error);
    });
  }

  // Global function to trigger custom events programmatically
  window.hector = function(action, eventName, data) {
    if (action === 'track' && eventName) {
      const sessionId = localStorage.getItem("user_session_id");
      // Use actual hostname for custom events
      const domain = window.location.hostname;
      
      if (sessionId) {
        triggerCustomEvent(eventName, domain, sessionId, data || {});
      }
    }
  };

  function trackCustomEvent(step, domain, sessionId, eventType, eventData) {
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api/track-funnel'
      : 'https://www.hectoranalytics.com/api/track-funnel';
    
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteId: domain,
        sessionId,
        currentUrl: window.location.href,
        eventType: 'custom_event',
        customEvent: {
          step_id: step.id,
          funnel_id: step.funnel_id,
          step_number: step.step_number,
          event_type: eventType,
          event_data: eventData
        }
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

  // Handle page navigation for single-page applications
  let currentPath = window.location.pathname;
  function checkForPathChange() {
    if (currentPath !== window.location.pathname) {
      currentPath = window.location.pathname;
      // Clear funnel steps and custom events cache to reload for new page
      funnelSteps = [];
      customEvents = [];
      // Reset click listener flag for new page
      globalClickListenerAdded = false;
      clickEventsConfig = [];
      // Restart tracking for the new page
      const sessionId = localStorage.getItem("user_session_id");
      if (sessionId) {
        trackFunnels(sessionId);
        trackCustomEvents(sessionId);
      }
    }
  }

  // Check for path changes periodically (for SPA navigation)
  setInterval(checkForPathChange, 1000);

  // Also listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', checkForPathChange);

  // Exécute de suite ou si load déjà passé
  if (document.readyState === "complete") {
    startHeartbeat();
  } else {
    window.addEventListener("load", () => startHeartbeat(), { once: true });
  }
})();
