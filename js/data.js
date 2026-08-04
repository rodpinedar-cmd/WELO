// WELO — Data Layer
const WELO = {
  version: '1.0.0',
  name: 'WELO'
};

// Storage helpers
function getProfile() { try { return JSON.parse(localStorage.getItem('welo_profile')) || null; } catch { return null; } }
function setProfile(p) { localStorage.setItem('welo_profile', JSON.stringify(p)); }
function getLogs() { try { return JSON.parse(localStorage.getItem('welo_logs')) || {}; } catch { return {}; } }
function setLogs(l) { localStorage.setItem('welo_logs', JSON.stringify(l)); }
function getCouple() {
  try {
    const raw = JSON.parse(localStorage.getItem('welo_couple'));
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {xp:0,streak:0,challengesCompleted:[],questionsAnswered:{}};
    // Ensure required fields exist with correct types
    if (typeof raw.xp !== 'number') raw.xp = 0;
    if (typeof raw.streak !== 'number') raw.streak = 0;
    return raw;
  } catch { return {xp:0,streak:0,challengesCompleted:[],questionsAnswered:{}}; }
}
function setCouple(c) { localStorage.setItem('welo_couple', JSON.stringify(c)); }
function getGame() { try { return JSON.parse(localStorage.getItem('welo_game')) || {}; } catch { return {}; } }
function setGame(g) { localStorage.setItem('welo_game', JSON.stringify(g)); }
function getWatchlist() { try { return JSON.parse(localStorage.getItem('welo_watchlist')) || []; } catch { return []; } }
function setWatchlist(w) { localStorage.setItem('welo_watchlist', JSON.stringify(w)); }
function getDates() { try { return JSON.parse(localStorage.getItem('welo_dates')) || []; } catch { return []; } }
function setDates(d) { localStorage.setItem('welo_dates', JSON.stringify(d)); }
function getPartnerProfile() { try { return JSON.parse(localStorage.getItem('welo_partner')) || {}; } catch { return {}; } }
function setPartnerProfile(p) { localStorage.setItem('welo_partner', JSON.stringify(p)); }

// Utilities
function today() { return new Date().toISOString().split('T')[0]; }
function dayOfYear() { const n=new Date(); return Math.floor((n-new Date(n.getFullYear(),0,0))/(1000*60*60*24)); }
function genCode() { const c='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let r='WLO-'; for(let i=0;i<4;i++) r+=c[Math.floor(Math.random()*c.length)]; return r; }

// GLOW currency
function getGlow() { const co = getCouple(); return co.glow || 0; }
function addGlow(n) { const co = getCouple(); co.glow = (co.glow||0) + n; setCouple(co); }

// Daily Missions System
function getMissions() {
  try { return JSON.parse(localStorage.getItem('welo_missions')) || null; } catch { return null; }
}
function setMissions(m) { localStorage.setItem('welo_missions', JSON.stringify(m)); }

function generateDailyMissions() {
  const m = getMissions();
  const t = today();
  if(m && m.date === t) return m; // Already generated today
  
  const allMissions = [
    {id:'reto',name:'Completa el reto del día',emoji:'🎯',xp:15},
    {id:'mood',name:'Registra tu mood',emoji:'😊',xp:5},
    {id:'juego',name:'Juega 1 juego con tu pareja',emoji:'🎮',xp:10},
    {id:'leer',name:'Lee un artículo',emoji:'📖',xp:3},
    {id:'reconocimiento',name:'Dale reconocimiento',emoji:'💕',xp:10},
    {id:'lumi',name:'Cuida a Lumi',emoji:'🪲',xp:2},
    {id:'pregunta',name:'Responde la pregunta del día',emoji:'💬',xp:10},
    {id:'dato',name:'Descubre un dato curioso',emoji:'💡',xp:3},
  ];
  // Seeded shuffle based on date (consistent per day, different each day)
  const seed = t.split('-').join('') * 1;
  const shuffled = [...allMissions].sort((a,b) => {
    const ha = ((seed * 31 + a.id.charCodeAt(0)) % 100);
    const hb = ((seed * 31 + b.id.charCodeAt(0)) % 100);
    return ha - hb;
  });
  const picked = shuffled.slice(0,3);
  const missions = { date:t, list:picked.map(p=>({...p,done:false})), chestOpened:false };
  setMissions(missions);
  return missions;
}

function completeMission(missionId) {
  const m = getMissions();
  if(!m) return;
  const mission = m.list.find(x=>x.id===missionId);
  if(mission && !mission.done) {
    mission.done = true;
    setMissions(m);
    // Analytics: mission completed
    if(window.welo && window.welo.track) window.welo.track('mission_completed', { mission_id: missionId });
  }
}

function getMissionsCompleted() {
  const m = getMissions();
  if(!m) return 0;
  return m.list.filter(x=>x.done).length;
}

function openDailyChest() {
  const m = getMissions();
  if(!m || m.chestOpened || getMissionsCompleted() < 3) return null;
  m.chestOpened = true;
  setMissions(m);
  const roll = Math.random();
  let reward;
  if(roll < 0.70) {
    const xp = 5 + Math.floor(Math.random()*11);
    addXP(xp);
    reward = {type:'xp',amount:xp,text:`+${xp} XP bonus`};
  } else if(roll < 0.90) {
    const glow = 3 + Math.floor(Math.random()*8);
    addGlow(glow);
    reward = {type:'glow',amount:glow,text:`+${glow} GLOW ✨`};
  } else {
    const xp = 25 + Math.floor(Math.random()*26);
    addXP(xp);
    addGlow(5);
    reward = {type:'rare',amount:xp,text:`🎉 ¡Raro! +${xp} XP + 5 GLOW`};
  }
  if(window.welo && window.welo.track) window.welo.track('glow_updated', { reward_type: reward.type, amount: reward.amount });
  return reward;
}

// XP System
function addXP(n) {
  const co = getCouple();
  const streak = co.streak || 0;
  const multiplier = streak >= 30 ? 3 : streak >= 14 ? 2.5 : streak >= 7 ? 2 : streak >= 3 ? 1.5 : 1;
  const earned = Math.round(n * multiplier);
  co.xp = (co.xp||0) + earned;
  // Analytics: xp earned
  if(window.welo && window.welo.track) window.welo.track('xp_earned', { amount: n, earned_with_multiplier: earned, multiplier: multiplier });
  // Check for new badges
  checkBadges(co);
  setCouple(co);
  // Check level up celebration
  if(typeof celebrateIfNewLevel === 'function') celebrateIfNewLevel();
  // Show streak multiplier toast if > 1 (only once per day)
  if(multiplier > 1 && n > 2) {
    if(!window._toastShownToday) {
      showToast(`+${earned} XP (x${multiplier} racha 🔥)`);
      window._toastShownToday = true;
    }
  }
}
function getLevel(xp) {
  if(xp>=2000) return '💎 Leyendas';
  if(xp>=1500) return '👑 Eternos';
  if(xp>=1000) return '✨ Almas Gemelas';
  if(xp>=600) return '💫 Cómplices';
  if(xp>=300) return '💕 Conectados';
  if(xp>=100) return '🌱 Creciendo';
  return '🌱 Empezando';
}
function getLevelNum(xp) {
  if(xp>=2000) return 7;
  if(xp>=1500) return 6;
  if(xp>=1000) return 5;
  if(xp>=600) return 4;
  if(xp>=300) return 3;
  if(xp>=100) return 2;
  return 1;
}

// Streak System — forgiving (no hard reset)
function updateStreak() {
  const co = getCouple();
  const t = today();
  if(co.lastActive === t) return; // Already counted today
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
  const yStr = yesterday.toISOString().split('T')[0];
  const twoDaysAgo = new Date(); twoDaysAgo.setDate(twoDaysAgo.getDate()-2);
  const tdaStr = twoDaysAgo.toISOString().split('T')[0];
  
  if(co.lastActive === yStr) {
    co.streak = (co.streak||0) + 1;
  } else if(co.lastActive === tdaStr) {
    // Grace period
  } else if(co.streak > 0) {
    co.streak = Math.max(1, Math.floor((co.streak||0) / 2));
    showToast(`Tu racha bajó a ${co.streak} 🔥 ¡Vuelve mañana para recuperarla!`);
  }
  co.lastActive = t;
  co.maxStreak = Math.max(co.maxStreak||0, co.streak);
  setCouple(co);
  if(window.welo && window.welo.track) window.welo.track('streak_updated', { streak: co.streak, maxStreak: co.maxStreak });
}

// Badge System
const allBadges = [
  {id:'first_xp',name:'Primer paso',emoji:'🐣',desc:'Gana tu primer XP',check:co=>co.xp>=1},
  {id:'streak_3',name:'3 días seguidos',emoji:'🔥',desc:'Racha de 3 días',check:co=>co.streak>=3},
  {id:'streak_7',name:'Semana completa',emoji:'⚡',desc:'Racha de 7 días',check:co=>co.streak>=7},
  {id:'streak_14',name:'Imparables',emoji:'💪',desc:'Racha de 14 días',check:co=>co.streak>=14},
  {id:'streak_30',name:'Leyendas',emoji:'👑',desc:'Racha de 30 días',check:co=>co.streak>=30},
  {id:'xp_100',name:'Despegando',emoji:'🚀',desc:'100 XP',check:co=>co.xp>=100},
  {id:'xp_300',name:'Conectados',emoji:'💕',desc:'300 XP',check:co=>co.xp>=300},
  {id:'xp_600',name:'Cómplices',emoji:'💫',desc:'600 XP',check:co=>co.xp>=600},
  {id:'xp_1000',name:'Almas Gemelas',emoji:'✨',desc:'1000 XP',check:co=>co.xp>=1000},
  {id:'xp_2000',name:'Diamante',emoji:'💎',desc:'2000 XP',check:co=>co.xp>=2000},
  {id:'movie_5',name:'Cinéfilos',emoji:'🎬',desc:'5 pelis en watchlist',check:()=>(getWatchlist()||[]).length>=5},
  {id:'games_all',name:'Gamers del amor',emoji:'🎮',desc:'Jugaron todos los juegos',check:()=>{const g=getGame();return g.q36progress>0;}},
];
function checkBadges(co) {
  if(!co.badges) co.badges = [];
  allBadges.forEach(b => {
    if(!co.badges.includes(b.id) && b.check(co)) {
      co.badges.push(b.id);
      showToast(`🏅 Nuevo badge: ${b.emoji} ${b.name}!`);
      if(window.welo && window.welo.track) window.welo.track('level_up', { badge_id: b.id, badge_name: b.name, total_badges: co.badges.length });
    }
  });
}

// Leaderboard (simulado con parejas ficticias + la real)
function getLeaderboard() {
  const co = getCouple();
  const fake = [
    {name:'Ana & Jordi',xp:1850,streak:34,city:'Poblenou'},
    {name:'Nuria & David',xp:1420,streak:21,city:'Gràcia'},
    {name:'Laura & Marc',xp:980,streak:15,city:'Eixample'},
    {name:'Carla & Pau',xp:750,streak:9,city:'Born'},
    {name:'Irene & Dani',xp:520,streak:7,city:'Poble Sec'},
    {name:'Montse & Oriol',xp:380,streak:5,city:'Sarrià'},
    {name:'Sara & Alex',xp:210,streak:3,city:'Sants'},
  ];
  const me = {name:'Tú & tu pareja 💕',xp:co.xp,streak:co.streak||0,city:'—',isMe:true};
  const all = [...fake, me].sort((a,b)=>b.xp-a.xp);
  return all;
}

// Share / Presume functions
function getShareText() {
  const co = getCouple();
  const lumi = typeof getLumi === 'function' ? getLumi() : {evolveStage:1};
  return `🏆 Somos ${getLevel(co.xp)} en WELO!\n🔥 Racha: ${co.streak||0} días\n⭐ ${co.xp} XP\n🪲 Lumi nivel ${lumi.level||1}\n\n¿Tu pareja y tú se atreven? 👉 weloapp.com\n#WELO #ParejasWELO`;
}
function shareResults() {
  const text = getShareText();
  if(navigator.share) {
    navigator.share({title:'Mi nivel en WELO',text:text}).catch(()=>{});
  } else {
    navigator.clipboard.writeText(text).then(()=>showToast('📋 Copiado para compartir!'));
  }
}
function getShareImage() {
  // Returns HTML for a shareable card (screenshot-friendly)
  const co = getCouple();
  return `<div style="width:350px;padding:32px;background:linear-gradient(135deg,#ff6b9d,#c44569);border-radius:24px;color:white;text-align:center;font-family:Inter,sans-serif;">
    <p style="font-size:0.8rem;opacity:0.8;">Nuestra relación en WELO</p>
    <p style="font-size:2.5rem;font-weight:900;margin:12px 0;">${getLevel(co.xp)}</p>
    <p style="font-size:1.3rem;font-weight:700;">${co.xp} XP • 🔥 ${co.streak||0} días</p>
    <p style="font-size:0.85rem;opacity:0.9;margin-top:12px;">Badges: ${(co.badges||[]).length}/${allBadges.length}</p>
    <p style="font-size:0.75rem;opacity:0.7;margin-top:16px;">weloapp.com • #WELO</p>
  </div>`;
}

// Toast notification system
function showToast(msg) {
  let toast = document.getElementById('welo-toast');
  if(!toast) {
    toast = document.createElement('div');
    toast.id = 'welo-toast';
    toast.style.cssText = 'position:fixed;top:70px;left:50%;transform:translateX(-50%);padding:12px 24px;background:#2d3436;color:white;border-radius:50px;font-size:0.85rem;font-weight:600;z-index:9999;opacity:0;transition:opacity 0.3s;pointer-events:none;font-family:Inter,sans-serif;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(()=>{toast.style.opacity='0';}, 2500);
}



// Special Dates
function getSpecialDates(){try{return JSON.parse(localStorage.getItem('welo_dates_special'))||[];}catch{return [];}}
function setSpecialDates(d){localStorage.setItem('welo_dates_special',JSON.stringify(d));}
function addSpecialDate(name,date){const d=getSpecialDates();d.push({name,date});setSpecialDates(d);}
function checkUpcomingDates(){const dates=getSpecialDates();const today=new Date();const upcoming=[];dates.forEach(d=>{const dd=new Date(d.date);dd.setFullYear(today.getFullYear());const diff=Math.ceil((dd-today)/(86400000));if(diff>=0&&diff<=7)upcoming.push({...d,daysLeft:diff});});return upcoming;}
