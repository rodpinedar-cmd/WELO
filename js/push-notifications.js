// WELO — Push Notifications
// Handles subscription, permission, and local scheduled notifications.
// Works on Android (Chrome) and iOS 16.4+ (Safari, when installed as PWA).

(function() {
'use strict';

// VAPID public key (used to identify our server to push services)
var VAPID_PUBLIC_KEY = 'BCcRnXal3HnuCFldWU5hemlSC_-zhvROefT5bdIdt4r80d7tE0aHZC6OP286eEYcTI1nEyJPkqQwVK0FEQ0Qy3Q';

var PERMISSION_KEY = 'welo_push_asked';
var SUBSCRIPTION_KEY = 'welo_push_sub';

// Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  var rawData = atob(base64);
  var outputArray = new Uint8Array(rawData.length);
  for (var i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check if push is supported
function isPushSupported() {
  return 'serviceWorker' in navigator &&
         'PushManager' in window &&
         'Notification' in window;
}

// Check if we're in standalone (installed) mode
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

// Get current permission state
function getPermissionState() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'default', 'granted', 'denied'
}

// Subscribe to push notifications
async function subscribeToPush() {
  try {
    var registration = await navigator.serviceWorker.ready;
    
    var subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Save subscription locally
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription.toJSON()));

    // Save to Supabase (for server-side push later)
    await saveSubscriptionToServer(subscription);

    if (window.welo && window.welo.track) {
      window.welo.track('push_subscribed', { platform: isIOS() ? 'ios' : 'android' });
    }

    return true;
  } catch (e) {
    console.warn('[WELO Push] Subscribe failed:', e);
    return false;
  }
}

// Save subscription to Supabase
async function saveSubscriptionToServer(subscription) {
  if (typeof supabase === 'undefined' || !supabase) return;
  
  try {
    var user = await getUser();
    if (!user) return;

    await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      subscription: subscription.toJSON(),
      platform: isIOS() ? 'ios' : 'android',
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } catch (e) {
    console.warn('[WELO Push] Save to server failed:', e);
  }
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Request notification permission with UX flow
async function requestPermission() {
  if (!isPushSupported()) return false;
  
  var state = getPermissionState();
  
  if (state === 'granted') {
    await subscribeToPush();
    return true;
  }
  
  if (state === 'denied') return false;
  
  // state === 'default' — ask user
  var result = await Notification.requestPermission();
  localStorage.setItem(PERMISSION_KEY, 'asked');
  
  if (result === 'granted') {
    await subscribeToPush();
    if (window.welo && window.welo.track) {
      window.welo.track('push_permission_granted');
    }
    return true;
  } else {
    if (window.welo && window.welo.track) {
      window.welo.track('push_permission_denied');
    }
    return false;
  }
}

// Show a custom prompt before the browser prompt (better UX)
function showPushPrompt() {
  if (!isPushSupported()) return;
  if (getPermissionState() !== 'default') return;
  if (localStorage.getItem(PERMISSION_KEY)) return;

  // Only show after user has been in app for a bit
  var banner = document.createElement('div');
  banner.id = 'welo-push-prompt';
  banner.innerHTML = ''
    + '<div style="position:fixed;bottom:0;left:0;right:0;z-index:99998;padding:16px 20px;background:white;box-shadow:0 -4px 24px rgba(0,0,0,0.12);font-family:Inter,-apple-system,sans-serif;border-radius:20px 20px 0 0;">'
    + '<div style="display:flex;align-items:center;gap:14px;">'
    + '<div style="font-size:1.8rem;flex-shrink:0;">🔔</div>'
    + '<div style="flex:1;">'
    + '<p style="font-size:0.9rem;font-weight:700;color:#2d3436;margin:0;">¿Activar recordatorios?</p>'
    + '<p style="font-size:0.75rem;color:#636e72;margin:4px 0 0;">Te avisamos del reto diario y cuando tu pareja responda.</p>'
    + '</div>'
    + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:14px;">'
    + '<button id="welo-push-accept" style="flex:1;padding:12px;background:linear-gradient(135deg,#ff6b9d,#c44569);color:white;border:none;border-radius:50px;font-weight:700;font-size:0.85rem;cursor:pointer;font-family:inherit;">Sí, activar</button>'
    + '<button id="welo-push-later" style="flex:1;padding:12px;background:#f0f0f0;color:#636e72;border:none;border-radius:50px;font-weight:600;font-size:0.85rem;cursor:pointer;font-family:inherit;">Ahora no</button>'
    + '</div>'
    + '</div>';

  document.body.appendChild(banner);

  document.getElementById('welo-push-accept').addEventListener('click', function() {
    banner.remove();
    requestPermission();
  });

  document.getElementById('welo-push-later').addEventListener('click', function() {
    banner.remove();
    localStorage.setItem(PERMISSION_KEY, 'later');
  });
}

// Schedule local notification check (for when we don't have server push yet)
// Uses the service worker to show notifications based on local logic
function scheduleLocalReminder() {
  if (getPermissionState() !== 'granted') return;
  
  // Store last active time
  localStorage.setItem('welo_last_active', String(Date.now()));
}

// Public API
window.WeloPush = {
  request: requestPermission,
  showPrompt: showPushPrompt,
  isSupported: isPushSupported,
  isSubscribed: function() {
    return getPermissionState() === 'granted' && !!localStorage.getItem(SUBSCRIPTION_KEY);
  }
};

// Auto-show prompt after 30 seconds in the app (only if not during onboarding)
function autoPrompt() {
  var onboarding = document.getElementById('onboarding');
  if (onboarding && onboarding.style.display !== 'none') return;
  if (!isPushSupported()) return;
  if (getPermissionState() !== 'default') return;
  if (localStorage.getItem(PERMISSION_KEY)) return;

  // Wait 30 seconds of engagement before asking
  setTimeout(showPushPrompt, 30000);
}

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    autoPrompt();
    scheduleLocalReminder();
  });
} else {
  autoPrompt();
  scheduleLocalReminder();
}

})();
