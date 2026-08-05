// WELO — Install Prompt (PWA)
// Shows a custom install banner when the app is installable.
// Handles both Android (beforeinstallprompt) and iOS (manual instructions).
// Respects user dismissal with 7-day cooldown.

(function() {
'use strict';

var DISMISS_KEY = 'welo_install_dismissed';
var deferredPrompt = null;

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

function wasDismissed() {
  var dismissed = localStorage.getItem(DISMISS_KEY);
  if (!dismissed) return false;
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
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    setTimeout(function() { el.remove(); }, 300);
  }
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Capture the install event (Android/Chrome)
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredPrompt = e;
});

function showInstallBanner() {
  if (isStandalone()) return;
  if (wasDismissed()) return;
  if (document.getElementById('welo-install-banner')) return;

  // Don't show during onboarding
  var onboarding = document.getElementById('onboarding');
  if (onboarding && onboarding.style.display !== 'none') return;

  // Don't show if push prompt is visible
  if (document.getElementById('welo-push-prompt')) return;

  var isIos = isIOS();
  var canInstall = !!deferredPrompt;

  if (!isIos && !canInstall) return;

  var banner = document.createElement('div');
  banner.id = 'welo-install-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Instalar WELO');

  var html = '';
  html += '<div style="position:fixed;bottom:16px;left:16px;right:16px;z-index:9999;padding:20px;background:white;box-shadow:0 8px 32px rgba(0,0,0,0.15);font-family:Inter,-apple-system,sans-serif;border-radius:20px;opacity:0;transform:translateY(20px);transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);">';
  
  // Header with icon and close
  html += '<div style="display:flex;align-items:flex-start;gap:14px;">';
  html += '<div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#ff6b9d,#c44569);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;box-shadow:0 4px 12px rgba(255,107,157,0.3);">✨</div>';
  html += '<div style="flex:1;">';
  html += '<p style="font-size:1rem;font-weight:800;color:#2d3436;margin:0;line-height:1.3;">Instala WELO en tu móvil</p>';
  html += '<p style="font-size:0.8rem;color:#636e72;margin:5px 0 0;line-height:1.4;">Acceso directo, funciona offline, 0 espacio.</p>';
  html += '</div>';
  html += '<button id="welo-install-dismiss" style="background:none;border:none;font-size:1.3rem;color:#ccc;cursor:pointer;padding:4px;line-height:1;" aria-label="Cerrar">✕</button>';
  html += '</div>';

  if (isIos) {
    // iOS-specific instructions with visual steps
    html += '<div style="margin-top:16px;padding:14px;background:#f8f9fa;border-radius:12px;">';
    html += '<p style="font-size:0.8rem;font-weight:600;color:#2d3436;margin:0 0 10px;">3 pasos rápidos:</p>';
    html += '<div style="display:flex;flex-direction:column;gap:8px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;"><span style="width:22px;height:22px;background:#ff6b9d;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:800;flex-shrink:0;">1</span><span style="font-size:0.8rem;color:#2d3436;">Toca el botón <strong>Compartir</strong> <span style="font-size:1rem;">⬆️</span> de Safari</span></div>';
    html += '<div style="display:flex;align-items:center;gap:10px;"><span style="width:22px;height:22px;background:#ff6b9d;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:800;flex-shrink:0;">2</span><span style="font-size:0.8rem;color:#2d3436;">Busca <strong>"Añadir a pantalla de inicio"</strong> <span style="font-size:1rem;">➕</span></span></div>';
    html += '<div style="display:flex;align-items:center;gap:10px;"><span style="width:22px;height:22px;background:#ff6b9d;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:800;flex-shrink:0;">3</span><span style="font-size:0.8rem;color:#2d3436;">Toca <strong>"Añadir"</strong> — ¡listo!</span></div>';
    html += '</div>';
    html += '</div>';
    html += '<p style="font-size:0.7rem;color:#aaa;margin-top:10px;text-align:center;">Así recibirás notificaciones y tendrás acceso rápido 📱</p>';
  } else {
    // Android: direct install button
    html += '<div style="margin-top:16px;display:flex;gap:10px;">';
    html += '<button id="welo-install-btn" style="flex:1;padding:14px;background:linear-gradient(135deg,#ff6b9d,#c44569);color:white;border:none;border-radius:14px;font-size:0.9rem;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 4px 16px rgba(255,107,157,0.3);">📲 Instalar app</button>';
    html += '</div>';
    html += '<p style="font-size:0.7rem;color:#aaa;margin-top:10px;text-align:center;">No es de la tienda • No ocupa espacio • Funciona offline</p>';
  }

  html += '</div>';
  banner.innerHTML = html;
  document.body.appendChild(banner);

  // Animate in
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      var inner = banner.querySelector('div');
      if (inner) {
        inner.style.opacity = '1';
        inner.style.transform = 'translateY(0)';
      }
    });
  });

  // Install button handler (Android)
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

// Show after 5 seconds (give time for page to settle)
function scheduleShow() {
  setTimeout(function() {
    showInstallBanner();
  }, 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleShow);
} else {
  scheduleShow();
}

})();
