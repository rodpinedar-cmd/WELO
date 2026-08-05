// WELO — Share Results & Invitations
// Handles sharing Match Diario results, weekly summary, and partner invitations.

(function() {
'use strict';

// Share Match Diario result as image/text
window.shareMatchResult = function(matchPct, questionsCount) {
  var text = '💕 Match Diario: ' + matchPct + '% de compatibilidad hoy\n';
  text += '🎯 ' + questionsCount + ' preguntas respondidas\n\n';
  text += '¿Cuánto coincidís vosotros? Descúbrelo en WELO 👇\n';
  text += 'https://rodpinedar-cmd.github.io/WELO/';

  if (navigator.share) {
    navigator.share({ title: 'Mi Match Diario — WELO', text: text }).catch(function() {});
  } else {
    navigator.clipboard.writeText(text).then(function() {
      if (typeof showToast === 'function') showToast('📋 ¡Copiado!');
    });
  }

  if (window.welo && window.welo.track) window.welo.track('share_match_result', { match_pct: matchPct });
};

// Share weekly summary
window.shareWeeklySummary = function() {
  var summary = typeof getWeeklySummary === 'function' ? getWeeklySummary() : {};
  var text = '✨ Mi semana en WELO:\n';
  text += '🔥 Racha: ' + (summary.streak || 0) + ' días\n';
  text += '⚡ XP: ' + (summary.xp || 0) + '\n';
  text += '🏅 Nivel: ' + (summary.level || 'Nuevo') + '\n';
  text += '📸 Recuerdos: ' + (summary.memories || 0) + '\n\n';
  text += 'Conecta con tu pareja cada día → https://rodpinedar-cmd.github.io/WELO/';

  if (navigator.share) {
    navigator.share({ title: 'Mi semana en WELO', text: text }).catch(function() {});
  } else {
    navigator.clipboard.writeText(text).then(function() {
      if (typeof showToast === 'function') showToast('📋 ¡Copiado!');
    });
  }

  if (window.welo && window.welo.track) window.welo.track('share_weekly_summary');
};

// Generate unique invite link for partner
window.generateInviteLink = function() {
  var profile = typeof getProfile === 'function' ? getProfile() : {};
  var couple = typeof getCouple === 'function' ? getCouple() : {};
  var code = couple.code || (typeof genCode === 'function' ? genCode() : 'WLO-' + Math.random().toString(36).substr(2, 4).toUpperCase());
  
  // Save code if generated new
  if (!couple.code) {
    couple.code = code;
    if (typeof setCouple === 'function') setCouple(couple);
  }

  var text = '💕 ¡Te invito a WELO!\n\n';
  text += 'Es una app de retos y juegos para parejas. Yo ya estoy dentro.\n\n';
  text += '👉 Abre este link:\nhttps://rodpinedar-cmd.github.io/WELO/\n\n';
  text += '🔑 Usa mi código de pareja: ' + code + '\n';
  text += '(Lo introduces en el registro)\n\n';
  text += '¡Son 2 minutos al día! 🎯';

  if (navigator.share) {
    navigator.share({ title: 'Únete a WELO', text: text }).catch(function() {});
  } else {
    navigator.clipboard.writeText(text).then(function() {
      if (typeof showToast === 'function') showToast('📋 ¡Invitación copiada!');
    });
  }

  if (window.welo && window.welo.track) window.welo.track('invite_partner_generated', { code: code });
};

// Share quiz/test result (for web pages)
window.shareTestResult = function(testName, resultTitle, resultPcts) {
  var text = '🧠 Mi resultado en ' + testName + ': ' + resultTitle + '\n';
  if (resultPcts) text += resultPcts + '\n';
  text += '\n¿Cuál es el tuyo? → https://rodpinedar-cmd.github.io/WELO/' + testName.toLowerCase().replace(/\s/g, '-') + '.html';

  if (navigator.share) {
    navigator.share({ title: testName + ' — WELO', text: text }).catch(function() {});
  } else {
    navigator.clipboard.writeText(text).then(function() {
      if (typeof showToast === 'function') showToast('📋 ¡Copiado!');
    });
  }
};

})();
