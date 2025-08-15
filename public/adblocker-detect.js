/**
 * Détection des bloqueurs de publicité
 * Plusieurs méthodes pour détecter si le script analytics est bloqué
 */

(function() {
  // Méthode 1: Vérifier si le script principal est chargé
  function checkScriptLoaded() {
    // Créer un flag global quand le script analytics est exécuté
    window.hectorAnalyticsLoaded = false;
    
    // Vérifier après un délai si le flag a été défini
    setTimeout(() => {
      if (!window.hectorAnalyticsLoaded) {
        handleBlockedScript('Script analytics non chargé');
      }
    }, 2000);
  }

  // Méthode 2: Tester une requête vers l'API de tracking
  function checkAPIAccess() {
    const testEndpoint = 'https://www.hectoranalytics.com/api/track';
    
    // Créer une requête de test
    fetch(testEndpoint, {
      method: 'HEAD',
      mode: 'no-cors'
    })
    .then(() => {
      console.log('Analytics API accessible');
    })
    .catch(() => {
      handleBlockedScript('API de tracking bloquée');
    });
  }

  // Méthode 3: Créer un élément "bait" (appât) pour les bloqueurs
  function createBaitElement() {
    const bait = document.createElement('div');
    bait.className = 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links analytics-pixel';
    bait.id = 'analytics-test';
    bait.style.cssText = 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;';
    
    document.body.appendChild(bait);
    
    // Vérifier si l'élément est masqué ou supprimé
    setTimeout(() => {
      const element = document.getElementById('analytics-test');
      if (!element || element.offsetParent === null || 
          element.offsetHeight === 0 || element.offsetWidth === 0 ||
          window.getComputedStyle(element).display === 'none' ||
          window.getComputedStyle(element).visibility === 'hidden') {
        handleBlockedScript('Élément de test bloqué');
      }
      // Nettoyer
      if (element) {
        element.remove();
      }
    }, 100);
  }

  // Méthode 4: Vérifier localStorage/sessionStorage
  function checkStorageAccess() {
    try {
      const testKey = 'hector_analytics_test';
      localStorage.setItem(testKey, '1');
      const value = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (value !== '1') {
        handleBlockedScript('Accès au localStorage bloqué');
      }
    } catch (e) {
      handleBlockedScript('Storage non disponible');
    }
  }

  // Gestionnaire quand un blocage est détecté
  function handleBlockedScript(reason) {
    // Émettre un événement personnalisé
    window.dispatchEvent(new CustomEvent('analyticsBlocked', {
      detail: { reason, timestamp: Date.now() }
    }));
    
    // Stocker l'état
    window.analyticsBlocked = true;
    
    // Log pour debug (optionnel)
    console.warn('Hector Analytics bloqué:', reason);
    
    // Optionnel: Essayer une méthode de fallback
    tryFallbackTracking();
  }

  // Méthode de fallback si le script principal est bloqué
  function tryFallbackTracking() {
    // Utiliser une approche server-side ou first-party
    // Par exemple, envoyer via votre propre domaine
    const fallbackEndpoint = '/api/analytics/fallback';
    
    fetch(fallbackEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: location.pathname,
        domain: window.location.hostname,
        referrer: document.referrer || null,
        blocked: true,
        timestamp: Date.now()
      })
    }).catch(() => {
      // Même le fallback est bloqué
      console.error('Fallback tracking aussi bloqué');
    });
  }

  // Méthode pour vérifier depuis votre application
  window.isAnalyticsBlocked = function() {
    return window.analyticsBlocked === true;
  };

  // Méthode pour obtenir le statut détaillé
  window.getAnalyticsStatus = function() {
    return {
      blocked: window.analyticsBlocked === true,
      scriptLoaded: window.hectorAnalyticsLoaded === true,
      apiAccessible: null, // À remplir après test
      storageAvailable: checkStorageAvailable()
    };
  };

  function checkStorageAvailable() {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
  }

  // Lancer les vérifications
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      checkScriptLoaded();
      checkAPIAccess();
      createBaitElement();
      checkStorageAccess();
    });
  } else {
    // DOM déjà chargé
    checkScriptLoaded();
    checkAPIAccess();
    createBaitElement();
    checkStorageAccess();
  }
})();