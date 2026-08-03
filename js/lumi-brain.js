// WELO — Lumi Smart Brain (Rule-based AI, 100% free)
// Lumi responds contextually based on: cycle phase, time, preferences, history, streak, mood

function getLumiResponse(question) {
  const profile = getProfile();
  const couple = getCouple();
  const info = profile ? getCycleInfo(today()) : null;
  const prefs = typeof getPrefs === 'function' ? getPrefs() : {};
  const role = profile ? profile.role : 'ella';
  const hour = new Date().getHours();
  const dayName = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][new Date().getDay()];
  const streak = couple.streak || 0;
  const done = JSON.parse(localStorage.getItem('welo_plans_done')||'[]');
  const memories = typeof getMemories === 'function' ? getMemories() : [];
  const myPrefs = prefs[role] || {};
  const sharedPrefs = typeof findMatches === 'function' ? findMatches(prefs.ella||{}, prefs.el||{}) : [];

  const q = question.toLowerCase();

  // PLAN RECOMMENDATIONS
  if(q.includes('plan') || q.includes('hacer') || q.includes('hoy') || q.includes('recomienda') || q.includes('cita')) {
    if(info && info.phase === 'Menstrual') return "Ella está en fase menstrual. Algo tranquilo: peli + manta, spa casero, o un paseo corto sin prisa. Nada que requiera mucha energía. 🌙";
    if(info && info.phase === 'Folicular') return "¡Fase folicular! Energía alta. Es perfecto para: escalada, ruta de cafés, clase de baile, o algo activo que nunca hayan hecho. 🌱⚡";
    if(info && info.phase === 'Ovulación') return "Ovulación = su mejor momento. Cita romántica, cena con vistas, velero al atardecer, o algo social. Está radiante. ☀️";
    if(info && info.phase === 'Lútea') return "Fase lútea. Algo relajado: cocinar juntos, noche de pelis, journaling de pareja, o baños árabes. Sin presión. 🌙";
    if(sharedPrefs.includes('Sushi')) return "Los dos aman el sushi. ¿Japonés nuevo? Hay uno bueno en el Born que no han probado. 🍣";
    if(sharedPrefs.includes('Naturaleza')) return "Coinciden en naturaleza. ¿Collserola al amanecer? O un picnic en Ciutadella si prefieren algo fácil. 🌿";
    if(hour < 12) return "Es mañana. Ideas: brunch juntos, yoga en el parque, o ruta de cafeterías nuevas. ☀️☕";
    if(hour < 18) return "Tarde perfecta para: paseo sin celular, tienda de vinilos, o un helado en la Barceloneta. 🌅";
    return "Noche. Opciones: cena tranquila, cócteles en rooftop, o fort de cobijas + peli. ¿Qué mood tienen? 🌙";
  }

  // RELATIONSHIP ADVICE
  if(q.includes('pelea') || q.includes('conflicto') || q.includes('discut') || q.includes('enfad')) {
    return "Respira. Regla de oro: pausa de 20 min si la conversación se calienta. Después vuelvan con: 'Lo siento, empecé mal. ¿Podemos hablar tranquilos?' — Gottman dice que los primeros 3 min predicen todo. 💬";
  }
  if(q.includes('comunicación') || q.includes('hablar') || q.includes('escuchar')) {
    return "Tip: pregunta '¿cómo fue tu día DE VERDAD?' y escucha 5 min sin celular, sin dar soluciones, sin interrumpir. Solo presencia. Hazlo 7 días y nota la diferencia. 👂💕";
  }
  if(q.includes('aburrido') || q.includes('rutina') || q.includes('chispa')) {
    return "La rutina no es enemiga — pero necesita novedad. Regla: 1 cosa nueva por semana. No tiene que ser grande. Un restaurante nuevo, un juego, una pregunta profunda. Eso reactiva la dopamina conjunta. 🧪✨";
  }

  // CYCLE QUESTIONS
  if(q.includes('ciclo') || q.includes('periodo') || q.includes('fase') || q.includes('menstr')) {
    if(info) return `Estás en día ${info.cycleDay} — Fase ${info.phase}. ${info.phase==='Menstrual'?'Descanso, calor, magnesio.':info.phase==='Folicular'?'Energía sube. Momento de acción.':info.phase==='Ovulación'?'Pico. Confianza y sociabilidad.':'Autocuidado. Paciencia contigo.'} ~${info.daysToNext} días para próximo periodo.`;
    return "No tengo datos de ciclo. ¿Quieres configurarlo en Ciclo (nav)? Te ayudo a trackear y predecir. 📅";
  }

  // LUMI / APP QUESTIONS
  if(q.includes('lumi') || q.includes('mascota') || q.includes('tú')) {
    return `¡Soy Lumi! Tu luciérnaga de pareja. 🪲✨ Nací cuando se registraron y crezco con ustedes. Llevo ${memories.length} recuerdos guardados y su racha es de ${streak} días. ¡Aliméntenme diario para que no me ponga triste!`;
  }
  if(q.includes('xp') || q.includes('nivel') || q.includes('glow') || q.includes('puntos')) {
    return `Tienen ${couple.xp} XP (${getLevel(couple.xp)}) y ${couple.glow||0} GLOW. Racha: ${streak} días. Completen misiones diarias, retos y juegos para ganar más. El multiplicador sube con la racha. 🔥`;
  }

  // MOOD / EMOTIONS
  if(q.includes('triste') || q.includes('mal') || q.includes('ansiedad') || q.includes('estres')) {
    return "Lo siento que te sientas así. 💕 Tips rápidos: respiración 4-7-8 (inhala 4, retén 7, exhala 8), pedir un abrazo de 20 seg, o caminar 15 min. Si es recurrente en fase lútea, el magnesio (300mg) ayuda mucho.";
  }
  if(q.includes('feliz') || q.includes('bien') || q.includes('genial')) {
    return "¡Me encanta! 🥰 Aprovecha esa energía. ¿Qué tal guardar este momento como recuerdo? O proponer un plan espontáneo. Los mejores recuerdos salen de momentos así. ✨";
  }

  // FOOD / RESTAURANT
  if(q.includes('comer') || q.includes('cena') || q.includes('restaurante') || q.includes('comida')) {
    if(sharedPrefs.includes('Sushi')) return "¿Sushi? Ambos lo aman. Hay opciones buenas en el Born y Eixample. O podrían hacer sushi en casa (es más divertido y más barato). 🍣";
    if(sharedPrefs.includes('Italiana')) return "Pasta siempre es buena idea. ¿Cocinar carbonara juntos o salir a un italiano? El Born tiene opciones increíbles. 🍝";
    if(dayName === 'viernes' || dayName === 'sábado') return "¡Es finde! Momento de salir. Ideas: ruta de tapas por Gràcia, restaurante nuevo, o terraza con vistas. ¿Qué presupuesto tienen? 🍽️";
    return "Para comer: ¿quieren cocinar juntos (más íntimo) o salir (más aventura)? Si cocinan, prueben una receta nueva — el desastre es parte de la diversión. 👨‍🍳";
  }

  // GAMES
  if(q.includes('juego') || q.includes('jugar') || q.includes('divertido')) {
    if(streak > 7) return "¡Van bien! Para hoy: Verdad o Reto modo Spicy es intenso, o 36 Preguntas si quieren algo profundo. ¿Mood divertido o íntimo? 🎮";
    return "¿Ganas de jugar? Opciones rápidas: Esto o Aquello (3 min), ¿Qué Preferirías? (5 min), o Swipe de Pelis para elegir peli de esta noche. 🎬";
  }

  // TIME-BASED RESPONSES
  if(q.includes('buenos días') || q.includes('mañana')) {
    return `¡Buenos días! ☀️ Hoy es ${dayName}. Tu reto del día te espera. Racha: ${streak} días — no la pierdas. ¿Qué tal un café juntos antes de empezar? ☕`;
  }
  if(q.includes('buenas noches') || q.includes('dormir')) {
    return "Buenas noches 🌙 Antes de dormir: ¿se dieron reconocimiento hoy? Un 'gracias por...' antes de apagar la luz fortalece más de lo que creen. Dulces sueños. 💕";
  }

  // WEEKEND
  if((dayName === 'viernes' || dayName === 'sábado' || dayName === 'domingo') && (q.includes('finde') || q.includes('semana'))) {
    return "¡Es finde! 🎉 Ideas: escapada a Costa Brava (1h), atardecer en Bunkers, brunch largo, o maratón de pelis con fort de cobijas. ¿Activos o relax?";
  }

  // DEFAULT (catch-all based on context)
  if(streak >= 14) return `¡${streak} días de racha! Están increíbles. 🔥 ¿En qué puedo ayudarles hoy? Puedo recomendar planes, juegos, o tips de relación.`;
  if(done.length >= 5) return `¡Ya completaron ${done.length} planes juntos! Eso es genial. ¿Quieren uno nuevo para esta semana? Díganme qué mood tienen. ✨`;
  return "¡Hola! Soy Lumi 🪲✨ Puedo ayudarles con: planes, juegos, tips de comunicación, info del ciclo, o simplemente charlar. ¿Qué necesitan hoy?";
}

// Render Lumi Chat interface
function renderLumiChat() {
  const chatHistory = JSON.parse(localStorage.getItem('welo_lumi_chat')||'[]');
  
  let html = `<div class="gradient-header"><h2>🪲 Habla con Lumi</h2><p>Tu asistente de pareja</p></div>`;
  
  // Chat messages
  html += `<div id="chat-messages" style="max-height:400px;overflow-y:auto;margin-bottom:16px;">`;
  if(chatHistory.length === 0) {
    html += `<div class="card" style="text-align:center;padding:24px;"><p style="font-size:0.9rem;color:var(--text-light);">¡Hola! Soy Lumi 🪲✨</p><p style="font-size:0.8rem;color:var(--text-light);margin-top:8px;">Pregúntame sobre: planes, ciclo, juegos, tips de relación, o lo que necesites.</p></div>`;
  }
  chatHistory.slice(-10).forEach(msg => {
    if(msg.role === 'user') {
      html += `<div style="display:flex;justify-content:flex-end;margin-bottom:8px;"><div style="max-width:75%;padding:10px 14px;background:var(--primary);color:white;border-radius:14px 14px 4px 14px;font-size:0.85rem;">${msg.text}</div></div>`;
    } else {
      html += `<div style="display:flex;justify-content:flex-start;margin-bottom:8px;gap:8px;"><span style="font-size:1.2rem;">🪲</span><div style="max-width:75%;padding:10px 14px;background:white;border-radius:14px 14px 14px 4px;font-size:0.85rem;box-shadow:0 1px 4px rgba(0,0,0,0.06);">${msg.text}</div></div>`;
    }
  });
  html += `</div>`;

  // Quick suggestions
  html += `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
    <button class="btn-outline" style="font-size:0.7rem;padding:6px 12px;" onclick="askLumi('¿Qué plan hacemos hoy?')">¿Plan de hoy?</button>
    <button class="btn-outline" style="font-size:0.7rem;padding:6px 12px;" onclick="askLumi('¿Qué fase del ciclo?')">Mi ciclo</button>
    <button class="btn-outline" style="font-size:0.7rem;padding:6px 12px;" onclick="askLumi('¿Qué juego jugamos?')">Juegos</button>
    <button class="btn-outline" style="font-size:0.7rem;padding:6px 12px;" onclick="askLumi('Tips de comunicación')">Comunicación</button>
    <button class="btn-outline" style="font-size:0.7rem;padding:6px 12px;" onclick="askLumi('¿Dónde cenamos?')">Cena</button>
  </div>`;

  // Input
  html += `<div style="display:flex;gap:8px;">
    <input type="text" id="lumi-input" class="input" placeholder="Pregúntale a Lumi..." style="margin:0;" onkeypress="if(event.key==='Enter')sendLumiMsg()">
    <button class="btn-primary" style="width:auto;padding:12px 20px;margin:0;" onclick="sendLumiMsg()">→</button>
  </div>`;
  html += `<button class="btn-ghost" onclick="renderHome();renderLumiCorner('home');">← Volver</button>`;
  
  document.getElementById('app-content').innerHTML = html;
}

function askLumi(question) {
  document.getElementById('lumi-input').value = question;
  sendLumiMsg();
}

function sendLumiMsg() {
  const input = document.getElementById('lumi-input');
  const text = input.value.trim();
  if(!text) return;
  
  // Save user message
  const chat = JSON.parse(localStorage.getItem('welo_lumi_chat')||'[]');
  chat.push({role:'user', text:text});
  
  // Get Lumi response
  const response = getLumiResponse(text);
  chat.push({role:'lumi', text:response});
  
  // Keep last 20 messages
  if(chat.length > 20) chat.splice(0, chat.length - 20);
  localStorage.setItem('welo_lumi_chat', JSON.stringify(chat));
  
  input.value = '';
  renderLumiChat();
  
  // Scroll to bottom
  setTimeout(() => {
    const msgs = document.getElementById('chat-messages');
    if(msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 100);
}
