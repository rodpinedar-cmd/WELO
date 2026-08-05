// WELO — GDPR Consent Banner
// Single source of truth for cookie consent across all pages.
// Must be loaded AFTER PostHog init (which uses opt_out_capturing_by_default: true).

(function() {
'use strict';

var CONSENT_KEY = 'welo_consent';
var PRIVACY_URL = 'privacy.html#cookies';

function getConsent() {
  return localStorage.getItem(CONSENT_KEY);
}

function setConsent(value) {
  localStorage.setItem(CONSENT_KEY, value);
}

function applyConsent(value) {
  if (value === 'accepted') {
    if (window.posthog && window.posthog.opt_in_capturing) {
      window.posthog.opt_in_capturing();
    }
  } else {
    if (window.posthog && window.posthog.opt_out_capturing) {
      window.posthog.opt_out_capturing();
    }
  }
}

function hideBanner() {
  var el = document.getElementById('welo-consent-banner');
  if (el) el.remove();
}

function accept() {
  setConsent('accepted');
  applyConsent('accepted');
  hideBanner();
}

function reject() {
  setConsent('rejected');
  applyConsent('rejected');
  hideBanner();
}

function showBanner() {
  if (document.getElementById('welo-consent-banner')) return;

  var banner = document.createElement('div');
  banner.id = 'welo-consent-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Consentimiento de cookies');
  banner.innerHTML = ''
    + '<div style="position:fixed;bottom:0;left:0;right:0;z-index:99999;padding:16px 20px;background:white;box-shadow:0 -4px 20px rgba(0,0,0,0.1);font-family:Inter,-apple-system,sans-serif;display:flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:center;">'
    + '<p style="font-size:0.85rem;color:#2d3436;margin:0;flex:1;min-width:200px;">Usamos cookies analíticas para mejorar WELO. No vendemos tus datos. Puedes aceptar o rechazar.</p>'
    + '<div style="display:flex;gap:8px;flex-shrink:0;">'
    + '<button id="welo-consent-accept" style="padding:10px 20px;background:linear-gradient(135deg,#ff6b9d,#c44569);color:white;border:none;border-radius:50px;font-size:0.85rem;font-weight:600;cursor:pointer;font-family:inherit;">Aceptar</button>'
    + '<button id="welo-consent-reject" style="padding:10px 20px;background:white;color:#636e72;border:2px solid #eee;border-radius:50px;font-size:0.85rem;font-weight:600;cursor:pointer;font-family:inherit;">Rechazar</button>'
    + '<a href="' + PRIVACY_URL + '" style="padding:10px 12px;font-size:0.8rem;color:#636e72;text-decoration:underline;">Más info</a>'
    + '</div>'
    + '</div>';

  document.body.appendChild(banner);

  document.getElementById('welo-consent-accept').addEventListener('click', accept);
  document.getElementById('welo-consent-reject').addEventListener('click', reject);
}

// Main logic
function init() {
  var consent = getConsent();

  if (consent === 'accepted') {
    applyConsent('accepted');
  } else if (consent === 'rejected') {
    applyConsent('rejected');
  } else {
    // No decision yet — show banner, remain opted out (default)
    showBanner();
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
