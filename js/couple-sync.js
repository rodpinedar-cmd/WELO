// WELO — Couple Sync Module
// Shared couple progress via Supabase. Offline-first with pending queue.
// Individual XP (localStorage) remains unchanged. This is an additive layer.

(function() {
'use strict';

const PENDING_KEY = 'welo_couple_pending';
const CACHE_KEY = 'welo_couple_progress';

// ========== LOCAL CACHE ==========
function getCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || null; } catch { return null; }
}
function setCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

// ========== PENDING QUEUE (offline deltas) ==========
function getPending() {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY)) || []; } catch { return []; }
}
function setPending(queue) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
}
function addToPending(delta, source) {
  const queue = getPending();
  const now = Date.now();
  // Dedup: ignore if same source within 1 second
  const isDupe = queue.some(q => q.source === source && Math.abs(q.timestamp - now) < 1000);
  if (isDupe) return;
  queue.push({ delta: delta, source: source, timestamp: now });
  setPending(queue);
}

// ========== SUPABASE OPERATIONS ==========
async function fetchProgressDB() {
  if (typeof supabase === 'undefined' || !supabase) return null;
  try {
    const coupleId = await getCoupleId();
    if (!coupleId) return null;
    const { data } = await supabase.from('couple_progress')
      .select('*')
      .eq('couple_id', coupleId)
      .single();
    return data || null;
  } catch { return null; }
}

async function ensureProgressRow() {
  if (typeof supabase === 'undefined' || !supabase) return false;
  try {
    const coupleId = await getCoupleId();
    if (!coupleId) return false;
    // Try insert (ignore if exists)
    await supabase.from('couple_progress')
      .upsert({ couple_id: coupleId }, { onConflict: 'couple_id', ignoreDuplicates: true });
    return true;
  } catch { return false; }
}

async function incrementXPDB(delta) {
  if (typeof supabase === 'undefined' || !supabase) return false;
  try {
    const coupleId = await getCoupleId();
    if (!coupleId) return false;
    const { error } = await supabase.rpc('increment_couple_xp', { cid: coupleId, amount: delta });
    // If RPC doesn't exist, fallback to read-modify-write
    if (error) {
      const { data } = await supabase.from('couple_progress')
        .select('couple_xp')
        .eq('couple_id', coupleId)
        .single();
      if (data) {
        await supabase.from('couple_progress')
          .update({ couple_xp: data.couple_xp + delta, updated_at: new Date().toISOString() })
          .eq('couple_id', coupleId);
      }
    }
    return true;
  } catch { return false; }
}

async function updateStreakDB() {
  if (typeof supabase === 'undefined' || !supabase) return;
  try {
    const coupleId = await getCoupleId();
    const user = await getUser();
    if (!coupleId || !user) return;

    const { data } = await supabase.from('couple_progress')
      .select('*')
      .eq('couple_id', coupleId)
      .single();
    if (!data) return;

    const t = today();
    const profile = getProfile();
    const isUser1 = profile && profile.role === 'ella';

    // Update last_active for this user
    const updateField = isUser1 ? { last_active_user1: t } : { last_active_user2: t };

    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];

    const anyActiveYesterday = data.last_active_user1 === yStr || data.last_active_user2 === yStr;
    const anyActiveToday = data.last_active_user1 === t || data.last_active_user2 === t;

    let newStreak = data.couple_streak || 0;
    if (!anyActiveToday) {
      // First activity today
      if (anyActiveYesterday) {
        newStreak = newStreak + 1;
      } else if (newStreak > 0) {
        // Missed — check grace
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const tdStr = twoDaysAgo.toISOString().split('T')[0];
        const anyActiveTwoDaysAgo = data.last_active_user1 === tdStr || data.last_active_user2 === tdStr;
        if (!anyActiveTwoDaysAgo) {
          newStreak = Math.max(1, Math.floor(newStreak / 2));
        }
      }
    }

    await supabase.from('couple_progress')
      .update({
        ...updateField,
        couple_streak: newStreak,
        couple_max_streak: Math.max(data.couple_max_streak || 0, newStreak),
        updated_at: new Date().toISOString()
      })
      .eq('couple_id', coupleId);
  } catch { /* silent */ }
}

// ========== FLUSH PENDING QUEUE ==========
async function flushPending() {
  const queue = getPending();
  if (queue.length === 0) return;
  if (typeof supabase === 'undefined' || !supabase) return;

  const totalDelta = queue.reduce((sum, q) => sum + q.delta, 0);
  const success = await incrementXPDB(totalDelta);
  if (success) {
    setPending([]); // Clear queue
    if (window.welo && window.welo.track) {
      window.welo.track('couple_sync_flushed', { items: queue.length, total_xp: totalDelta });
    }
  }
}

// ========== PUBLIC API ==========
window.CoupleSync = {
  // Fetch couple progress from Supabase → update local cache
  async fetch() {
    await ensureProgressRow();
    const data = await fetchProgressDB();
    if (data) setCache(data);
    await flushPending();
    await updateStreakDB();
    return data;
  },

  // Add XP to couple (non-blocking, offline-safe)
  addXP(delta, source) {
    if (!this.isConnected()) return;
    // Update local cache optimistically
    const cache = getCache();
    if (cache) {
      cache.couple_xp = (cache.couple_xp || 0) + delta;
      setCache(cache);
    }
    // Try to send to Supabase
    incrementXPDB(delta).then(function(success) {
      if (!success) {
        addToPending(delta, source);
      } else {
        if (window.welo && window.welo.track) {
          window.welo.track('couple_xp_synced', { delta: delta, source: source });
        }
      }
    }).catch(function() {
      addToPending(delta, source);
    });
  },

  // Get cached couple progress (sync, for UI rendering)
  getProgress() {
    return getCache() || { couple_xp: 0, couple_streak: 0, couple_glow: 0, couple_badges: [] };
  },

  // Check if user has a connected couple in Supabase
  isConnected() {
    const profile = getProfile();
    if (!profile || !profile.coupleCode) return false;
    if (typeof supabase === 'undefined' || !supabase) return false;
    return true;
  }
};

})();
