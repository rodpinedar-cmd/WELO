// WELO — App Core
function initApp() {
  const profile = getProfile();
  if(!profile) return;
  if(profile.role === 'el') document.body.classList.add('male');
  renderHome();
  renderLumiCorner('home');
  
  // Nav
  document.getElementById('bottom-nav').addEventListener('click', function(e) {
    const btn = e.target.closest('.nav-btn');
    if(!btn) return;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    if(tab === 'home') { renderHome(); renderLumiCorner('home'); }
    else if(tab === 'calendar') { renderCalendar(); renderLumiCorner('calendar'); }
    else if(tab === 'plans') { renderPlans(); renderLumiCorner('plans'); }
    else if(tab === 'games') { renderGames(); renderLumiCorner('games'); }
    else if(tab === 'settings') { renderPreferences(); renderLumiCorner('home'); }
  });
}

function renderHome() {
  const profile = getProfile();
  const couple = getCouple();
  const info = getCycleInfo(today());
  const dato = datosCuriosos[dayOfYear() % datosCuriosos.length];
  const mensaje = profile.role === 'ella' ? mensajesElla[dayOfYear() % mensajesElla.length] : insightsEl[dayOfYear() % insightsEl.length];
  
  // Update streak on entry
  updateStreak();
  const freshCouple = getCouple();
  const streak = freshCouple.streak || 0;
  
  let html = `
    <div class="gradient-header">
      <h2>✨ WELO</h2>
      <p style="font-size:0.75rem;opacity:0.8;">🔥 ${streak} días • ${freshCouple.xp} XP • ${getLevel(freshCouple.xp)}</p>
    </div>`;

  // Lumi mini + misiones (compacto arriba)
  const missions = generateDailyMissions();
  const completed = getMissionsCompleted();
  html += `<div class="card" style="display:flex;gap:12px;align-items:center;cursor:pointer;" onclick="renderLumiProfile()">
    <div class="welo-mascot sm">${lumiSVG(updateLumiDaily())}</div>
    <div style="flex:1;">
      <p style="font-size:0.8rem;font-weight:600;">Misiones: ${completed}/3 ${completed>=3?'🎁':''}</p>
      <div style="height:4px;background:#eee;border-radius:2px;margin-top:4px;"><div style="height:100%;width:${(completed/3)*100}%;background:var(--primary);border-radius:2px;"></div></div>
    </div>
    ${completed>=3 && !missions.chestOpened ? `<button class="btn-primary" style="padding:8px 16px;font-size:0.75rem;width:auto;" onclick="event.stopPropagation();openChestUI()">🎁</button>` : ''}
  </div>`;
  
  // Mensaje del día
  html += `<div class="card" style="text-align:center;padding:16px;">
    <p style="font-size:0.85rem;font-style:italic;line-height:1.5;">${mensaje}</p>
  </div>`;

  // Reto del día
  html += `<div class="card"><h3 style="font-size:0.9rem;margin-bottom:8px;">🎯 Reto de hoy</h3><p id="reto-text" style="font-size:0.85rem;line-height:1.4;">${retos[dayOfYear()%retos.length]}</p><button class="btn-primary" style="margin-top:12px;" onclick="completeMission('reto');addXP(15);this.textContent='✅ +15 XP';this.disabled=true;">✅ ¡Hecho!</button><button class="btn-ghost" style="font-size:0.75rem;" onclick="refreshReto()">🔄 Otro reto</button></div>`;

  // Pregunta del día
  const pregunta = preguntasDelDia[dayOfYear() % preguntasDelDia.length];
  html += `<div class="card" style="border-left:4px solid var(--glow);">
    <h3 style="font-size:0.9rem;margin-bottom:8px;">💬 Pregunta del día</h3>
    <p id="pregunta-text" style="font-size:0.9rem;line-height:1.5;font-style:italic;">${pregunta}</p>
    <button class="btn-primary" style="margin-top:8px;font-size:0.8rem;" onclick="completeMission('pregunta');addXP(10);this.textContent='✅ +10 XP';this.disabled=true;">Respondida ✅</button>
    <button class="btn-ghost" style="font-size:0.75rem;" onclick="refreshPregunta()">🔄 Otra</button>
  </div>`;
  
  // Ciclo (solo para ella)
  if(info && profile.role === 'ella') {
    const progress = Math.round((info.cycleDay / info.cycleLen) * 100);
    html += `<div class="card" style="display:flex;align-items:center;gap:16px;">
      <div style="width:70px;height:70px;border-radius:50%;background:conic-gradient(var(--primary) ${progress}%,#f0f0f0 0%);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <div style="width:55px;height:55px;border-radius:50%;background:white;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <span style="font-size:1.2rem;font-weight:800;color:var(--primary);">${info.cycleDay}</span>
        </div>
      </div>
      <div>
        <p style="font-size:0.9rem;font-weight:600;">Fase ${info.phase}</p>
        <p style="font-size:0.75rem;color:var(--text-light);">~${info.daysToNext} días para próx. periodo</p>
      </div>
    </div>`;
  }

  // Reconocimiento
  html += `<div class="card">
    <h3 style="font-size:0.9rem;margin-bottom:8px;">💕 ¿Cómo te hizo sentir hoy?</h3>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">
      <button class="btn-outline" style="font-size:0.75rem;padding:8px 12px;" onclick="sendRecognition('escuchad@')">💬 Escuchad@</button>
      <button class="btn-outline" style="font-size:0.75rem;padding:8px 12px;" onclick="sendRecognition('querid@')">🤗 Querid@</button>
      <button class="btn-outline" style="font-size:0.75rem;padding:8px 12px;" onclick="sendRecognition('apoyad@')">💪 Apoyad@</button>
      <button class="btn-outline" style="font-size:0.75rem;padding:8px 12px;" onclick="sendRecognition('reír')">😊 Reír</button>
      <button class="btn-outline" style="font-size:0.75rem;padding:8px 12px;" onclick="sendRecognition('sorprendid@')">🎁 Sorpresa</button>
    </div>
  </div>`;

  // Dato curioso + blog access
  html += `<div class="card" style="padding:14px 18px;display:flex;justify-content:space-between;align-items:center;">
    <p style="font-size:0.8rem;color:var(--text-light);flex:1;">💡 ${dato}</p>
    <button class="btn-outline" style="padding:6px 12px;font-size:0.7rem;flex-shrink:0;margin-left:8px;" onclick="renderBlog()">📖 Blog</button>
  </div>`;

  // Streak + Badges + Album compact
  const badges = freshCouple.badges || [];
  const memCount = getMemories().length;
  html += `<div class="card" style="display:flex;justify-content:space-between;align-items:center;">
    <div><span style="font-size:0.8rem;">🔥 ${streak} días</span> <span style="font-size:0.7rem;color:var(--text-light);">• 🏅 ${badges.length}/${allBadges.length}</span></div>
    <div style="display:flex;gap:6px;">
      <button class="btn-outline" style="padding:6px 12px;font-size:0.7rem;" onclick="renderAlbum()">📸 ${memCount}</button>
      <button class="btn-outline" style="padding:6px 12px;font-size:0.7rem;" onclick="shareResults()">📲</button>
      <button class="btn-outline" style="padding:6px 12px;font-size:0.7rem;" onclick="renderLeaderboard()">🏆</button>
    </div>
  </div>`;
  
  document.getElementById('app-content').innerHTML = html;
}

function renderCalendar() {
  const profile = getProfile();
  const info = getCycleInfo(today());
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  
  // Month navigation state
  if(!window._calMonth) window._calMonth = new Date().getMonth();
  if(!window._calYear) window._calYear = new Date().getFullYear();
  const month = window._calMonth;
  const year = window._calYear;
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const todayStr = today();
  const logs = getLogs();
  const isCurrentMonth = (month === new Date().getMonth() && year === new Date().getFullYear());

  let html = `<div class="gradient-header">
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <button onclick="navMonth(-1)" style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;padding:8px;">←</button>
      <div style="text-align:center;"><h2 style="font-size:1.2rem;">${months[month]} ${year}</h2><p style="font-size:0.75rem;opacity:0.8;">Tu ciclo visualizado</p></div>
      <button onclick="navMonth(1)" style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;padding:8px;${isCurrentMonth?'opacity:0.3;':''}">→</button>
    </div>
  </div>`;
  
  // Cycle info card con explicación de fase
  if(info) {
    const phaseInfo = {
      'Menstrual': {emoji:'🩸',color:'#c62828',bg:'#ffebee',desc:'Tu cuerpo se renueva. Hormonas en su punto más bajo.',energy:'Baja',tip:'Descansa sin culpa. Calor local para cólicos. Yoga suave.',avoid:'HIIT intenso, decisiones grandes, cafeína excesiva.'},
      'Folicular': {emoji:'🌱',color:'#2e7d32',bg:'#e8f5e9',desc:'Estrógenos suben. Energía, creatividad y optimismo.',energy:'Subiendo ↑',tip:'Es tu momento para HIIT, proyectos nuevos y socializar.',avoid:'Nada — ¡aprovecha la energía!'},
      'Ovulación': {emoji:'☀️',color:'#e65100',bg:'#fff3e0',desc:'Pico hormonal. Máxima confianza, atracción y sociabilidad.',energy:'ALTA ⚡',tip:'Citas, deporte social, presentaciones, fotos. Tu mejor momento.',avoid:'Aislarte — tu cuerpo quiere conectar.'},
      'Lútea': {emoji:'🌙',color:'#1565c0',bg:'#e3f2fd',desc:'Progesterona sube. Posible irritabilidad y antojos.',energy:'Bajando ↓',tip:'Pilates, autocuidado, chocolate oscuro, paciencia contigo.',avoid:'Tomar decisiones impulsivas, privarte de carbos.'}
    };
    const pi = phaseInfo[info.phase];
    
    html += `<div class="card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <div style="width:60px;height:60px;border-radius:50%;background:${pi.bg};display:flex;align-items:center;justify-content:center;font-size:1.8rem;">${pi.emoji}</div>
        <div>
          <p style="font-size:0.75rem;color:var(--text-light);">Hoy estás en</p>
          <p style="font-size:1.5rem;font-weight:800;color:${pi.color};">Día ${info.cycleDay} — ${info.phase}</p>
        </div>
      </div>
      <p style="font-size:0.85rem;line-height:1.5;margin-bottom:12px;">${pi.desc}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="padding:10px;background:${pi.bg};border-radius:10px;"><p style="font-size:0.65rem;color:var(--text-light);margin-bottom:2px;">Energía</p><p style="font-size:0.8rem;font-weight:600;">${pi.energy}</p></div>
        <div style="padding:10px;background:${pi.bg};border-radius:10px;"><p style="font-size:0.65rem;color:var(--text-light);margin-bottom:2px;">Fertilidad</p><p style="font-size:0.8rem;font-weight:600;">${info.fertility==='alta'?'🔴 Alta':info.fertility==='media'?'🟡 Media':'🟢 Baja'}</p></div>
        <div style="padding:10px;background:${pi.bg};border-radius:10px;"><p style="font-size:0.65rem;color:var(--text-light);margin-bottom:2px;">Próx. periodo</p><p style="font-size:0.8rem;font-weight:600;">~${info.daysToNext} días</p></div>
        <div style="padding:10px;background:${pi.bg};border-radius:10px;"><p style="font-size:0.65rem;color:var(--text-light);margin-bottom:2px;">Duración ciclo</p><p style="font-size:0.8rem;font-weight:600;">${info.cycleLen} días</p></div>
      </div>
    </div>`;

    // Tips de la fase
    html += `<div class="card" style="border-left:4px solid ${pi.color};">
      <h4 style="font-size:0.85rem;margin-bottom:8px;">✅ Qué hacer en fase ${info.phase}</h4>
      <p style="font-size:0.82rem;color:var(--text-light);line-height:1.5;margin-bottom:8px;">${pi.tip}</p>
      <h4 style="font-size:0.85rem;margin-bottom:4px;margin-top:10px;">❌ Evitar</h4>
      <p style="font-size:0.82rem;color:var(--text-light);line-height:1.5;">${pi.avoid}</p>
    </div>`;

    // Para él (si es el perfil masculino)
    if(profile.role === 'el') {
      const tipsEl = {
        'Menstrual':'Paciencia extra. No preguntes "¿estás bien?" 10 veces. Tráele algo caliente, chocolate, o simplemente acompáñala en silencio.',
        'Folicular':'¡Aprovecha! Propón planes activos. Tiene energía para citas, salir, deporte juntos.',
        'Ovulación':'Citas, atención, presencia. Se siente genial — tu rol es estar ahí y disfrutar.',
        'Lútea':'No lo tomes personal. Espacio + cariño sin presión. No intentes "arreglar" cómo se siente.'
      };
      html += `<div class="card" style="border-left:4px solid var(--blue);background:rgba(74,144,217,0.03);">
        <h4 style="font-size:0.85rem;margin-bottom:6px;">🧠 Para ti hoy</h4>
        <p style="font-size:0.82rem;color:var(--text-light);line-height:1.5;">${tipsEl[info.phase]}</p>
      </div>`;
    }
  }

  // Calendar grid
  html += `<div class="card"><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;">`;
  ['Lu','Ma','Mi','Ju','Vi','Sá','Do'].forEach(d => {
    html += `<div style="font-size:0.65rem;font-weight:600;color:var(--text-light);padding:6px 0;">${d}</div>`;
  });
  for(let i=0;i<offset;i++) html += `<div></div>`;
  for(let d=1;d<=daysInMonth;d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayInfo = getCycleInfo(dateStr);
    const isToday = dateStr === todayStr;
    const hasLog = logs[dateStr];
    let bg = 'transparent';
    let color = 'var(--text)';
    let border = 'none';
    if(dayInfo) {
      if(dayInfo.phase==='Menstrual') { bg='#ef5350'; color='white'; }
      else if(dayInfo.phase==='Ovulación') { bg='#ffcc02'; color='#f57f17'; }
      else if(dayInfo.phase==='Folicular' && dayInfo.cycleDay >= dayInfo.cycleLen-14-5) { bg='#c8e6c9'; color='#2e7d32'; }
    }
    if(isToday) border = '2px solid var(--primary)';
    if(hasLog) border = '2px solid var(--glow)';
    html += `<div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:0.75rem;font-weight:500;background:${bg};color:${color};border:${border};">${d}</div>`;
  }
  html += `</div>
    <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;">
      <span style="font-size:0.7rem;display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#ef5350;"></span>Periodo</span>
      <span style="font-size:0.7rem;display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#c8e6c9;"></span>Fértil</span>
      <span style="font-size:0.7rem;display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:#ffcc02;"></span>Ovulación</span>
      <span style="font-size:0.7rem;display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;border:2px solid var(--primary);"></span>Hoy</span>
      <span style="font-size:0.7rem;display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;border:2px solid var(--glow);"></span>Mood registrado</span>
    </div>
  </div>`;

  // Síntomas esperados por fase
  if(info) {
    const symptoms = {
      'Menstrual': ['Cólicos','Fatiga','Dolor lumbar','Sensibilidad pechos','Hinchazón'],
      'Folicular': ['Más energía','Piel más clara','Buen humor','Creatividad alta','Sociabilidad'],
      'Ovulación': ['Moco cervical','Libido alta','Confianza','Leve dolor ovario','Temperatura sube'],
      'Lútea': ['Irritabilidad','Antojos dulce/sal','Hinchazón','Acné','Sueño excesivo']
    };
    html += `<div class="card">
      <h4 style="font-size:0.85rem;margin-bottom:10px;">🔮 Síntomas esperados en ${info.phase}</h4>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${symptoms[info.phase].map(s=>`<span style="padding:5px 12px;background:rgba(255,107,157,0.06);border-radius:20px;font-size:0.75rem;">${s}</span>`).join('')}
      </div>
      <p style="font-size:0.7rem;color:var(--text-light);margin-top:10px;">Cada cuerpo es diferente. Registra tus síntomas para descubrir tus patrones.</p>
    </div>`;
  }

  // Quick mood log
  html += `<div class="card">
    <h4 style="font-size:0.9rem;margin-bottom:4px;">¿Cómo te sientes hoy?</h4>
    <p style="font-size:0.7rem;color:var(--text-light);margin-bottom:10px;">Registra para descubrir patrones en tu ciclo</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button class="btn-outline" style="font-size:1.2rem;padding:8px 12px;" onclick="quickMood('happy')">😊</button>
      <button class="btn-outline" style="font-size:1.2rem;padding:8px 12px;" onclick="quickMood('sad')">😢</button>
      <button class="btn-outline" style="font-size:1.2rem;padding:8px 12px;" onclick="quickMood('irritable')">😠</button>
      <button class="btn-outline" style="font-size:1.2rem;padding:8px 12px;" onclick="quickMood('tired')">😴</button>
      <button class="btn-outline" style="font-size:1.2rem;padding:8px 12px;" onclick="quickMood('loving')">🥰</button>
      <button class="btn-outline" style="font-size:1.2rem;padding:8px 12px;" onclick="quickMood('anxious')">😰</button>
      <button class="btn-outline" style="font-size:1.2rem;padding:8px 12px;" onclick="quickMood('energetic')">⚡</button>
      <button class="btn-outline" style="font-size:1.2rem;padding:8px 12px;" onclick="quickMood('cramps')">🤕</button>
    </div>
    <p style="font-size:0.7rem;color:var(--text-light);margin-top:8px;">+5 XP por registrar</p>
  </div>`;

  // Mood history (last 7 days)
  const moodEmojis = {happy:'😊',sad:'😢',irritable:'😠',tired:'😴',loving:'🥰',anxious:'😰',energetic:'⚡',cramps:'🤕'};
  const last7 = [];
  for(let i=6;i>=0;i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const ds = d.toISOString().split('T')[0];
    const dayName = ['Do','Lu','Ma','Mi','Ju','Vi','Sá'][d.getDay()];
    last7.push({day:dayName,mood:logs[ds]?logs[ds].mood:null});
  }
  html += `<div class="card">
    <h4 style="font-size:0.85rem;margin-bottom:10px;">📊 Últimos 7 días</h4>
    <div style="display:flex;justify-content:space-between;">
      ${last7.map(d=>`<div style="text-align:center;"><p style="font-size:0.65rem;color:var(--text-light);">${d.day}</p><p style="font-size:1.2rem;margin-top:4px;">${d.mood?moodEmojis[d.mood]||'·':'·'}</p></div>`).join('')}
    </div>
  </div>`;

  // Resumen rápido de las 4 fases
  html += `<div class="card">
    <h4 style="font-size:0.85rem;margin-bottom:12px;">📖 Las 4 fases de tu ciclo</h4>
    <div style="display:grid;gap:8px;">
      <div style="padding:10px;border-radius:10px;background:#ffebee;display:flex;gap:10px;align-items:center;"><span style="font-size:1.2rem;">🩸</span><div><p style="font-size:0.8rem;font-weight:600;color:#c62828;">Menstrual (día 1-${info?info.periodDur:5})</p><p style="font-size:0.7rem;color:#636e72;">Descanso, calor, jengibre. Tu invierno.</p></div></div>
      <div style="padding:10px;border-radius:10px;background:#e8f5e9;display:flex;gap:10px;align-items:center;"><span style="font-size:1.2rem;">🌱</span><div><p style="font-size:0.8rem;font-weight:600;color:#2e7d32;">Folicular (día ${info?info.periodDur+1:6}-${info?info.cycleLen-15:13})</p><p style="font-size:0.7rem;color:#636e72;">Energía sube. Proyectos, HIIT, socializar.</p></div></div>
      <div style="padding:10px;border-radius:10px;background:#fff3e0;display:flex;gap:10px;align-items:center;"><span style="font-size:1.2rem;">☀️</span><div><p style="font-size:0.8rem;font-weight:600;color:#e65100;">Ovulación (día ${info?info.cycleLen-14:14}-${info?info.cycleLen-12:16})</p><p style="font-size:0.7rem;color:#636e72;">Pico. Confianza, citas, deporte social.</p></div></div>
      <div style="padding:10px;border-radius:10px;background:#e3f2fd;display:flex;gap:10px;align-items:center;"><span style="font-size:1.2rem;">🌙</span><div><p style="font-size:0.8rem;font-weight:600;color:#1565c0;">Lútea (día ${info?info.cycleLen-12+1:17}-${info?info.cycleLen:28})</p><p style="font-size:0.7rem;color:#636e72;">Autocuidado, carbos, paciencia. Tu otoño.</p></div></div>
    </div>
  </div>`;

  document.getElementById('app-content').innerHTML = html;
}

function quickMood(mood) {
  const logs = getLogs();
  const t = today();
  if(!logs[t]) logs[t] = {};
  logs[t].mood = mood;
  setLogs(logs);
  addXP(5);
  completeMission('mood');
  renderCalendar();
}

// Cycle calculation
function getCycleInfo(d) {
  const p = getProfile();
  if(!p || !p.lastPeriodStart) return null;
  const lp=new Date(p.lastPeriodStart), t=new Date(d), cl=p.cycleLength||28, pd=p.periodDuration||5;
  const diff=Math.floor((t-lp)/(864e5));
  let cd=((diff%cl)+cl)%cl+1;
  const ov=cl-14, fs=ov-5, fe=ov+1;
  let phase, fertility='baja';
  if(cd<=pd) { phase='Menstrual'; }
  else if(cd<ov-1) { phase='Folicular'; if(cd>=fs) fertility='media'; }
  else if(cd>=ov-1&&cd<=ov+1) { phase='Ovulación'; fertility='alta'; }
  else { phase='Lútea'; }
  return {cycleDay:cd, phase, cycleLen:cl, fertility, daysToNext:cl-cd+1, periodDur:pd};
}

// Content
const datosCuriosos = [
  "El útero genera la misma presión que una serpiente constrictora durante contracciones. 🐍",
  "Las parejas que ríen juntas 1x/día duran 40% más. 😂",
  "Un abrazo de 20 seg libera oxitocina suficiente para bajar presión arterial. 🤗",
  "El 90% de la serotonina se produce en el intestino. Tu dieta = tu humor. 🥗",
  "Las parejas que dicen 'nosotros' resuelven conflictos 33% más rápido. 👫",
  "Mirar a los ojos 4 min activa las mismas zonas cerebrales que el enamoramiento. 👁️",
  "Caminar 30 min reduce cortisol igual que meditar. 🌊",
  "Las parejas que entrenan juntas reportan 67% más satisfacción. 🏋️",
  "Decir 'gracias' diario: +35% satisfacción relacional. 🙏",
  "El chocolate oscuro tiene magnesio que relaja los músculos uterinos. 🍫",
  "Dormir en cucharita sincroniza el ritmo cardíaco de la pareja. 💤",
  "Las parejas que viajan juntas reportan más intimidad que las que no. ✈️",
  "Cocinar juntos activa las mismas áreas del cerebro que jugar en equipo. 🧑‍🍳",
  "Bailar 15 min juntos reduce cortisol como 30 min de meditación. 💃",
  "Los besos liberan dopamina, serotonina y oxitocina a la vez. Triple. 💋",
  "Hacer nuevas actividades juntos reactiva la fase de enamoramiento. 🧪",
  "Las parejas que se tocan casualmente (manos, hombros) reportan más confianza. 🤝",
  "Reírse juntos durante un conflicto reduce la tensión en 40%. 😄",
  "El contacto piel con piel reduce la percepción del dolor. 🩹",
  "Las parejas con rituales (café juntos, paseo nocturno) duran más. ☕"
];

const mensajesElla = [
  "Eres suficiente tal como eres hoy. 🌸",
  "Tu cuerpo es sabio. Escúchalo. 💫",
  "Sentir no es debilidad, es valentía. 🦋",
  "Tu ciclo es un superpoder. 💪",
  "Hoy mereces descanso sin culpa. ☁️",
  "No necesitas ser productiva para tener valor. 🌺",
  "Lo que sientes es válido, siempre. 💗"
];

const insightsEl = [
  "Ella necesita sentirse escuchada antes de querer soluciones. Primero empatía.",
  "Los pequeños gestos diarios > grandes gestos esporádicos.",
  "Si está irritable no es por ti. Pero cómo reacciones SÍ es por ti.",
  "Un 'lo siento' sin excusas vale más que mil justificaciones.",
  "Tu presencia tranquila vale más que intentar 'arreglar' todo.",
  "No intentes 'ganar'. Intenten ganar JUNTOS contra el problema.",
  "Ella no quiere que la salves. Quiere que la acompañes."
];

const preguntasDelDia = [
  "¿Qué fue lo mejor de tu día? 🌟",
  "¿Hay algo que te preocupa y no me has contado? 💭",
  "¿Qué es algo nuevo que quisieras intentar conmigo? 🎯",
  "¿Cuándo te sentiste más cercana/o a mí esta semana? 💕",
  "Si pudiéramos repetir un día juntos, ¿cuál? 🔄",
  "¿Qué necesitas de mí que no te estoy dando? 🤔",
  "¿Cuál es tu recuerdo favorito de nosotros? 📸",
  "¿En qué momento del día me extrañas más? ⏰",
  "¿Hay algo que te gustaría que hiciéramos diferente? 🌱",
  "¿Qué te hizo enamorarte de mí? 💗",
  "¿Cuál es tu canción que te recuerda a mí? 🎵",
  "¿Qué admiras de mí que nunca dices? 🌟",
  "¿Cuál fue el momento más divertido juntos? 😂",
  "¿Hay algo que te gustaría que dejara de hacer? 🤝",
  "¿Qué sueño te gustaría que cumpliéramos juntos? ✨",
  "¿Cuál es tu forma favorita de pasar tiempo conmigo? 🧡",
  "¿Qué es lo que más te gusta de nuestra rutina? ☕",
  "¿Hay algo que quieras intentar este mes? 📅",
  "¿Cómo puedo hacerte sentir más querid@? 💌",
  "¿Qué aprendiste de mí que no esperabas? 🧠",
  "¿Cuándo fue la última vez que te sentiste realmente feliz? 😊",
  "¿Qué plan te gustaría hacer este fin de semana? 🗓️",
  "¿Hay algún tema que deberíamos hablar y no lo hacemos? 💬",
  "¿Qué es lo más valiente que has hecho por nosotros? 💪",
  "Si tuviéramos un día sin responsabilidades, ¿qué haríamos? 🌈"
];

const retos = [
  "Dile 3 cosas que admiras sin que pregunte 💬",
  "Prepárale su bebida favorita ☕",
  "10 min sin celular mirándose 👀",
  "Abrazo de 30 segundos al llegar 🤗",
  "Hazle un cumplido que no sea sobre su físico 🧠",
  "Pregúntale cómo fue su día y ESCUCHA 5 min 👂",
  "Propón un plan para mañana (tú decides) 🎯",
  "Mándale un mensaje bonito sin razón 💌",
  "Cocina algo simple para los dos 🍳",
  "Dile qué es lo que más te enamoró de ella/él 💕",
  "Hoy: cero quejas. Solo agradecimiento 🙏",
  "Dale un masaje de 5 min sin que lo pida 💆",
  "Ponle una canción que te recuerde a ella/él 🎵",
  "Escríbele una nota y escóndela donde la encuentre 📝",
  "Dile 'lo siento' por algo pendiente (aunque sea pequeño) 🤝",
  "Hazle una pregunta que nunca le hayas hecho 💭",
  "Planea una micro-cita de 30 min hoy 🌟",
  "Dale las gracias por algo específico de esta semana 🙌",
  "Comparte un recuerdo bonito que no le hayas contado 📸",
  "Ofrece ayuda en algo sin que te lo pida ✋",
  "Pon su canción favorita y baila con ella/él 💃",
  "Dile algo que te haya hecho reír esta semana 😂",
  "Comparte tu sueño más reciente (literal, dormido) 💤",
  "Hazle un dibujo (por malo que sea) de ustedes dos ✏️",
  "Dile qué parte del día te gusta más pasar con ella/él ⏰",
  "Invéntale un apodo nuevo y cariñoso 💗",
  "Míralo/a a los ojos 60 segundos sin hablar 👁️",
  "Cuéntale algo de tu infancia que no sepa 🧒",
  "Proponle que elija la película de hoy (sin opinar) 🎬",
  "Dile en voz alta por qué estás orgullos@ de la relación 🏆"
];

// Refresh functions
function refreshDato() {
  const el = document.getElementById('dato-text');
  if(el) el.textContent = datosCuriosos[Math.floor(Math.random()*datosCuriosos.length)];
}
function refreshReto() {
  const el = document.getElementById('reto-text');
  if(el) el.textContent = retos[Math.floor(Math.random()*retos.length)];
}
function refreshPregunta() {
  const el = document.getElementById('pregunta-text');
  if(el) el.textContent = preguntasDelDia[Math.floor(Math.random()*preguntasDelDia.length)];
}
function sendRecognition(type) {
  const logs = getLogs();
  const t = today();
  if(!logs[t]) logs[t] = {};
  logs[t].recognition = type;
  setLogs(logs);
  addXP(10);
  completeMission('reconocimiento');
  const profile = getProfile();
  const other = profile.role === 'ella' ? 'Él' : 'Ella';
  // Show confirmation
  const cards = document.querySelectorAll('.card');
  const recCard = cards[cards.length - 2]; // Recognition card
  if(recCard) {
    recCard.innerHTML = `<h3 style="font-size:0.9rem;margin-bottom:8px;">💕 Reconocimiento</h3><p style="font-size:0.9rem;text-align:center;color:var(--secondary);padding:12px 0;">✨ "${other} me hizo sentir ${type} hoy" — +10 XP 💕</p>`;
  }
}

// Chest UI
function openChestUI() {
  const reward = openDailyChest();
  if(!reward) return;
  showToast(`🎁 ${reward.text}`);
  renderHome();
}

// Calendar month navigation
function navMonth(dir) {
  if(!window._calMonth && window._calMonth!==0) window._calMonth = new Date().getMonth();
  if(!window._calYear) window._calYear = new Date().getFullYear();
  window._calMonth += dir;
  if(window._calMonth > 11) { window._calMonth = 0; window._calYear++; }
  if(window._calMonth < 0) { window._calMonth = 11; window._calYear--; }
  // Don't go into future
  const now = new Date();
  if(window._calYear > now.getFullYear() || (window._calYear === now.getFullYear() && window._calMonth > now.getMonth())) {
    window._calMonth = now.getMonth(); window._calYear = now.getFullYear();
  }
  renderCalendar();
}

// Level up celebration
function celebrateIfNewLevel() {
  const co = getCouple();
  const currentLevel = getLevelNum(co.xp);
  const lastLevel = co.lastCelebratedLevel || 0;
  if(currentLevel > lastLevel) {
    co.lastCelebratedLevel = currentLevel;
    setCouple(co);
    showCelebration(getLevel(co.xp));
  }
}
function showCelebration(levelName) {
  let overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s;';
  overlay.innerHTML = `<div style="background:white;border-radius:24px;padding:40px;text-align:center;max-width:320px;animation:fadeIn 0.5s;">
    <p style="font-size:3rem;margin-bottom:12px;">🎉</p>
    <h2 style="font-size:1.3rem;margin-bottom:8px;">¡Nuevo nivel!</h2>
    <p style="font-size:1.5rem;font-weight:800;color:#c44569;margin-bottom:12px;">${levelName}</p>
    <p style="font-size:0.85rem;color:#636e72;margin-bottom:20px;">Siguen creciendo juntos. Lumi está orgullosa ✨</p>
    <button onclick="this.parentElement.parentElement.remove()" style="padding:12px 32px;background:linear-gradient(135deg,#ff6b9d,#c44569);color:white;border:none;border-radius:50px;font-weight:700;font-size:1rem;cursor:pointer;">¡Genial!</button>
  </div>`;
  overlay.onclick = function(e) { if(e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

// Leaderboard view
function renderLeaderboard() {
  const lb = getLeaderboard();
  let html = `<div class="gradient-header"><h2>🏆 Ranking</h2><p>¿Quién la está rompiendo?</p></div>`;
  lb.forEach((p,i) => {
    const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
    const highlight = p.isMe ? 'background:rgba(255,107,157,0.08);border:2px solid var(--primary);' : '';
    html += `<div class="card" style="${highlight}padding:16px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:1.2rem;font-weight:800;width:28px;">${medal||'#'+(i+1)}</span>
      <div style="flex:1;">
        <p style="font-size:0.9rem;font-weight:600;">${p.name}</p>
        <p style="font-size:0.7rem;color:var(--text-light);">${p.city} • 🔥 ${p.streak} días</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:0.95rem;font-weight:700;color:var(--primary);">${p.xp} XP</p>
        <p style="font-size:0.65rem;color:var(--text-light);">${getLevel(p.xp)}</p>
      </div>
    </div>`;
  });
  html += `<div class="card" style="text-align:center;">
    <p style="font-size:0.8rem;color:var(--text-light);margin-bottom:12px;">Sube de posición completando retos, jugando y manteniendo tu racha 🔥</p>
    <button class="btn-primary" style="font-size:0.85rem;" onclick="shareResults()">📲 Presumir mi posición</button>
  </div>`;
  html += `<button class="btn-ghost" onclick="renderHome();renderLumiCorner('home');">← Volver</button>`;
  document.getElementById('app-content').innerHTML = html;
}

// Auto-init if profile exists
if(getProfile()) {
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  initApp();
}
// Inject Lumi SVG in onboarding mascots
document.querySelectorAll('#onboarding .welo-mascot').forEach(el => {
  el.innerHTML = lumiSVG();
});
