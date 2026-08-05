// WELO — Install Prompt (PWA)
// Shows a custom install banner when the app is installable.
// Handles both Android (beforeinstallprompt) and iOS (manual instructions).
// Only shows once per session, and respects user dismissal.

(function() {
'use strict';

var DISMISS_KEY = 'welo_install_dismissed';
var deferredPrompt = null;

// Don't show if already installed (standalone mode)
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

// Don't show if user already dismissed
function wasDismissed() {
  var dismissed = localStorage.getItem(DISMISS_KEY);
  if (!dismissed) return false;
  // Show again after 7 days
  var days = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
  return days < 7;
}

function dismiss() {
  localStorage.setItem(DISMISS_KEY, String(Date.now()));
  hideBanner();
}

function hideBanner() {
  var el = document.getElementById('welo-install-banner');
  if (el) {
    el.style.transform = 'translateY(100%)';
    setTimeout(function() { el.remove(); }, 300);
  }
}

// Detect iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Android: capture the install event
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredPrompt = e;
});

// Show install banner
function showInstallBanner() {
  if (isStandalone()) return;
  if (wasDismissed()) return;
  if (document.getElementById('welo-install-banner')) return;

  // Wait for onboarding to finish
  var onboarding = document.getElementById('onboarding');
  if (onboarding && onboarding.style.display !== 'none') return;

  var isIos = isIOS();
  var canInstall = !!deferredPrompt;

  // If not iOS and can't install (already installed or not supported), don't show
  if (!isIos && !canInstall) return;

  var banner = document.createElement('div');
  banner.id = 'welo-install-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Instalar WELO');
  
  var innerHtml = '<div style="position:fixed;bottom:0;left:0;right:0;z-index:9999;padding:16px 20px;background:white;box-shadow:0 -4px 24px rgba(0,0,0,0.12);font-family:Inter,-apple-system,sans-serif;border-radius:20px 20px 0 0;transform:translateY(0);transition:transform 0.3s;">';
  innerHtml += '<div style="display:flex;align-items:center;gap:14px;">';
  innerHtml += '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#ff6b9d,#c44569);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;">✨</div>';
  innerHtml += '<div style="flex:1;">';
  innerHtml += '<p style="font-size:0.9rem;font-weight:700;color:#2d3436;margin:0;">Instalar WELO</p>';

  if (isIos) {
    innerHtml += '<p style="font-size:0.75rem;color:#636e72;margin:4px 0 0;">Toca <strong>Compartir</strong> ↑ y luego <strong>"Añadir a inicio"</strong></p>';
  } else {
    innerHtml += '<p style="font-size:0.75rem;color:#636e72;margin:4px 0 0;">Añádela a tu móvil como app. Ocupa 0 espacio.</p>';
  }

  innerHtml += '</div>';

  if (!isIos && canInstall) {
    innerHtml += '<button id="welo-install-btn" style="padding:10px 18px;background:linear-gradient(135deg,#ff6b9d,#c44569);color:white;border:none;border-radius:50px;font-size:0.8rem;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;">Instalar</button>';
  }

  innerHtml += '<button id="welo-install-dismiss" style="background:none;border:none;font-size:1.2rem;color:#aaa;cursor:pointer;padding:8px;" aria-label="Cerrar">✕</button>';
  innerHtml += '</div></div>';

  banner.innerHTML = innerHtml;
  document.body.appendChild(banner);

  // Install button handler (Android/Chrome)
  var installBtn = document.getElementById('welo-install-btn');
  if (installBtn && deferredPrompt) {
    installBtn.addEventListener('click', function() {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(choice) {
        if (choice.outcome === 'accepted') {
          if (window.welo && window.welo.track) window.welo.track('pwa_installed', { platform: 'android' });
        }
        deferredPrompt = null;
        hideBanner();
      });
    });
  }

  // Dismiss handler
  document.getElementById('welo-install-dismiss').addEventListener('click', dismiss);

  // Track impression
  if (window.welo && window.welo.track) window.welo.track('install_banner_shown', { platform: isIos ? 'ios' : 'android' });
}

// Show after 3 seconds in the app (not during onboarding)
function scheduleShow() {
  setTimeout(function() {
    showInstallBanner();
  }, 3000);
}

// Listen for app display (onboarding done)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleShow);
} else {
  scheduleShow();
}

})();
