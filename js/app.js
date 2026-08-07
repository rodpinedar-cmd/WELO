// WELO — App Core

// Global error boundary: capture unhandled errors and send to analytics
window.addEventListener('error', function(e) {
  if(window.welo && window.welo.track) window.welo.track('js_error', { message: e.message, source: e.filename, line: e.lineno });
});
window.addEventListener('unhandledrejection', function(e) {
  if(window.welo && window.welo.track) window.welo.track('js_error', { message: String(e.reason), type: 'promise' });
});

function initApp() {
  const profile = getProfile();
  if(!profile) return;
  if(profile.role === 'el') document.body.classList.add('male');

  // Sync retry: if registration was offline, attempt to sync now
  if(profile.supabasePending && typeof supabase !== 'undefined' && supabase && typeof signUp === 'function') {
    signUp(profile.email || '', '', profile.role || 'pending').then(function(res) {
      if(!res.error || (res.error && res.error.includes('already'))) {
        profile.supabasePending = false;
        setProfile(profile);
        if(window.welo && window.welo.track) window.welo.track('sync_retry_success');
      }
    }).catch(function() { /* silent — will retry next visit */ });
  }

  // Analytics: app opened
  if(window.welo && window.welo.track) {
    const co = getCouple();
    window.welo.track('app_opened', { role: profile.role, streak: co.streak || 0, xp: co.xp || 0, level: getLevel(co.xp || 0) });
  }

  // Couple Sync: fetch shared progress (async, non-blocking)
  if(window.CoupleSync && window.CoupleSync.fetch) window.CoupleSync.fetch();
  renderHome();
  renderLumiCorner('home');
  
  // Nav
  document.getElementById('bottom-nav').addEventListener('click', function(e) {
    const btn = e.target.closest('.nav-btn');
    if(!btn) return;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    // Analytics: tab switch
    if(window.welo && window.welo.track) window.welo.track('tab_switched', { tab: tab });
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
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2>✨ WELO <span id="partner-mood-dot"></span></h2>
        <button onclick="toggleDarkMode()" style="background:none;border:none;font-size:1.2rem;cursor:pointer;opacity:0.8;" aria-label="Modo oscuro">${document.body.classList.contains('dark')?'☀️':'🌙'}</button>
      </div>
      <p style="font-size:0.75rem;opacity:0.8;">🔥 ${streak} días • ${freshCouple.xp} XP • ${getLevel(freshCouple.xp)}</p>
      ${window.CoupleSync && window.CoupleSync.isConnected() ? `<p style="font-size:0.65rem;opacity:0.6;">👫 Pareja: ${window.CoupleSync.getProgress().couple_xp || 0} XP • 🔥 ${window.CoupleSync.getProgress().couple_streak || 0}</p>` : ''}
    </div>`;

  // Mood Sync pill
  if (typeof renderMoodPill === 'function') {
    html += `<div class="card" style="text-align:center;padding:12px;">
      ${renderMoodPill()}
      <div id="mood-selector" style="display:none;"></div>
    </div>`;
  }

  // Upcoming special dates alert
  if (typeof checkUpcomingDates === 'function') {
    const upcoming = checkUpcomingDates();
    if (upcoming.length > 0) {
      const next = upcoming[0];
      html += `<div class="card" style="background:linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,215,0,0.02));border:1.5px solid rgba(255,215,0,0.3);padding:14px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:1.5rem;">🎉</span>
        <div style="flex:1;">
          <p style="font-size:0.85rem;font-weight:700;color:var(--text);margin:0;">${next.name}</p>
          <p style="font-size:0.75rem;color:var(--text-light);margin:0;">${next.daysLeft === 0 ? '¡Es hoy!' : 'En ' + next.daysLeft + ' día' + (next.daysLeft > 1 ? 's' : '')}</p>
        </div>
      </div>`;
    }
  }

  // Lumi mini + misiones (compacto arriba)
  const missions = generateDailyMissions();
  const completed = getMissionsCompleted();
  html += `<div class="card" style="display:flex;gap:12px;align-items:center;">
    <div class="welo-mascot sm" style="cursor:pointer;" onclick="renderLumiChat()">${lumiSVG(updateLumiDaily())}</div>
    <div style="flex:1;" onclick="renderLumiProfile()" style="cursor:pointer;">
      <p style="font-size:0.8rem;font-weight:600;">Misiones: ${completed}/3 ${completed>=3?'🎁':''}</p>
      <div style="height:4px;background:#eee;border-radius:2px;margin-top:4px;"><div style="height:100%;width:${(completed/3)*100}%;background:var(--primary);border-radius:2px;"></div></div>
    </div>
    ${completed>=3 && !missions.chestOpened ? `<button class="btn-primary" style="padding:8px 16px;font-size:0.75rem;width:auto;" onclick="event.stopPropagation();openChestUI()">🎁</button>` : `<button class="btn-outline" style="padding:6px 12px;font-size:0.7rem;width:auto;" onclick="renderLumiChat()">💬</button>`}
  </div>`;
  
  // Mensaje del día
  html += `<div class="card" style="text-align:center;padding:16px;">
    <p style="font-size:0.85rem;font-style:italic;line-height:1.5;">${mensaje}</p>
  </div>`;

  // Reto del día
  html += `<div class="card"><h3 style="font-size:0.9rem;margin-bottom:8px;">🎯 Reto de hoy</h3><p id="reto-text" style="font-size:0.85rem;line-height:1.4;">${retos[dayOfYear()%retos.length]}</p><button class="btn-primary" style="margin-top:12px;" onclick="completeMission('reto');addXP(15);this.textContent='✅ +15 XP';this.disabled=true;">✅ ¡Hecho!</button><button class="btn-ghost" style="font-size:0.75rem;" onclick="refreshReto()">🔄 Otro reto</button></div>`;

  // Daily Gratitude
  if (typeof renderGratitudeCard === 'function') {
    html += renderGratitudeCard();
  }

  // MATCH DIARIO (destacado)
  const dm = getDailyMatch();
  const matchDone = dm.today === today() && dm.todayAnswers;
  html += `<div class="card" style="border:2px solid ${matchDone?'#4caf50':'var(--primary)'};cursor:pointer;" onclick="renderDailyMatch()">
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="font-size:1.8rem;">${matchDone?'✅':'💕'}</span>
      <div style="flex:1;">
        <h4 style="font-size:0.9rem;margin-bottom:2px;">${matchDone?'Match completado':'Match Diario — ¡5 preguntas!'}</h4>
        <p style="font-size:0.75rem;color:var(--text-light);">${matchDone?'Toca para ver resultados':'Respondan y vean en qué coinciden hoy'}</p>
      </div>
      <span style="color:var(--primary);font-size:1.1rem;">→</span>
    </div>
  </div>`;

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
    <div id="recognition-received"></div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
      <button class="btn-outline" style="font-size:0.75rem;padding:8px 12px;" onclick="sendRecognition('escuchad@')">💬 Escuchad@</button>
      <button class="btn-outline" style="font-size:0.75rem;padding:8px 12px;" onclick="sendRecognition('querid@')">🤗 Querid@</button>
      <button class="btn-outline" style="font-size:0.75rem;padding:8px 12px;" onclick="sendRecognition('apoyad@')">💪 Apoyad@</button>
      <button class="btn-outline" style="font-size:0.75rem;padding:8px 12px;" onclick="sendRecognition('reír')">😊 Reír</button>
      <button class="btn-outline" style="font-size:0.75rem;padding:8px 12px;" onclick="sendRecognition('sorprendid@')">🎁 Sorpresa</button>
    </div>
  </div>`;
  
  // Load recognitions from partner (async)
  if(supabase) {
    getRecognitionsForMe().then(recs => {
      const el = document.getElementById('recognition-received');
      if(el && recs.length > 0) {
        const latest = recs[0];
        el.innerHTML = `<div style="padding:10px;background:rgba(255,107,157,0.05);border-radius:10px;margin-bottom:8px;"><p style="font-size:0.8rem;color:var(--secondary);">Tu pareja se sintió <strong>${latest.type}</strong> gracias a ti 💕</p></div>`;
      }
    });
  }

  // Dato curioso + blog access
  html += `<div class="card" style="padding:14px 18px;display:flex;justify-content:space-between;align-items:center;">
    <p style="font-size:0.8rem;color:var(--text-light);flex:1;">💡 ${dato}</p>
    <button class="btn-outline" style="padding:6px 12px;font-size:0.7rem;flex-shrink:0;margin-left:8px;" onclick="renderBlog()">📖 Blog</button>
  </div>`;

  // Invite partner card (show if no partner connected)
  if(!window.CoupleSync || !window.CoupleSync.isConnected()) {
    html += `<div class="card" style="background:linear-gradient(135deg,rgba(255,107,157,0.06),rgba(196,69,105,0.06));border:1.5px dashed rgba(255,107,157,0.3);text-align:center;padding:18px;">
      <p style="font-size:0.9rem;font-weight:700;margin-bottom:6px;color:var(--text);">📲 Invita a tu pareja</p>
      <p style="font-size:0.75rem;color:var(--text-light);margin-bottom:12px;">WELO es mejor de a dos. Envíale un link para conectarse.</p>
      <button class="btn-primary" style="width:auto;padding:10px 24px;font-size:0.85rem;" onclick="generateInviteLink()">Enviar invitación 💕</button>
    </div>`;
  }

  // Time Capsule teaser
  var readyCapsules = typeof checkCapsules === 'function' ? checkCapsules() : [];
  if (readyCapsules.length > 0) {
    html += `<div class="card" style="border:2px solid var(--glow);cursor:pointer;text-align:center;" onclick="renderTimeCapsule()">
      <p style="font-size:1.5rem;margin-bottom:4px;">💌</p>
      <p style="font-size:0.9rem;font-weight:700;">¡Tenéis ${readyCapsules.length} cápsula${readyCapsules.length>1?'s':''} del tiempo lista${readyCapsules.length>1?'s':''}!</p>
      <p style="font-size:0.75rem;color:var(--text-light);">Toca para abrir juntos →</p>
    </div>`;
  } else {
    html += `<div class="card" style="padding:14px;display:flex;align-items:center;gap:12px;cursor:pointer;" onclick="renderTimeCapsule()">
      <span style="font-size:1.3rem;">💌</span>
      <div style="flex:1;"><p style="font-size:0.82rem;font-weight:600;margin:0;">Cápsulas del Tiempo</p><p style="font-size:0.7rem;color:var(--text-light);margin:0;">Escribe un mensaje para vuestro yo futuro</p></div>
      <span style="color:var(--text-light);">→</span>
    </div>`;
  }

  // Streak + Badges + Album compact
  const badges = freshCouple.badges || [];
  const memCount = getMemories().length;
  html += `<div class="card" style="display:flex;justify-content:space-between;align-items:center;">
    <div><span style="font-size:0.8rem;">🔥 ${streak} días</span> <span style="font-size:0.7rem;color:var(--text-light);">• 🏅 ${badges.length}/${allBadges.length}</span></div>
    <div style="display:flex;gap:6px;">
      <button class="btn-outline" style="padding:6px 12px;font-size:0.7rem;" onclick="renderAlbum()">📸 ${memCount}</button>
      <button class="btn-outline" style="padding:6px 12px;font-size:0.7rem;" onclick="shareWeeklySummary()">📲 Compartir</button>
      <button class="btn-outline" style="padding:6px 12px;font-size:0.7rem;" onclick="renderLeaderboard()">🏆</button>
    </div>
  </div>`;
  
  document.getElementById('app-content').innerHTML = html;

  // Mood Sync: load partner dot (async)
  if (typeof renderPartnerDot === 'function') renderPartnerDot();
}

function renderCalendar() {
  if(window.welo && window.welo.track) window.welo.track('cycle_opened');
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

  // Period start button (only for her)
  if(profile.role === 'ella') {
    html += `<div class="card" style="display:flex;align-items:center;gap:12px;">
      <span style="font-size:1.5rem;">🩸</span>
      <div style="flex:1;"><p style="font-size:0.85rem;font-weight:600;">¿Empezó tu periodo?</p><p style="font-size:0.7rem;color:var(--text-light);">Actualiza para predicción más precisa</p></div>
      <button class="btn-outline" style="padding:8px 16px;font-size:0.75rem;" onclick="startPeriodToday()">Hoy empezó</button>
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
  "Las parejas con rituales (café juntos, paseo nocturno) duran más. ☕",
  "Las mujeres producen ~450 periodos en su vida (3,500 días). 📊",
  "Tu ciclo cambia tu voz, olfato y hasta creatividad. 🎨",
  "Durante la ovulación las pupilas se dilatan al ver a la pareja. 👁️",
  "El olfato femenino es 10,000x más sensible en ovulación. 👃",
  "El cortisol baja 50% tras 10 min de caricias. 💆",
  "70% de los conflictos de pareja son perpetuos (y está bien). 🔄",
  "El enamoramiento dura ~18 meses. El amor real empieza después. 💕",
  "Las parejas que duermen tocándose reportan más felicidad. 🛏️",
  "El humor compartido es el predictor #1 de relaciones largas. 😂",
  "Un 'te quiero' genuino activa el sistema de recompensa cerebral como la comida. 🧠",
  "Las parejas que meditan juntas sincronizan sus ondas cerebrales. 🧘",
  "El olor de tu pareja reduce el estrés más que cualquier perfume. 👃",
  "Las parejas que tienen mascota reportan 22% menos estrés. 🐶",
  "Tomarse de la mano sincroniza la respiración y el ritmo cardíaco. ❤️",
  "Las primeras 4 horas después de un conflicto son las más importantes para reparar. ⏰",
  "El 80% de las parejas felices tienen al menos 1 ritual diario compartido. 🌅",
  "Tu cerebro no distingue entre dolor emocional y físico. El rechazo DUELE. 💔",
  "Las parejas que expresan gratitud tienen 50% menos probabilidad de separarse. 🙏",
  "Cenar sin celular mejora la percepción de la calidad de la conversación en 65%. 📵",
  "Un conflicto resuelto fortalece más la relación que no haber peleado nunca. 💪",
  "El cerebro de una madre cambia permanentemente durante el embarazo. 🧠",
  "Las parejas que cocinan juntos tienen 30% menos conflictos semanales. 👨‍🍳",
  "El orgasmo libera una cantidad de oxitocina equivalente a 3 horas de abrazos. 💫",
  "Las parejas bilingües pelean menos porque cambiar de idioma desactiva la amígdala. 🗣️",
  "Tu corazón se sincroniza con el de tu pareja cuando duermen juntos. ❤️",
  "La testosterona baja un 30% en hombres que se enamoran profundamente. 🧪",
  "Oler la ropa de tu pareja reduce el cortisol igual que meditar 10 minutos. 👕",
  "Las parejas que se besan mínimo 6 segundos al despedirse reportan más satisfacción. 💋",
  "El estrógeno mejora la memoria verbal: las mujeres recuerdan más detalles en fase folicular. 📝",
  "La dopamina del enamoramiento es químicamente similar a la de la cocaína. 🎆",
  "Las parejas que hacen deporte juntos tienen 25% más satisfacción sexual. 🏃",
  "El contacto visual mutuo de 2 minutos aumenta la atracción un 45%. 👀",
  "Tu cerebro procesa un rechazo amoroso igual que un dolor físico intenso. 🩺",
  "Las parejas que se abrazan al despertar tienen mejor regulación de cortisol todo el día. 🌅",
  "La progesterona en fase lútea aumenta el deseo de comida reconfortante en 68%. 🍕",
  "Escribir cartas de gratitud a tu pareja mejora tu propia salud cardiovascular. 💌",
  "El sexo regular fortalece el sistema inmune: 30% más inmunoglobulina A. 🛡️",
  "Las parejas que mantienen amistades externas tienen relaciones 40% más estables. 👥",
  "La oxitocina es tan potente que puede hacerte ignorar defectos de tu pareja. 🫠",
  "Discutir antes de dormir empeora la calidad del sueño un 60%. 🌙",
  "Las mujeres en ovulación prefieren inconscientemente voces más graves. 🎵",
  "Sostener un café caliente en las manos hace que percibas a otros como más amables. ☕",
  "La sincronización menstrual entre amigas cercanas tiene base neurobiológica real. 🔬",
  "Las parejas que se ríen de sí mismas resuelven conflictos 50% más rápido. 😂",
  "El amor romántico activa las mismas zonas cerebrales después de 20 años que al inicio. 🧓",
  "La serotonina baja en el enamoramiento, similar a los niveles del TOC. 🔄",
  "Las parejas que planifican juntos su futuro tienen 45% más probabilidad de lograrlo. 📋",
  "El masaje de 15 minutos aumenta la dopamina un 31% en ambos participantes. 💆‍♀️",
  "Tu cerebro crea nuevas conexiones neuronales cada vez que aprendes algo de tu pareja. 🧬",
  "Las parejas que comparten tareas domésticas equitativamente reportan 65% más intimidad. 🧹",
  "El cortisol crónico reduce la libido un 40% tanto en hombres como en mujeres. 📉",
  "Dormir 7-8 horas mejora la comunicación en pareja al día siguiente en un 33%. 😴",
  "Las feromonas masculinas alteran el ciclo menstrual femenino en ciclos de convivencia. 🏠",
  "El estrés financiero es el predictor #1 de conflictos de pareja por encima de la infidelidad. 💰",
  "Las parejas que practican mindfulness juntas aumentan la empatía mutua un 28%. 🧘‍♂️",
  "El cerebro libera endorfinas al cantar juntos, creando un vínculo similar al del ejercicio. 🎤",
  "La fase folicular es el mejor momento para tomar decisiones importantes por la claridad mental. 💡",
  "Los hombres enamorados muestran mayor actividad en la corteza visual al ver a su pareja. 👁️",
  "La gratitud activa el núcleo accumbens: el mismo circuito de recompensa que el chocolate. 🍫",
  "Las parejas con al menos 5 horas de conversación semanal tienen 75% menos divorcios. 💬",
  "El nivel de vitamina D afecta directamente la producción de estrógenos y testosterona. ☀️",
  "Hacer algo nuevo juntos cada semana mantiene la dopamina elevada como al principio. 🆕",
  "La empatía cognitiva se puede entrenar: leer ficción juntos la mejora un 22%. 📚",
  "El cerebro femenino tiene un 10% más de conexiones entre hemisferios que el masculino. 🧠",
  "Las parejas que tienen un proyecto creativo compartido reportan 55% más satisfacción. 🎨",
  "El ayuno intermitente afecta hormonas reproductivas femeninas más que las masculinas. ⚠️",
  "La adrenalina de hacer actividades emocionantes juntos se confunde con atracción romántica. 🎢",
  "Las parejas que verbalizan conflictos en menos de 24h los resuelven 3x mejor. ⏰",
  "El magnesio reduce los síntomas premenstruales en un 40% según estudios clínicos. 💊",
  "Las neuronas espejo te hacen bostezar cuando tu pareja bosteza: es señal de empatía. 🪞",
  "El apego seguro en la infancia predice relaciones más estables 30 años después. 👶",
  "Caminar descalzos juntos en la naturaleza reduce la inflamación y mejora el ánimo. 🌿",
  "Las parejas que se miran a los ojos al hablar retienen 60% más información mutua. 🗨️",
  "El ciclo circadiano afecta la libido: pico de testosterona a las 8AM en hombres. ⏰",
  "La vulnerabilidad emocional activa el sistema de apego y profundiza la conexión. 🫂",
  "Las parejas con rituales de reconexión tras separarse tienen 48% más satisfacción. 🤗",
  "El intestino produce el 95% de la serotonina corporal: tu dieta afecta tu relación. 🥑",
  "Recordar juntos experiencias positivas compartidas fortalece la relación más que crear nuevas. 📸"
];

const mensajesElla = [
  "Eres suficiente tal como eres hoy. 🌸",
  "Tu cuerpo es sabio. Escúchalo. 💫",
  "Sentir no es debilidad, es valentía. 🦋",
  "Tu ciclo es un superpoder. 💪",
  "Hoy mereces descanso sin culpa. ☁️",
  "No necesitas ser productiva para tener valor. 🌺",
  "Lo que sientes es válido, siempre. 💗",
  "Pedir ayuda no es debilidad, es inteligencia. 🧠",
  "Tu energía fluctúa y eso es perfecto. 🌊",
  "Hoy eres exactamente quien necesitas ser. ✨",
  "No tienes que tener todo resuelto hoy. 🌙",
  "Tu intuición sabe más de lo que crees. 🔮",
  "Está bien no estar bien. Mañana será diferente. 🌅",
  "Mereces amor sin condiciones. Empezando por el tuyo. 💕",
  "Tu valor no depende de cuánto haces por otros. 🌟"
];

const insightsEl = [
  "Cuando ella dice 'estoy bien' con ese tono, NO preguntes más. Solo quédate cerca. Tu presencia silenciosa es la respuesta correcta.",
  "No le digas 'cálmate'. Nunca en la vida. Dile: 'Tiene sentido que te sientas así'. Punto.",
  "Si ella está irritable, tu trabajo NO es arreglarlo. Es no empeorarlo. A veces el mejor movimiento es un abrazo sin palabras.",
  "El detalle no es el regalo caro. Es recordar lo que dijo el martes y actuar el viernes sin que lo pida.",
  "Ella no quiere tu solución. Quiere saber que entiendes por qué le importa. Primero valida, después (si pide) ayuda.",
  "Si no sabes qué hacer: pregunta. 'Necesitas que escuche o que ayude?' Esa pregunta vale oro.",
  "Lo que ella interpreta como 'no te importa' es probablemente que tú estás en modo resolver y ella en modo sentir. Diferentes tiempos.",
  "El 'lo siento' sin 'pero' es un arma nuclear positiva. 'Lo siento, tienes razón' sin justificarte. Prueba la diferencia.",
  "Si ella comparte algo vulnerable y tú cambias de tema o haces un chiste — acabas de cerrar esa puerta. Puede no volver a abrirla.",
  "Sorprender no es gastar dinero. Es hacer algo que demuestre: yo escuché, yo recordé, yo pensé en ti cuando no estabas.",
  "Cuando pelean: tu objetivo no es ganar ni demostrar que tienes razón. Es que AMBOS se sientan escuchados al final.",
  "La diferencia entre 'te ayudo' y 'ya lo hice' es la diferencia entre cumplir y cuidar.",
  "Si ella necesita espacio, dárselo NO significa desaparecer. Significa: 'Estoy aquí cuando quieras. Sin presión.'",
  "El contacto físico casual (mano en la espalda, beso random, tocar el pelo) comunica más amor que 1000 palabras.",
  "Tu vulnerabilidad no la asusta — la conecta. Decir 'tengo miedo de...' o 'esto me duele' no es debilidad. Es intimidad real."
];

const preguntasDelDia = [
  "¿Qué es algo que nunca me perdonaste del todo pero decidiste dejarlo pasar?",
  "Si pudieras cambiar UNA decisión que tomamos como pareja, ¿cuál?",
  "¿Hay algo que hacía al principio y dejé de hacer que extrañas?",
  "¿Cuál es tu mayor inseguridad sobre nosotros que nunca dices en voz alta?",
  "¿En qué momento sentiste que casi nos separamos?",
  "Si alguien nos viera desde fuera, ¿qué diría que nos falta?",
  "¿Qué es lo que más te cuesta perdonar en general? ¿Lo aplicas conmigo?",
  "¿Cuándo fue la última vez que te sentiste realmente solo/a estando conmigo?",
  "¿Hay algo que te dé vergüenza admitir que necesitas de mí?",
  "¿Qué parte de tu personalidad crees que sacrificaste por esta relación?",
  "Si empezáramos de cero hoy, ¿qué harías diferente?",
  "¿Cuál fue el momento en que más te decepcioné y nunca lo hablamos?",
  "¿Qué crees que pensarías de mí si me conocieras hoy por primera vez?",
  "¿Hay algo que evitas decirme para no herirme?",
  "¿En qué aspecto crees que hemos dejado de crecer como pareja?",
  "¿Qué necesitas que cambie para que la relación sea un 10/10?",
  "Si solo pudiéramos quedarnos con 3 tradiciones nuestras, ¿cuáles eliges?",
  "¿Cuándo fue la última vez que te atraje físicamente como al principio?",
  "¿Hay algún tema que siempre termina en pelea y nunca resolvemos de verdad?",
  "¿Qué es lo que más te da miedo perder de nosotros?",
  "Si pudieras leer mi mente 1 hora, ¿qué momento elegirías?",
  "¿Qué crees que le dirías a tu yo de hace 5 años sobre nosotros?",
  "¿Cuál es tu fantasía más secreta que involucra a nuestra relación (no sexual)?",
  "¿Hay algo que hago que te irrita pero nunca mencionas porque parece tontería?",
  "¿Qué es lo más difícil de ser mi pareja que nadie más ve?",
  "Si tuviéramos un documental sobre nosotros, ¿qué título tendría?",
  "¿Cuál es la versión de mí que más te gusta y cuándo aparece?",
  "¿Qué harías si mañana yo fuera otra persona completamente diferente?",
  "¿Qué crees que es más importante: que te desee o que te admire?",
  "¿Cuándo fue la última vez que pensaste 'elegí bien'?",
  "¿Hay algo sobre nuestro futuro que te genera ansiedad pero no hablas?",
  "Si pudieras implantar un recuerdo falso bonito en mi mente, ¿cuál sería?",
  "¿Qué parte de nuestra intimidad te gustaría cambiar pero te da cosa decirlo?",
  "¿Crees que nos queremos igual que antes o diferente? ¿Cómo cambió?",
  "¿Qué es lo más valiente que podrías decirme ahora mismo?",
  "Si solo pudiéramos hacer UNA cosa juntos el resto de la vida, ¿qué eliges?",
  "¿Cuál es tu mayor arrepentimiento en esta relación?",
  "¿Hay algún sueño tuyo que sientes que la relación limita?",
  "¿Qué crees que haría falta para que volviéramos a sentir mariposas?",
  "Si mañana perdiéramos toda la memoria de nosotros, ¿crees que nos volveríamos a elegir?"
];

const retos = [
  "Escríbele un mensaje de voz de 2 min explicando qué admiras de cómo maneja algo difícil 🎤",
  "Hoy cede en algo sin que te lo pida y sin mencionarlo. Observa si lo nota 🤫",
  "Envíale una foto de algo random que te recordó a ella/él con 0 contexto 📱",
  "Pregúntale '¿qué necesitas hoy de mí?' y haz EXACTAMENTE eso, sin cuestionar 🎯",
  "Pon la canción que sonaba cuando te diste cuenta que la/lo amabas. No expliques por qué 🎵",
  "Cocina algo que sabes que le gusta pero que nunca haces porque a ti no te va 🍳",
  "Escribe en un papel 1 cosa que te cuesta de la relación y 1 que amas. Intercambien sin hablar 📝",
  "Míralo/a a los ojos 2 minutos en silencio. Sin reír, sin hablar. Solo mirar 👁️",
  "Hoy haz algo que solías hacer los primeros meses y dejaste de hacer. Que lo note 🔄",
  "Cuéntale un miedo real que tienes sobre el futuro de la relación. Sin filtro 🫣",
  "Dale un cumplido sobre algo que NO es obvio. No su físico, no su personalidad conocida. Algo que solo tú ves 🔍",
  "Hoy NO des ningún consejo. Solo escucha y valida. Cero soluciones 🤐",
  "Planifica algo para esta semana sin preguntarle nada. Tú decides todo. Sorpresa 🎁",
  "Dile qué es lo que más te cuesta de estar con ella/él. Desde el amor, no la queja 💬",
  "Hoy imita algo que ella/él hace siempre y tú nunca. Mira cómo reacciona 🪞",
  "Escríbele cómo te sentiste la primera vez que durmieron juntos. Honesto 💌",
  "Propón hacer algo que SABES que no te gusta pero a ella/él sí. Sin quejarte 🎭",
  "Dile en qué momento de hoy pensaste en ella/él sin que estuviera presente 💭",
  "Pregunta: '¿Hay algo que necesites decirme que llevas tiempo guardando?' Y calla 🔇",
  "Hoy priorízalo/a sobre tu celular cada vez que estén juntos. Celular boca abajo 📵",
  "Haz contacto físico 10 veces hoy de forma casual (hombro, mano, pelo). Sin anunciarlo 🤝",
  "Dile: 'Cuéntame algo que nunca le hayas contado a nadie'. Y comparte tú también 🗝️",
  "Encuentra una foto vieja de ustedes. Envíala con: 'Esto me hizo sonreír' 📸",
  "Pregúntale: '¿En qué crees que podría ser mejor pareja?' Sin defenderte 🌱",
  "Dedícale 15 min de atención total. Sin interrupciones, sin celular, sin pensar en otra cosa 🧘",
  "Haz algo incómodo que sabes que le haría feliz. Sal de tu zona de confort por ella/él 🏔️",
  "Dile honestamente qué te excita de ella/él que no tiene que ver con lo físico 🔥",
  "Hoy di 'gracias por...' + algo MUY específico (no genérico). Algo de HOY 🙏",
  "Proponle un reto: 'Este finde hacemos algo que ninguno ha hecho NUNCA' 🆕",
  "Pregúntale: 'Si pudieras reescribir una regla de nuestra relación, ¿cuál?' 📜",
  "Tómate 5 min para pensar: ¿qué estoy dando por sentado? Díselo 🔮",
  "Hoy inicia tú el contacto físico. No esperes. Besa, abraza, toca primero 💋",
  "Graba un audio corto describiendo tu día INCLUYENDO lo que sentiste al pensar en ella/él 🎙️",
  "Dile algo que te parece sexy de ella/él que probablemente no sepa 👀",
  "Hoy no te quejes de NADA. Si sientes ganas, reemplázalo por algo que agradeces ⚡",
  "Proponle un debate divertido: '¿Llegarías antes a la luna o yo?' + argumentos absurdos 🌙",
  "Envíale un meme que describe perfectamente vuestra relación sin explicación 😂",
  "Hoy pregúntale su opinión sobre algo que normalmente decides solo/a. Inclúyela/o 🤝",
  "Cuéntale qué creías sobre el amor antes de conocerla/o y qué piensas ahora 🧠",
  "Hazle una playlist de 5 canciones donde cada una represente un momento juntos 🎶",
  "Dile: 'Hoy quiero que me digas algo que te molesta de mí. Sin filtro. No me voy a enfadar' 💪",
  "Propón un 'reset': hoy nos comportamos como si fuera la primera semana 🔄",
  "Enséñale algo que aprendiste recientemente y explícale por qué te emocionó 🤓",
  "Mándale un screenshot de tu canción más escuchada y dile por qué 📊",
  "Hoy di 'te quiero' de una forma que NUNCA hayas usado. Inventa una nueva 💕",
  "Proponle: 'Hoy cada uno dice 1 verdad incómoda y 1 bonita. Sin juzgar' ⚖️",
  "Dile cuál fue el momento exacto de esta semana en que pensaste 'qué suerte' 🍀",
  "Haz algo absurdo para hacerle reír: baila mal a propósito, inventa una voz, sé ridículo 🤡",
  "Pregúntale: 'Si pudieras darme un manual de instrucciones, ¿qué diría la primera página?' 📖",
  "Cierra los ojos. Piensa en 1 cosa que amas de ella/él. Ábrelos y dísela AHORA 👁️"
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
  
  // Send to Supabase (partner will see it)
  if(supabase) {
    sendRecognitionDB(type).then(res => {
      if(res.error) console.warn('Recognition error:', res.error);
    });
  }
  
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

// Dark Mode Toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('welo_dark', document.body.classList.contains('dark'));
  if(typeof weloHaptic === 'function') weloHaptic('light');
  renderHome(); // Refresh to update toggle icon
}
// Load dark mode preference
if(localStorage.getItem('welo_dark')==='true') document.body.classList.add('dark');

// Sound effects (Web Audio API — no files needed)
function playSound(type) {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.1;
    
    if (type === 'xp') {
      osc.frequency.value = 523; // C5
      osc.type = 'sine';
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'complete') {
      osc.frequency.value = 659; // E5
      osc.type = 'sine';
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
      // Second note
      setTimeout(function() {
        var osc2 = ctx.createOscillator();
        var g2 = ctx.createGain();
        osc2.connect(g2); g2.connect(ctx.destination);
        g2.gain.value = 0.1;
        osc2.frequency.value = 784; // G5
        osc2.type = 'sine';
        g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc2.start(); osc2.stop(ctx.currentTime + 0.3);
      }, 150);
    } else if (type === 'levelup') {
      osc.frequency.value = 523;
      osc.type = 'triangle';
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
      setTimeout(function() {
        var o2 = ctx.createOscillator(); var g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination); g2.gain.value = 0.1;
        o2.frequency.value = 659; o2.type = 'triangle';
        g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        o2.start(); o2.stop(ctx.currentTime + 0.3);
      }, 200);
      setTimeout(function() {
        var o3 = ctx.createOscillator(); var g3 = ctx.createGain();
        o3.connect(g3); g3.connect(ctx.destination); g3.gain.value = 0.12;
        o3.frequency.value = 784; o3.type = 'triangle';
        g3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        o3.start(); o3.stop(ctx.currentTime + 0.4);
      }, 400);
    }
  } catch(e) { /* silent — audio not critical */ }
}

// Weekly Summary
function getWeeklySummary() {
  const co = getCouple();
  const done = JSON.parse(localStorage.getItem('welo_plans_done')||'[]');
  const memories = typeof getMemories==='function'?getMemories():[];
  const thisWeek = done.filter(d => {const diff=(new Date()-new Date(d.date))/(86400000);return diff<=7;});
  return {xp:co.xp,streak:co.streak||0,plans:thisWeek.length,memories:memories.length,level:getLevel(co.xp)};
}

// Period start
function startPeriodToday() {
  const p = getProfile();
  p.lastPeriodStart = today();
  setProfile(p);
  showToast('🩸 Periodo registrado. Predicción actualizada.');
  renderCalendar();
}

// Auto-init if profile exists
try {
  if(getProfile()) {
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    initApp();
  }
} catch(e) {
  console.error('Init error:', e);
  // Fallback: if init fails, show onboarding fresh
  try {
    localStorage.removeItem('welo_profile');
    document.getElementById('onboarding').style.display = '';
    document.getElementById('app').style.display = 'none';
  } catch(e2) {}
}
  document.getElementById('onboarding').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}
