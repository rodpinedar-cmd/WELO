// WELO — Preferences & Compatibility Engine

function getPrefs() {
  try { return JSON.parse(localStorage.getItem('welo_prefs')) || {ella:{},el:{},shared:{}}; } catch { return {ella:{},el:{},shared:{}}; }
}
function setPrefs(p) { localStorage.setItem('welo_prefs', JSON.stringify(p)); }

// All preference categories
const prefCategories = {
  food: {label:'Comida',icon:'🍽',options:['Sushi','Italiana','Mexicana','Thai','Tapas','Brunch','Vegana','India','Coreana','Peruana','Mediterránea','Mariscos']},
  music: {label:'Música',icon:'🎵',options:['Indie','Electrónica','Rock','Pop','Reggaetón','Jazz','Clásica','Hip-hop','R&B','Latina','Folk','Metal']},
  sports: {label:'Deporte',icon:'🏃',options:['Running','Yoga','Escalada','Bici','Natación','Senderismo','Pádel','Baile','Gym','Surf','Pilates','Artes marciales']},
  hobbies: {label:'Hobbies',icon:'🎨',options:['Cine','Leer','Cocinar','Fotografía','Videojuegos','Cerámica','Pintar','Plantas','Puzzles','Podcasts','Escribir','DIY']},
  vibes: {label:'Vibes',icon:'✨',options:['Aventura','Relax','Romántico','Cultural','Social','Naturaleza','Nocturno','Foodie','Deportivo','Creativo','Espiritual','Minimalista']}
};

const budgetOptions = ['€ Económico','€€ Medio','€€€ Premium','Mezcla'];

// Render preferences setup
function renderPreferences() {
  const prefs = getPrefs();
  const profile = getProfile();
  const role = profile ? profile.role : 'ella';
  const myPrefs = prefs[role] || {};
  
  let html = `<div class="gradient-header"><h2>⚙️ Mis gustos</h2><p>Esto mejora las recomendaciones</p></div>`;
  
  Object.entries(prefCategories).forEach(([key, cat]) => {
    const selected = myPrefs[key] || [];
    html += `<div class="card">
      <h4 style="font-size:0.9rem;margin-bottom:10px;">${cat.icon} ${cat.label}</h4>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${cat.options.map(opt => {
          const active = selected.includes(opt);
          return `<button onclick="togglePref('${key}','${opt}')" style="padding:6px 14px;border-radius:20px;font-size:0.75rem;font-weight:600;border:1.5px solid ${active?'var(--primary)':'#e0e0e0'};background:${active?'rgba(255,107,157,0.08)':'white'};color:${active?'var(--primary)':'var(--text)'};cursor:pointer;font-family:inherit;">${opt}</button>`;
        }).join('')}
      </div>
    </div>`;
  });
  
  // Budget
  const currentBudget = myPrefs.budget || '';
  html += `<div class="card">
    <h4 style="font-size:0.9rem;margin-bottom:10px;">💰 Presupuesto habitual</h4>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">
      ${budgetOptions.map(b => `<button onclick="setBudgetPref('${b}')" style="padding:8px 16px;border-radius:20px;font-size:0.8rem;font-weight:600;border:1.5px solid ${currentBudget===b?'var(--primary)':'#e0e0e0'};background:${currentBudget===b?'rgba(255,107,157,0.08)':'white'};cursor:pointer;font-family:inherit;">${b}</button>`).join('')}
    </div>
  </div>`;
  
  // Compatibility preview
  const otherRole = role === 'ella' ? 'el' : 'ella';
  const otherPrefs = prefs[otherRole] || {};
  if(Object.keys(otherPrefs).length > 0) {
    const matches = findMatches(myPrefs, otherPrefs);
    if(matches.length > 0) {
      html += `<div class="card" style="border-left:4px solid var(--primary);">
        <h4 style="font-size:0.9rem;margin-bottom:8px;">💕 Coincidencias de pareja</h4>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${matches.map(m => `<span style="padding:5px 12px;background:rgba(255,107,157,0.06);border-radius:20px;font-size:0.75rem;font-weight:600;">${m}</span>`).join('')}
        </div>
        <p style="font-size:0.7rem;color:var(--text-light);margin-top:8px;">Las recomendaciones priorizan lo que les gusta a ambos</p>
      </div>`;
    }
  }
  
  html += `<div class="card" style="background:linear-gradient(135deg,rgba(255,107,157,0.05),rgba(196,69,105,0.05));border:1.5px solid rgba(255,107,157,0.2);">
    <h4 style="font-size:0.9rem;margin-bottom:8px;">📲 Invitar a mi pareja</h4>
    <p style="font-size:0.8rem;color:var(--text-light);margin-bottom:12px;">Compartí este link para que tu pareja se una:</p>
    <button onclick="shareWELO()" style="padding:10px 20px;border-radius:50px;background:linear-gradient(135deg,#ff6b9d,#c44569);color:white;border:none;font-weight:600;font-size:0.85rem;cursor:pointer;font-family:inherit;">Compartir WELO 💕</button>
  </div>`;
  
  html += `<button class="btn-ghost" onclick="renderHome();renderLumiCorner('home');">← Volver</button>`;
  document.getElementById('app-content').innerHTML = html;
}

function togglePref(category, option) {
  const prefs = getPrefs();
  const profile = getProfile();
  const role = profile.role;
  if(!prefs[role]) prefs[role] = {};
  if(!prefs[role][category]) prefs[role][category] = [];
  
  const idx = prefs[role][category].indexOf(option);
  if(idx > -1) prefs[role][category].splice(idx, 1);
  else prefs[role][category].push(option);
  
  setPrefs(prefs);
  renderPreferences();
}

function setBudgetPref(budget) {
  const prefs = getPrefs();
  const profile = getProfile();
  prefs[profile.role].budget = budget;
  setPrefs(prefs);
  renderPreferences();
}

// Find matches between two profiles
function findMatches(prefs1, prefs2) {
  const matches = [];
  Object.keys(prefCategories).forEach(key => {
    const a = prefs1[key] || [];
    const b = prefs2[key] || [];
    a.forEach(item => { if(b.includes(item)) matches.push(item); });
  });
  return matches;
}

// Score a plan based on preferences
function scorePlan(plan, prefs) {
  const profile = getProfile();
  const role = profile ? profile.role : 'ella';
  const myPrefs = prefs[role] || {};
  const otherPrefs = prefs[role === 'ella' ? 'el' : 'ella'] || {};
  
  let score = 50; // Base score
  const planTags = plan.tags || [];
  
  // My matches
  Object.values(myPrefs).flat().forEach(pref => {
    if(planTags.some(t => t.toLowerCase().includes(pref.toLowerCase()))) score += 8;
  });
  
  // Shared matches (double weight)
  const shared = findMatches(myPrefs, otherPrefs);
  shared.forEach(s => {
    if(planTags.some(t => t.toLowerCase().includes(s.toLowerCase()))) score += 15;
  });
  
  // Budget fit
  if(myPrefs.budget && plan.cost) {
    if(myPrefs.budget.startsWith('€€€') && plan.cost === '€€€') score += 10;
    else if(myPrefs.budget.startsWith('€€') && (plan.cost === '€€' || plan.cost === '€')) score += 10;
    else if(myPrefs.budget.startsWith('€ ') && plan.cost === '€') score += 10;
  }
  
  // Novelty (not done before)
  const done = JSON.parse(localStorage.getItem('welo_plans_done')||'[]');
  if(!done.find(d => d.title === plan.title)) score += 12;
  
  return Math.min(100, score);
}

// Get top recommended plans (sorted by score)
function getRecommendedPlans(allPlans) {
  const prefs = getPrefs();
  return allPlans
    .map(p => ({...p, score: scorePlan(p, prefs)}))
    .sort((a, b) => b.score - a.score);
}

// Lumi recommendation phrase based on matches
function getLumiRecommendation() {
  const prefs = getPrefs();
  const profile = getProfile();
  if(!profile) return null;
  const role = profile.role;
  const otherRole = role === 'ella' ? 'el' : 'ella';
  const matches = findMatches(prefs[role]||{}, prefs[otherRole]||{});
  
  if(matches.length === 0) return "Llena tus gustos en ⚙️ para que recomiende mejor.";
  
  const pick = matches[Math.floor(Math.random() * matches.length)];
  const phrases = [
    `Los dos pusieron "${pick}". Tengo planes que les van a encantar.`,
    `"${pick}" es algo que comparten. Voy a buscar opciones.`,
    `Coinciden en "${pick}" — eso lo hace más fácil para mí.`
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// Share WELO with partner
function shareWELO() {
  const url = 'https://rodpinedar-cmd.github.io/WELO/';
  const text = '💕 Descarga WELO — retos, juegos y preguntas para conectar como pareja. 2 min al día, gratis.\n\n' + url;
  
  if (navigator.share) {
    navigator.share({ title: 'WELO — App para Parejas', text: text, url: url }).catch(function() {});
  } else {
    navigator.clipboard.writeText(text).then(function() {
      if (typeof showToast === 'function') showToast('¡Link copiado!');
      else alert('¡Link copiado al portapapeles!');
    });
  }
  
  if (window.welo && window.welo.track) window.welo.track('share_clicked', { from: 'preferences' });
}
