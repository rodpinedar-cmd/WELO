// WELO — Feedback System (Haptics, XP Popup, Confetti)
// Provides tactile and visual feedback for user actions.

(function() {
'use strict';

// Haptic vibration (mobile)
window.weloHaptic = function(type) {
  if (!navigator.vibrate) return;
  switch (type) {
    case 'light': navigator.vibrate(10); break;
    case 'medium': navigator.vibrate(25); break;
    case 'heavy': navigator.vibrate([30, 10, 30]); break;
    case 'success': navigator.vibrate([10, 50, 30]); break;
    case 'error': navigator.vibrate([50, 30, 50, 30, 50]); break;
    default: navigator.vibrate(15);
  }
};

// XP popup animation
window.showXPPopup = function(amount) {
  var popup = document.createElement('div');
  popup.className = 'xp-popup';
  popup.textContent = '+' + amount + ' XP';
  document.body.appendChild(popup);
  weloHaptic('success');
  setTimeout(function() { popup.remove(); }, 1000);
};

// Confetti burst (lightweight, CSS-only)
window.showConfetti = function() {
  var container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden;';
  
  var colors = ['#ff6b9d', '#ffd700', '#4a90d9', '#4ecdc4', '#a855f7', '#ff9a56'];
  
  for (var i = 0; i < 30; i++) {
    var piece = document.createElement('div');
    piece.style.cssText = 'position:absolute;width:8px;height:8px;border-radius:2px;'
      + 'left:' + (Math.random() * 100) + '%;'
      + 'top:-10px;'
      + 'background:' + colors[Math.floor(Math.random() * colors.length)] + ';'
      + 'animation:confetti-fall ' + (1 + Math.random() * 2) + 's ease-out forwards;'
      + 'animation-delay:' + (Math.random() * 0.5) + 's;'
      + 'transform:rotate(' + (Math.random() * 360) + 'deg);';
    container.appendChild(piece);
  }
  
  document.body.appendChild(container);
  weloHaptic('heavy');
  setTimeout(function() { container.remove(); }, 3500);
};

// Streak celebration
window.celebrateStreak = function(days) {
  if (days === 7 || days === 14 || days === 30 || days === 50 || days === 100) {
    showConfetti();
    showToast('🎉 ¡' + days + ' días de racha! ¡Increíble!');
  }
};

// Level up celebration
window.celebrateLevelUp = function(levelName) {
  showConfetti();
  weloHaptic('heavy');
  if (typeof showToast === 'function') showToast('🏆 ¡Nuevo nivel: ' + levelName + '!');
};

// Mission complete feedback
window.missionFeedback = function() {
  weloHaptic('medium');
  showXPPopup(10);
};

})();
