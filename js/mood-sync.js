// WELO — Mood Sync MVP
// Offline-first mood registration with Supabase sync.
// 1 tap to register, 1 glance to see partner mood.

(function() {
'use strict';

const MOOD_OPTIONS = [
  { id: 'green', emoji: '🟢', label: 'Bien' },
  { id: 'yellow', emoji: '🟡', label: 'Normal' },
  { id: 'orange', emoji: '🟠', label: 'Bajo/a' },
  { id: 'red', emoji: '🔴', label: 'Mal' },
  { id: 'purple', emoji: '💜', label: 'Necesito cariño' }
];

const MOOD_STORAGE_KEY = 'welo_mood_today';

// ========== LOCAL STORAGE ==========
function getMyMood() {
  try {
    const raw = JSON.parse(localStorage.getItem(MOOD_STORAGE_KEY));
    if (raw && raw.date === today()) return raw.mood;
    return null;
  } catch { return null; }
}

function setMyMood(mood) {
  localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify({ mood: mood, date: today() }));
}

// ========== SUPABASE SYNC ==========
async function saveMoodDB(mood) {
  if (typeof supabase === 'undefined' || !supabase) return;
  try {
    const user = await getUser();
    const coupleId = await getCoupleId();
    if (!user || !coupleId) return;
    await supabase.from('mood_sync').upsert({
      couple_id: coupleId,
      user_id: user.id,
      mood: mood,
      date: today()
    }, { onConflict: 'couple_id,user_id,date' });
  } catch (e) {
    console.warn('[Mood Sync] DB save failed:', e);
  }
}

async function getPartnerMoodDB() {
  if (typeof supabase === 'undefined' || !supabase) return null;
  try {
    const user = await getUser();
    const coupleId = await getCoupleId();
    if (!user || !coupleId) return null;
    const { data } = await supabase.from('mood_sync')
      .select('mood')
      .eq('couple_id', coupleId)
      .eq('date', today())
      .neq('user_id', user.id)
      .single();
    return data ? data.mood : null;
  } catch { return null; }
}

// ========== UI: MOOD PILL (Home) ==========
window.renderMoodPill = function() {
  const myMood = getMyMood();
  if (myMood) {
    const opt = MOOD_OPTIONS.find(o => o.id === myMood);
    return `<div class="mood-pill mood-pill--done" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;background:rgba(255,107,157,0.06);font-size:0.8rem;">
      <span>${opt ? opt.emoji : '🟢'}</span>
      <span style="color:var(--text-light);">Tu mood de hoy</span>
    </div>`;
  }
  return `<div class="mood-pill" onclick="openMoodSelector()" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:20px;background:var(--gradient);color:white;font-size:0.8rem;font-weight:600;cursor:pointer;">
    <span>💭</span> ¿Cómo estás hoy?
  </div>`;
};

// ========== UI: MOOD SELECTOR ==========
window.openMoodSelector = function() {
  const optionsHtml = MOOD_OPTIONS.map(o =>
    `<button onclick="selectMood('${o.id}')" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px;border:2px solid #eee;border-radius:12px;background:white;cursor:pointer;min-width:60px;font-family:inherit;transition:all 0.15s;">
      <span style="font-size:1.5rem;">${o.emoji}</span>
      <span style="font-size:0.65rem;color:var(--text-light);">${o.label}</span>
    </button>`
  ).join('');

  const el = document.getElementById('mood-selector');
  if (el) {
    el.innerHTML = `<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:12px 0;">${optionsHtml}</div>`;
    el.style.display = 'block';
  }
};

// ========== ACTION: SELECT MOOD ==========
window.selectMood = function(mood) {
  // Save locally (instant)
  setMyMood(mood);
  // Sync to Supabase (async, non-blocking)
  saveMoodDB(mood);
  // XP reward
  if (typeof addXP === 'function') addXP(2);
  // Track
  if (window.welo && window.welo.track) window.welo.track('mood_registered', { mood: mood });
  // Toast
  if (typeof showToast === 'function') showToast('💭 Mood registrado • +2 XP');
  // Re-render home
  if (typeof renderHome === 'function') renderHome();
};

// ========== UI: PARTNER MOOD DOT (Header) ==========
window.renderPartnerDot = function() {
  getPartnerMoodDB().then(function(partnerMood) {
    const dotEl = document.getElementById('partner-mood-dot');
    if (!dotEl) return;
    if (partnerMood) {
      const colors = { green: '#4caf50', yellow: '#ffc107', orange: '#ff9800', red: '#ef5350', purple: '#9c27b0' };
      const labels = { green: 'Bien', yellow: 'Normal', orange: 'Bajo/a', red: 'Mal', purple: 'Necesita cariño' };
      dotEl.innerHTML = `<span onclick="showToast('Tu pareja se siente: ${labels[partnerMood] || ''}')" style="width:10px;height:10px;border-radius:50%;background:${colors[partnerMood] || '#ccc'};display:inline-block;cursor:pointer;vertical-align:middle;margin-left:6px;" title="Mood de tu pareja"></span>`;
    } else {
      dotEl.innerHTML = `<span style="width:10px;height:10px;border-radius:50%;background:#ddd;display:inline-block;vertical-align:middle;margin-left:6px;" title="Sin mood registrado hoy"></span>`;
    }
  });
};

})();
