// WELO — Time Capsule
// Write messages to your future selves. Opens on a specific date.
// Stored in localStorage. Optional Supabase sync.

(function() {
'use strict';

var CAPSULE_KEY = 'welo_capsules';

function getCapsules() {
  try { return JSON.parse(localStorage.getItem(CAPSULE_KEY)) || []; }
  catch { return []; }
}

function saveCapsules(capsules) {
  localStorage.setItem(CAPSULE_KEY, JSON.stringify(capsules));
}

// Check if any capsule is ready to open
window.checkCapsules = function() {
  var capsules = getCapsules();
  var today = new Date().toISOString().split('T')[0];
  return capsules.filter(function(c) { return c.openDate <= today && !c.opened; });
};

// Render time capsule section (called from home or games)
window.renderTimeCapsule = function() {
  var capsules = getCapsules();
  var today = new Date().toISOString().split('T')[0];
  var ready = capsules.filter(function(c) { return c.openDate <= today && !c.opened; });
  var sealed = capsules.filter(function(c) { return c.openDate > today; });
  var opened = capsules.filter(function(c) { return c.opened; });

  var html = '<div class="gradient-header"><h2>💌 Cápsulas del Tiempo</h2><p>Mensajes para vuestro yo futuro</p></div>';

  // Ready to open
  if (ready.length > 0) {
    html += '<p style="font-size:0.75rem;color:var(--primary);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">🔓 Listas para abrir</p>';
    ready.forEach(function(c, i) {
      html += '<div class="card" style="border:2px solid var(--primary);cursor:pointer;" onclick="openCapsule(\'' + c.id + '\')">';
      html += '<div style="display:flex;align-items:center;gap:12px;">';
      html += '<span style="font-size:1.5rem;">💌</span>';
      html += '<div style="flex:1;"><p style="font-size:0.9rem;font-weight:700;margin:0;">Mensaje del ' + c.createdDate + '</p>';
      html += '<p style="font-size:0.75rem;color:var(--text-light);margin:0;">¡Toca para abrirlo juntos!</p></div>';
      html += '<span style="font-size:1.2rem;">→</span></div></div>';
    });
  }

  // Sealed capsules
  if (sealed.length > 0) {
    html += '<p style="font-size:0.75rem;color:var(--text-light);text-transform:uppercase;letter-spacing:1px;margin:16px 0 8px;">🔒 Selladas</p>';
    sealed.forEach(function(c) {
      var daysLeft = Math.ceil((new Date(c.openDate) - new Date()) / 86400000);
      html += '<div class="card" style="opacity:0.7;">';
      html += '<div style="display:flex;align-items:center;gap:12px;">';
      html += '<span style="font-size:1.3rem;">🔒</span>';
      html += '<div style="flex:1;"><p style="font-size:0.85rem;font-weight:600;margin:0;">Se abre el ' + c.openDate + '</p>';
      html += '<p style="font-size:0.75rem;color:var(--text-light);margin:0;">' + daysLeft + ' días restantes</p></div></div></div>';
    });
  }

  // Create new
  html += '<div class="card" style="text-align:center;border:2px dashed #eee;cursor:pointer;" onclick="renderCreateCapsule()">';
  html += '<p style="font-size:1.5rem;margin-bottom:8px;">✍️</p>';
  html += '<p style="font-size:0.9rem;font-weight:700;">Crear nueva cápsula</p>';
  html += '<p style="font-size:0.75rem;color:var(--text-light);">Escribe algo para leer juntos en el futuro</p>';
  html += '</div>';

  // Previously opened
  if (opened.length > 0) {
    html += '<p style="font-size:0.75rem;color:var(--text-light);text-transform:uppercase;letter-spacing:1px;margin:16px 0 8px;">📖 Abiertas</p>';
    opened.slice(-3).forEach(function(c) {
      html += '<div class="card" style="opacity:0.6;padding:14px;">';
      html += '<p style="font-size:0.75rem;color:var(--text-light);">' + c.createdDate + ' → ' + c.openDate + '</p>';
      html += '<p style="font-size:0.85rem;font-style:italic;margin-top:4px;">"' + c.message.substring(0, 60) + (c.message.length > 60 ? '...' : '') + '"</p>';
      html += '</div>';
    });
  }

  html += '<button class="btn-ghost" onclick="renderHome();renderLumiCorner(\'home\');">← Volver</button>';
  document.getElementById('app-content').innerHTML = html;
};

// Create new capsule form
window.renderCreateCapsule = function() {
  var minDate = new Date();
  minDate.setDate(minDate.getDate() + 7); // Minimum 7 days
  var defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 30); // Default 30 days

  var html = '<div class="gradient-header"><h2>✍️ Nueva Cápsula</h2><p>Escribe algo para leer juntos en el futuro</p></div>';
  html += '<div class="card">';
  html += '<label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:8px;">💬 Tu mensaje:</label>';
  html += '<textarea id="capsule-msg" class="input" style="min-height:120px;resize:vertical;" placeholder="Escribe algo especial que queráis recordar...&#10;&#10;Ejemplo: Lo que siento ahora mismo, un deseo, un recuerdo de hoy..."></textarea>';
  html += '<label style="font-size:0.85rem;font-weight:600;display:block;margin:16px 0 8px;">📅 Abrir el día:</label>';
  html += '<input type="date" id="capsule-date" class="input" value="' + defaultDate.toISOString().split('T')[0] + '" min="' + minDate.toISOString().split('T')[0] + '">';
  html += '<p style="font-size:0.7rem;color:var(--text-light);margin-top:4px;">Mínimo 7 días. Sugerido: 1 mes, 3 meses, o vuestro aniversario.</p>';
  html += '<div style="display:flex;gap:8px;margin-top:12px;">';
  html += '<button class="btn-outline" style="font-size:0.75rem;" onclick="document.getElementById(\'capsule-date\').value=getDateOffset(7)">1 sem</button>';
  html += '<button class="btn-outline" style="font-size:0.75rem;" onclick="document.getElementById(\'capsule-date\').value=getDateOffset(30)">1 mes</button>';
  html += '<button class="btn-outline" style="font-size:0.75rem;" onclick="document.getElementById(\'capsule-date\').value=getDateOffset(90)">3 meses</button>';
  html += '<button class="btn-outline" style="font-size:0.75rem;" onclick="document.getElementById(\'capsule-date\').value=getDateOffset(365)">1 año</button>';
  html += '</div>';
  html += '</div>';
  html += '<button class="btn-primary" onclick="saveCapsule()">🔒 Sellar cápsula</button>';
  html += '<button class="btn-ghost" onclick="renderTimeCapsule()">← Cancelar</button>';

  document.getElementById('app-content').innerHTML = html;
};

window.getDateOffset = function(days) {
  var d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

window.saveCapsule = function() {
  var msg = document.getElementById('capsule-msg').value.trim();
  var date = document.getElementById('capsule-date').value;

  if (!msg) { if (typeof showToast === 'function') showToast('Escribe un mensaje primero'); return; }
  if (!date) { if (typeof showToast === 'function') showToast('Elige una fecha'); return; }

  var capsules = getCapsules();
  capsules.push({
    id: Date.now().toString(36),
    message: msg,
    createdDate: new Date().toISOString().split('T')[0],
    openDate: date,
    opened: false
  });
  saveCapsules(capsules);

  if (typeof addXP === 'function') addXP(10);
  if (typeof weloHaptic === 'function') weloHaptic('success');
  if (typeof showToast === 'function') showToast('💌 ¡Cápsula sellada! Se abrirá el ' + date);
  if (window.welo && window.welo.track) window.welo.track('capsule_created', { days_until: Math.ceil((new Date(date) - new Date()) / 86400000) });

  renderTimeCapsule();
};

window.openCapsule = function(id) {
  var capsules = getCapsules();
  var capsule = capsules.find(function(c) { return c.id === id; });
  if (!capsule) return;

  capsule.opened = true;
  saveCapsules(capsules);

  if (typeof addXP === 'function') addXP(20);
  if (typeof showConfetti === 'function') showConfetti();
  if (typeof playSound === 'function') playSound('levelup');

  var html = '<div class="card" style="text-align:center;padding:32px;">';
  html += '<p style="font-size:2.5rem;margin-bottom:16px;">💌</p>';
  html += '<p style="font-size:0.8rem;color:var(--text-light);margin-bottom:8px;">Escrito el ' + capsule.createdDate + '</p>';
  html += '<div style="padding:20px;background:rgba(255,107,157,0.04);border-radius:12px;margin:16px 0;">';
  html += '<p style="font-size:1rem;line-height:1.7;font-style:italic;white-space:pre-wrap;">"' + capsule.message + '"</p>';
  html += '</div>';
  html += '<p style="font-size:0.85rem;color:var(--primary);font-weight:600;">+20 XP por abrir juntos 💕</p>';
  html += '<button class="btn-primary" style="margin-top:16px;" onclick="renderTimeCapsule()">← Volver a cápsulas</button>';
  html += '</div>';

  document.getElementById('app-content').innerHTML = html;
  if (window.welo && window.welo.track) window.welo.track('capsule_opened', { days_sealed: Math.ceil((new Date() - new Date(capsule.createdDate)) / 86400000) });
};

})();
