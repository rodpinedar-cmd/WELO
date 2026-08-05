// WELO — Daily Gratitude
// Each day, write one thing you're grateful for about your partner.
// Builds a "gratitude journal" over time.

(function() {
'use strict';

var GRATITUDE_KEY = 'welo_gratitude';

function getGratitudes() {
  try { return JSON.parse(localStorage.getItem(GRATITUDE_KEY)) || []; }
  catch { return []; }
}

function saveGratitudes(list) {
  localStorage.setItem(GRATITUDE_KEY, JSON.stringify(list));
}

// Check if today's gratitude was already written
window.hasGratitudeToday = function() {
  var gratitudes = getGratitudes();
  var today = new Date().toISOString().split('T')[0];
  return gratitudes.some(function(g) { return g.date === today; });
};

// Render gratitude section in home (compact)
window.renderGratitudeCard = function() {
  if (hasGratitudeToday()) {
    var gratitudes = getGratitudes();
    var todayEntry = gratitudes.find(function(g) { return g.date === new Date().toISOString().split('T')[0]; });
    return '<div class="card" style="padding:14px;border-left:4px solid var(--glow);">'
      + '<p style="font-size:0.75rem;color:var(--text-light);margin:0;">🙏 Hoy agradezco:</p>'
      + '<p style="font-size:0.85rem;font-style:italic;margin:4px 0 0;color:var(--text);">"' + todayEntry.text + '"</p>'
      + '</div>';
  }
  return '<div class="card" style="padding:14px;cursor:pointer;border-left:4px solid var(--glow);" onclick="showGratitudeInput()">'
    + '<div style="display:flex;align-items:center;gap:10px;">'
    + '<span style="font-size:1.2rem;">🙏</span>'
    + '<div style="flex:1;">'
    + '<p style="font-size:0.82rem;font-weight:600;margin:0;">Gratitud de hoy</p>'
    + '<p style="font-size:0.7rem;color:var(--text-light);margin:0;">¿Qué agradeces de tu pareja hoy?</p>'
    + '</div>'
    + '<span style="color:var(--primary);font-size:0.8rem;">+5 XP</span>'
    + '</div></div>';
};

// Show input for gratitude
window.showGratitudeInput = function() {
  var card = event.currentTarget || event.target.closest('.card');
  if (!card) return;

  card.innerHTML = '<div style="padding:4px;">'
    + '<p style="font-size:0.8rem;font-weight:600;margin-bottom:8px;">🙏 Hoy agradezco de mi pareja...</p>'
    + '<input type="text" id="gratitude-input" class="input" style="font-size:0.9rem;" placeholder="Ej: Que me escuchó cuando necesitaba hablar" maxlength="140" autofocus>'
    + '<div style="display:flex;gap:8px;margin-top:8px;">'
    + '<button class="btn-primary" style="padding:10px;font-size:0.8rem;" onclick="saveGratitude()">Guardar 🙏</button>'
    + '<button class="btn-ghost" style="padding:10px;font-size:0.8rem;" onclick="renderHome();renderLumiCorner(\'home\');">Cancelar</button>'
    + '</div></div>';

  setTimeout(function() {
    var input = document.getElementById('gratitude-input');
    if (input) input.focus();
  }, 100);
};

// Save gratitude
window.saveGratitude = function() {
  var input = document.getElementById('gratitude-input');
  if (!input) return;
  var text = input.value.trim();
  if (!text) { if (typeof showToast === 'function') showToast('Escribe algo primero'); return; }

  var gratitudes = getGratitudes();
  gratitudes.push({
    date: new Date().toISOString().split('T')[0],
    text: text,
    timestamp: Date.now()
  });
  saveGratitudes(gratitudes);

  if (typeof addXP === 'function') addXP(5);
  if (typeof completeMission === 'function') completeMission('gratitud');
  if (typeof weloHaptic === 'function') weloHaptic('success');
  if (typeof showToast === 'function') showToast('🙏 Gratitud guardada • +5 XP');
  if (window.welo && window.welo.track) window.welo.track('gratitude_saved', { length: text.length, total: gratitudes.length });

  renderHome();
  if (typeof renderLumiCorner === 'function') renderLumiCorner('home');
};

// Render full gratitude journal
window.renderGratitudeJournal = function() {
  var gratitudes = getGratitudes();
  var html = '<div class="gradient-header"><h2>🙏 Diario de Gratitud</h2><p>' + gratitudes.length + ' entradas</p></div>';

  if (gratitudes.length === 0) {
    html += '<div class="card" style="text-align:center;padding:32px;">'
      + '<p style="font-size:2rem;margin-bottom:12px;">🙏</p>'
      + '<p style="font-size:0.9rem;color:var(--text-light);">Aún no has escrito ninguna gratitud.</p>'
      + '<p style="font-size:0.8rem;color:var(--text-light);margin-top:8px;">Vuelve al inicio para escribir la primera.</p>'
      + '</div>';
  } else {
    // Show last 30 entries
    gratitudes.slice(-30).reverse().forEach(function(g) {
      html += '<div class="card" style="padding:14px;">'
        + '<p style="font-size:0.7rem;color:var(--text-light);margin:0;">' + g.date + '</p>'
        + '<p style="font-size:0.88rem;margin:4px 0 0;line-height:1.5;">"' + g.text + '"</p>'
        + '</div>';
    });
  }

  html += '<button class="btn-ghost" onclick="renderHome();renderLumiCorner(\'home\');">← Volver</button>';
  document.getElementById('app-content').innerHTML = html;
};

})();
