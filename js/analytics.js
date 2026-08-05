// WELO — Analytics Service
// Unified tracking interface. Delegates to PostHog when available.
// Falls back to console.log silently. Never blocks UI. Never throws.

(function() {
'use strict';

/* ============================================================
   CONFIGURATION
   Replace PLACEHOLDER with real PostHog API key to activate.
   ============================================================ */
const ANALYTICS_CONFIG = {
  // PostHog project API key
  apiKey: 'phc_ye8DtzRMohohkrpM5nS2AmjE8tMGCwfmQ7v3ZuzDbx8f',
  // PostHog host — EU Cloud
  host: 'https://eu.i.posthog.com',
  // Feature toggles
  enabled: true,
  debug: true,         // console.log all events (disable in production)
  anonymizeIp: true,
  persistence: 'localStorage',
  autocapture: false,  // We track manually — no auto DOM events
  capturePageview: false
};

const IS_PLACEHOLDER = ANALYTICS_CONFIG.apiKey.includes('PLACEHOLDER');

/* ============================================================
   POSTHOG LOADER
   Loads PostHog SDK async. Non-blocking. Graceful failure.
   ============================================================ */
let posthogReady = false;

function loadPostHog() {
  if (IS_PLACEHOLDER) return; // Don't load SDK with placeholder key
  try {
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init(ANALYTICS_CONFIG.apiKey, {
      api_host: ANALYTICS_CONFIG.host,
      persistence: ANALYTICS_CONFIG.persistence,
      autocapture: ANALYTICS_CONFIG.autocapture,
      capture_pageview: ANALYTICS_CONFIG.capturePageview,
      ip: !ANALYTICS_CONFIG.anonymizeIp,
      opt_out_capturing_by_default: true,
      loaded: function() {
        // Respect stored consent decision
        var consent = localStorage.getItem('welo_consent');
        if (consent === 'accepted') {
          window.posthog.opt_in_capturing();
        }
        posthogReady = true;
      }
    });
  } catch (e) {
    // Silently fail — analytics should never break the app
  }
}

/* ============================================================
   PUBLIC API — window.welo
   Single interface for all tracking across WELO.
   ============================================================ */
window.welo = window.welo || {};

window.welo.track = function(event, properties) {
  if (!ANALYTICS_CONFIG.enabled) return;
  var props = properties || {};
  // Always include timestamp and app version
  props._timestamp = Date.now();
  props._version = '2.0.0';

  // Debug mode: always log to console
  if (ANALYTICS_CONFIG.debug) {
    console.log('[WELO Track]', event, props);
  }

  // Send to PostHog if available
  if (!IS_PLACEHOLDER && posthogReady && window.posthog && window.posthog.capture) {
    try { window.posthog.capture(event, props); } catch (e) { /* silent */ }
  }
};

window.welo.identify = function(userId, traits) {
  if (!ANALYTICS_CONFIG.enabled) return;

  if (ANALYTICS_CONFIG.debug) {
    console.log('[WELO Identify]', userId, traits);
  }

  if (!IS_PLACEHOLDER && posthogReady && window.posthog && window.posthog.identify) {
    try { window.posthog.identify(userId, traits || {}); } catch (e) { /* silent */ }
  }
};

window.welo.reset = function() {
  if (!ANALYTICS_CONFIG.enabled) return;

  if (ANALYTICS_CONFIG.debug) {
    console.log('[WELO Reset]');
  }

  if (!IS_PLACEHOLDER && posthogReady && window.posthog && window.posthog.reset) {
    try { window.posthog.reset(); } catch (e) { /* silent */ }
  }
};

window.welo.getFlag = function(flagName, fallback) {
  if (!ANALYTICS_CONFIG.enabled) return fallback;
  if (IS_PLACEHOLDER || !posthogReady || !window.posthog || !window.posthog.getFeatureFlag) {
    return fallback;
  }
  try {
    var value = window.posthog.getFeatureFlag(flagName);
    if (ANALYTICS_CONFIG.debug) {
      console.log('[WELO Flag]', flagName, '=', value || fallback);
    }
    return value || fallback;
  } catch (e) {
    return fallback;
  }
};

/* ============================================================
   INITIALIZATION
   Load PostHog async on page load. Never blocks render.
   ============================================================ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPostHog);
} else {
  loadPostHog();
}

})();
