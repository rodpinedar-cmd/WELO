// WELO — Daily Match System (5 preguntas diarias → cita semanal)

function getDailyMatch() {
  try { return JSON.parse(localStorage.getItem('welo_dailymatch')) || {week:[],today:null}; } catch { return {week:[],today:null}; }
}
function setDailyMatch(d) { localStorage.setItem('welo_dailymatch', JSON.stringify(d)); }

// Question pools for daily match
const matchQuestions = {
  food: [
    {q:'¿Qué se te antoja cenar?',opts:['🍣 Sushi','🍕 Pizza','🌮 Mexicano','🍝 Pasta','🥗 Saludable','🍔 Burger']},
    {q:'¿Para tomar?',opts:['🍷 Vino','🍺 Cerveza','☕ Café','🧋 Smoothie','🍹 Cóctel','🫖 Té']},
    {q:'¿Dulce o salado?',opts:['🍫 Chocolate','🍰 Tarta','🧀 Queso','🍿 Palomitas','🍦 Helado','🥐 Croissant']},
  ],
  plans: [
    {q:'¿Qué plan te apetece?',opts:['🌅 Atardecer','🎬 Peli','🍽 Cena fuera','🏊 Playa','🎲 Juegos','🧘 Relax']},
    {q:'¿Indoor o outdoor?',opts:['🏠 Casita','☀️ Aire libre','🌧 Da igual','🏙 Ciudad','🌿 Naturaleza','🎭 Cultural']},
    {q:'¿Mood de hoy?',opts:['😂 Reír','🥰 Romántico','⚡ Aventura','😌 Tranquilo','🔥 Intenso','🎉 Fiesta']},
  ],
  deep: [
    {q:'¿Qué necesitas hoy?',opts:['🤗 Abrazo','👂 Que me escuchen','🎯 Motivación','😴 Descanso','💬 Hablar','🎮 Diversión']},
    {q:'¿Cómo te sientes ahora?',opts:['😊 Bien','😴 Cansad@','⚡ Energía','😰 Estrés','🥰 Amor','🤔 Pensativ@']},
  ],
  weekend: [
    {q:'¿Plan ideal del finde?',opts:['🏖 Playa','🏔 Montaña','🛋 Casa','🍳 Brunch','🎵 Concierto','🚗 Escapada']},
    {q:'¿Presupuesto para la cita?',opts:['💸 Gratis','€ Barato','€€ Normal','€€€ Especial']},
  ]
};

// Get today's 5 questions (seeded by day)
function getTodayMatchQuestions() {
  const day = dayOfYear();
  const allQs = [...matchQuestions.food, ...matchQuestions.plans, ...matchQuestions.deep, ...matchQuestions.weekend];
  // Seeded selection: 5 questions per day, different each day
  const selected = [];
  for(let i=0; i<5; i++) {
    const idx = (day * 7 + i * 13) % allQs.length;
    if(!selected.find(s=>s.q===allQs[idx].q)) selected.push(allQs[idx]);
    else selected.push(allQs[(idx+3)%allQs.length]);
  }
  return selected.slice(0,5);
}

// Render daily match screen
function renderDailyMatch() {
  const dm = getDailyMatch();
  const t = today();
  
  // Check if already answered today
  if(dm.today === t && dm.todayAnswers) {
    renderMatchResults();
    return;
  }
  
  const questions = getTodayMatchQuestions();
  let html = `<div class="gradient-header"><h2>💕 Match Diario</h2><p>5 preguntas rápidas • Ve en qué coinciden</p></div>`;
  
  html += `<div class="card" style="text-align:center;padding:14px;">
    <p style="font-size:0.8rem;color:var(--text-light);">Cada uno responde por separado. Después ven los matches.</p>
  </div>`;
  
  html += `<div id="match-questions">`;
  questions.forEach((q, i) => {
    html += `<div class="card" id="mq-${i}">
      <h4 style="font-size:0.9rem;margin-bottom:10px;">${i+1}. ${q.q}</h4>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${q.opts.map(opt => `<button onclick="selectMatchAnswer(${i},'${opt.replace(/'/g,"\\'")}')" class="btn-outline" style="font-size:0.8rem;padding:8px 14px;" data-mqi="${i}">${opt}</button>`).join('')}
      </div>
    </div>`;
  });
  html += `</div>`;
  
  html += `<button class="btn-primary" id="submit-match" style="display:none;" onclick="submitDailyMatch()">Ver matches →</button>`;
  html += `<button class="btn-ghost" onclick="renderHome();renderLumiCorner('home');">← Volver</button>`;
  
  document.getElementById('app-content').innerHTML = html;
}

let matchAnswers = {};
function selectMatchAnswer(qIdx, answer) {
  matchAnswers[qIdx] = answer;
  // Visual feedback
  document.querySelectorAll(`[data-mqi="${qIdx}"]`).forEach(btn => {
    btn.style.borderColor = '#eee';
    btn.style.background = 'white';
  });
  event.target.style.borderColor = 'var(--primary)';
  event.target.style.background = 'rgba(255,107,157,0.08)';
  
  // Show submit if all answered
  if(Object.keys(matchAnswers).length >= 5) {
    document.getElementById('submit-match').style.display = 'block';
  }
}

function submitDailyMatch() {
  const dm = getDailyMatch();
  const t = today();
  const profile = getProfile();
  const role = profile.role;
  
  // Save answers
  if(!dm.week) dm.week = [];
  dm.today = t;
  dm.todayAnswers = {...matchAnswers};
  dm.todayRole = role;
  
  // Save to weekly history
  dm.week.push({date:t, role:role, answers:{...matchAnswers}});
  // Keep only this week (last 7)
  if(dm.week.length > 14) dm.week = dm.week.slice(-14);
  
  setDailyMatch(dm);
  matchAnswers = {};
  addXP(10);
  completeMission('pregunta');
  
  renderMatchResults();
}

function renderMatchResults() {
  const dm = getDailyMatch();
  const t = today();
  const questions = getTodayMatchQuestions();
  
  // Find partner's answers for today
  const myRole = getProfile().role;
  const partnerRole = myRole === 'ella' ? 'el' : 'ella';
  const todayEntries = dm.week.filter(w => w.date === t);
  const myEntry = todayEntries.find(w => w.role === myRole);
  const partnerEntry = todayEntries.find(w => w.role === partnerRole);
  
  let html = `<div class="gradient-header"><h2>💕 Match del día</h2><p>${t}</p></div>`;
  
  if(!partnerEntry) {
    // Partner hasn't answered yet
    html += `<div class="card" style="text-align:center;">
      <p style="font-size:2rem;margin-bottom:12px;">⏳</p>
      <h3 style="font-size:1rem;margin-bottom:8px;">Esperando a tu pareja</h3>
      <p style="font-size:0.85rem;color:var(--text-light);">Tus respuestas están guardadas. Cuando tu pareja responda, verán los matches.</p>
      <p style="font-size:0.75rem;color:var(--text-light);margin-top:12px;">💡 Mándale un recordatorio: "¡Responde el match de hoy en WELO!"</p>
      <button class="btn-outline" style="margin-top:12px;font-size:0.8rem;" onclick="shareMatchReminder()">📲 Recordar a mi pareja</button>
    </div>`;
    
    // Show my answers
    if(myEntry) {
      html += `<div class="card"><h4 style="font-size:0.85rem;margin-bottom:10px;">Tus respuestas de hoy:</h4>`;
      questions.forEach((q,i) => {
        const myAns = myEntry.answers[i];
        if(myAns) html += `<p style="font-size:0.8rem;padding:6px 0;border-bottom:1px solid #f5f5f5;">${q.q} → <strong>${myAns}</strong></p>`;
      });
      html += `</div>`;
    }
  } else {
    // Both answered! Show matches
    let matches = 0;
    let matchItems = [];
    
    html += `<div class="card">`;
    questions.forEach((q,i) => {
      const myAns = myEntry ? myEntry.answers[i] : '—';
      const partnerAns = partnerEntry.answers[i] || '—';
      const isMatch = myAns === partnerAns;
      if(isMatch) { matches++; matchItems.push(myAns); }
      
      html += `<div style="padding:10px 0;border-bottom:1px solid #f5f5f5;${isMatch?'background:rgba(76,175,80,0.04);margin:0 -20px;padding-left:20px;padding-right:20px;':''}">
        <p style="font-size:0.75rem;color:var(--text-light);">${q.q}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
          <span style="font-size:0.82rem;">👩 ${myRole==='ella'?myAns:partnerAns}</span>
          <span style="font-size:0.85rem;">${isMatch?'✅':'❌'}</span>
          <span style="font-size:0.82rem;">👨 ${myRole==='el'?myAns:partnerAns}</span>
        </div>
      </div>`;
    });
    html += `</div>`;
    
    // Match score
    const pct = Math.round((matches/5)*100);
    html += `<div class="card" style="text-align:center;">
      <p style="font-size:2.5rem;font-weight:900;color:${pct>=60?'#4caf50':pct>=40?'var(--primary)':'var(--text-light)'};">${pct}%</p>
      <p style="font-size:0.9rem;font-weight:600;">${matches}/5 coincidencias</p>
      <p style="font-size:0.8rem;color:var(--text-light);margin-top:8px;">${pct>=80?'¡Increíble! Piensan igual hoy 🔥':pct>=60?'¡Buena conexión! Muchas coincidencias 💕':pct>=40?'Algunos matches — la variedad es buena 🌱':'¡Opuestos hoy! Descubran algo nuevo juntos ✨'}</p>
    </div>`;
    
    // Weekly summary (if 7 days)
    const weekEntries = dm.week.filter(w => w.role === myRole);
    if(weekEntries.length >= 5) {
      html += `<div class="card" style="border-left:4px solid var(--primary);">
        <h4 style="font-size:0.9rem;margin-bottom:8px;">🎯 Tu cita de la semana</h4>
        <p style="font-size:0.82rem;color:var(--text-light);line-height:1.5;">Basándonos en los matches de esta semana, su cita ideal sería:</p>
        <div style="margin-top:12px;padding:14px;background:rgba(255,107,157,0.04);border-radius:12px;">
          <p style="font-size:0.9rem;font-weight:600;">${generateDateSuggestion(dm.week)}</p>
        </div>
        <button class="btn-primary" style="margin-top:12px;font-size:0.85rem;" onclick="markPlanDone('Cita Match Semanal')">✅ ¡La hicimos!</button>
      </div>`;
    }
  }
  
  html += `<button class="btn-ghost" onclick="renderHome();renderLumiCorner('home');">← Volver</button>`;
  document.getElementById('app-content').innerHTML = html;
}

// Generate date suggestion from weekly matches
function generateDateSuggestion(weekData) {
  const allAnswers = weekData.map(w => Object.values(w.answers)).flat();
  const counts = {};
  allAnswers.forEach(a => { if(a) counts[a] = (counts[a]||0) + 1; });
  const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
  const top3 = sorted.slice(0,3).map(s=>s[0]);
  
  if(top3.length === 0) return "¡Sorpréndanse mutuamente esta semana! 🎁";
  
  let suggestion = "";
  const has = (str) => top3.some(t => t.toLowerCase().includes(str));
  
  if(has('sushi') || has('pasta') || has('pizza')) suggestion = "Cena en un restaurante que ambos quieren probar 🍽";
  else if(has('atardecer') || has('playa') || has('naturaleza')) suggestion = "Plan al aire libre: atardecer o paseo por la costa 🌅";
  else if(has('peli') || has('casa') || has('relax')) suggestion = "Noche cozy: fort de cobijas + peli de su watchlist 🎬";
  else if(has('aventura') || has('escalada') || has('deporte')) suggestion = "Algo activo juntos: escalada, bici o paddle surf 🏄";
  else if(has('café') || has('brunch')) suggestion = "Brunch lento en una cafetería nueva ☕";
  else if(has('cóctel') || has('vino')) suggestion = "Noche de cócteles o cata de vinos 🍷";
  else if(has('concierto') || has('música')) suggestion = "Concierto o sesión de música en vivo 🎵";
  else suggestion = `Plan basado en sus matches: ${top3.join(' + ')} 💕`;
  
  return suggestion;
}

function shareMatchReminder() {
  const text = "¡Hey! Responde el Match Diario de WELO para ver en qué coincidimos hoy 💕";
  if(navigator.share) navigator.share({title:'WELO Match',text}).catch(()=>{});
  else { navigator.clipboard.writeText(text); showToast('📋 Copiado'); }
}
