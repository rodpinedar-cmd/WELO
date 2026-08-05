// WELO — Extra Games

const completaFrases = [
  "Lo que más me gusta de ti es...",
  "Nuestro lugar favorito juntos es...",
  "Si pudiéramos vivir en cualquier ciudad...",
  "La primera vez que te vi pensé...",
  "En 10 años nos imagino...",
  "Lo más gracioso que hemos vivido fue...",
  "Me enamoré de ti cuando...",
  "Si tuviera que describir nuestra relación en una palabra...",
  "Lo que más admiro de ti es...",
  "Nuestra canción sería...",
  "El mejor regalo que me has dado es...",
  "Si fuéramos un animal juntos seríamos...",
  "Lo que nos hace únicos como pareja es...",
  "Mi momento favorito del día contigo es...",
  "Si pudiéramos repetir un día juntos sería...",
  "Cuando estoy contigo me siento...",
  "Lo que nunca te he dicho es...",
  "Nuestro momento más divertido fue cuando...",
  "Si pudiera darte un superpoder sería...",
  "Lo que más me sorprendió de ti fue...",
  "En nuestra primera cita yo pensé...",
  "Si fuéramos una serie de TV seríamos...",
  "Lo que más me cuesta de la relación es...",
  "Mi lugar seguro contigo es...",
  "Lo próximo que quiero hacer juntos es...",
  "Si nos conocimos de nuevo elegiría...",
  "Contigo aprendí que...",
  "Lo que me enamora cada día más es...",
  "Si tuviera que elegir entre X e Y contigo...",
  "Nuestra relación me enseñó que el amor es..."
];

const quienEsMas = [
  "¿Quién es más probable que llore en una peli?",
  "¿Quién es más probable que se quede dormid@?",
  "¿Quién es más probable que cocine hoy?",
  "¿Quién es más probable que pida perdón primero?",
  "¿Quién es más probable que planee una sorpresa?",
  "¿Quién es más probable que se pierda en una ciudad nueva?",
  "¿Quién es más probable que gaste más en comida?",
  "¿Quién es más probable que mande el primer mensaje del día?",
  "¿Quién es más probable que proponga un viaje espontáneo?",
  "¿Quién es más probable que olvide un aniversario?",
  "¿Quién es más probable que se ponga celoso/a?",
  "¿Quién es más probable que hable dormid@?",
  "¿Quién es más probable que diga 'te amo' primero?",
  "¿Quién es más probable que monopolice la cobija?",
  "¿Quién es más probable que haga reír al otro en un mal día?",
  "¿Quién es más probable que elija la película?",
  "¿Quién es más probable que tenga razón en una discusión?",
  "¿Quién es más probable que sobreviva en una isla desierta?",
  "¿Quién es más probable que se coma el postre del otro?",
  "¿Quién es más probable que llore en la boda?",
  "¿Quién es más probable que ronque sin saberlo?",
  "¿Quién es más probable que escriba una carta de amor?",
  "¿Quién es más probable que aprenda a bailar salsa?",
  "¿Quién es más probable que se quede sin batería del móvil?",
  "¿Quién es más probable que organice una fiesta sorpresa?",
  "¿Quién es más probable que adopte un perro sin avisar?",
  "¿Quién es más probable que se duerma viendo una peli?",
  "¿Quién es más probable que haga un viaje solo/a?",
  "¿Quién es más probable que cocine a las 3am?",
  "¿Quién es más probable que llore con un anuncio?",
  "¿Quién es más probable que se tatúe algo del otro?",
  "¿Quién es más probable que sea famoso/a algún día?",
  "¿Quién es más probable que olvide dónde dejó las llaves?",
  "¿Quién es más probable que se atreva con bungee jumping?",
  "¿Quién es más probable que cante en la ducha?",
  "¿Quién es más probable que se haga viral en TikTok?",
  "¿Quién es más probable que gane un concurso de cocina?",
  "¿Quién es más probable que diga algo vergonzoso en público?",
  "¿Quién es más probable que escriba un libro?",
  "¿Quién es más probable que se quede mirando el móvil del otro?"
];

function gameCompletaFrase() {
  const f = completaFrases[Math.floor(Math.random()*completaFrases.length)];
  document.getElementById('app-content').innerHTML = `
    <div class="card" style="text-align:center;min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <h3>✏️ Completa la frase</h3>
      <p style="font-size:0.8rem;color:var(--text-light);margin:8px 0 20px;">Cada uno completa en voz alta. Comparen respuestas.</p>
      <p style="font-size:1.2rem;font-weight:700;line-height:1.5;margin:16px 0;">"${f}"</p>
      <button class="btn-primary" style="margin-top:20px;" onclick="addXP(5);gameCompletaFrase();">Siguiente →</button>
      <button class="btn-ghost" onclick="completeMission('juego');renderGames();">← Volver</button>
    </div>`;
}

function gameQuienEsMas() {
  const q = quienEsMas[Math.floor(Math.random()*quienEsMas.length)];
  document.getElementById('app-content').innerHTML = `
    <div class="card" style="text-align:center;min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <h3>👆 ¿Quién es más probable?</h3>
      <p style="font-size:0.8rem;color:var(--text-light);margin:8px 0 20px;">Señalen al mismo tiempo. ¿Coinciden?</p>
      <p style="font-size:1.1rem;font-weight:700;line-height:1.5;margin:16px 0;">${q}</p>
      <div style="display:flex;gap:16px;margin:20px 0;">
        <button class="btn-outline" style="padding:16px 24px;font-size:1rem;" onclick="this.style.borderColor='var(--primary)'">👩 Ella</button>
        <button class="btn-outline" style="padding:16px 24px;font-size:1rem;" onclick="this.style.borderColor='var(--primary)'">👨 Él</button>
      </div>
      <button class="btn-primary" onclick="addXP(3);gameQuienEsMas();">Siguiente →</button>
      <button class="btn-ghost" onclick="completeMission('juego');renderGames();">← Volver</button>
    </div>`;
}


// =================== PREDICT YOUR PARTNER ===================
const predictQuestions = [
  {q:"¿Cuál es tu comida favorita?", opts:["Pizza","Sushi","Pasta","Tacos","Otro"]},
  {q:"¿Qué harías con un día libre?", opts:["Dormir","Naturaleza","Netflix","Salir de fiesta","Cocinar"]},
  {q:"¿Cuál es tu mayor miedo?", opts:["Soledad","Fracaso","Insectos","Alturas","Perder a alguien"]},
  {q:"¿Playa o montaña?", opts:["Playa siempre","Montaña siempre","Depende del mood","Las dos","Ninguna"]},
  {q:"¿Qué valoras más en la pareja?", opts:["Humor","Honestidad","Pasión","Paciencia","Aventura"]},
  {q:"¿Tu hora favorita del día?", opts:["Mañana temprano","Media mañana","Mediodía","Tarde","Noche"]},
  {q:"¿Cómo recargas energía?", opts:["Solo/a","Con gente","Naturaleza","Deporte","Durmiendo"]},
  {q:"¿Tu superpoder ideal?", opts:["Volar","Leer mentes","Invisibilidad","Teletransporte","Parar el tiempo"]},
  {q:"¿Qué te pone de buen humor?", opts:["Música","Comida","Ejercicio","Hablar","Naturaleza"]},
  {q:"¿Tu forma de decir 'te quiero'?", opts:["Palabras","Abrazos","Regalos","Tiempo juntos","Favores"]},
  {q:"¿Qué te estresa más?", opts:["Trabajo","Dinero","Salud","Relaciones","Incertidumbre"]},
  {q:"¿Vacaciones ideales?", opts:["Ciudad nueva","Resort relax","Aventura/nature","Road trip","Quedarse en casa"]},
];
let predictIdx = 0, predictScore = 0, predictPhase = 'self'; // 'self' or 'predict'

function gamePredictPartner() {
  predictIdx = 0;
  predictScore = 0;
  predictPhase = 'self';
  localStorage.removeItem('welo_predict_self');
  renderPredictQ();
}

function renderPredictQ() {
  const total = Math.min(5, predictQuestions.length);
  
  if (predictPhase === 'self' && predictIdx >= total) {
    // Phase 1 done — switch to prediction phase
    predictPhase = 'predict';
    predictIdx = 0;
    document.getElementById('app-content').innerHTML = `
      <div class="card" style="text-align:center;padding:32px;">
        <p style="font-size:2rem;margin-bottom:12px;">🔄</p>
        <h3 style="font-size:1.1rem;margin-bottom:8px;">Ahora pasa el móvil a tu pareja</h3>
        <p style="font-size:0.85rem;color:var(--text-light);margin-bottom:20px;">Tu pareja responderá las mismas preguntas. Después veremos quién se conoce mejor.</p>
        <button class="btn-primary" onclick="renderPredictQ()">Mi pareja está lista →</button>
      </div>`;
    return;
  }
  
  if (predictPhase === 'predict' && predictIdx >= total) {
    // Done! Show results
    showPredictResults();
    return;
  }
  
  const q = predictQuestions[predictIdx % predictQuestions.length];
  const phaseLabel = predictPhase === 'self' ? '👤 Responde tú' : '👫 Responde tu pareja';
  const pct = Math.round((predictIdx / total) * 100);
  
  document.getElementById('app-content').innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <span style="font-size:0.75rem;color:var(--text-light);">${predictIdx + 1}/${total}</span>
        <span style="font-size:0.75rem;font-weight:600;color:var(--primary);">${phaseLabel}</span>
      </div>
      <div style="height:4px;background:#eee;border-radius:2px;margin-bottom:20px;"><div style="height:100%;width:${pct}%;background:var(--primary);border-radius:2px;transition:width 0.3s;"></div></div>
      <p style="font-size:1.05rem;font-weight:700;line-height:1.4;margin-bottom:20px;">${q.q}</p>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${q.opts.map(opt => `<button class="btn-outline" style="text-align:left;padding:14px 18px;font-size:0.9rem;" onclick="answerPredict('${opt.replace(/'/g, "\\'")}')">${opt}</button>`).join('')}
      </div>
    </div>
    <button class="btn-ghost" onclick="renderGames()">← Salir del juego</button>`;
}

function answerPredict(answer) {
  const total = Math.min(5, predictQuestions.length);
  
  if (predictPhase === 'self') {
    const selfAnswers = JSON.parse(localStorage.getItem('welo_predict_self') || '[]');
    selfAnswers.push(answer);
    localStorage.setItem('welo_predict_self', JSON.stringify(selfAnswers));
  } else {
    const partnerAnswers = JSON.parse(localStorage.getItem('welo_predict_partner') || '[]');
    partnerAnswers.push(answer);
    localStorage.setItem('welo_predict_partner', JSON.stringify(partnerAnswers));
  }
  
  predictIdx++;
  if (typeof weloHaptic === 'function') weloHaptic('light');
  renderPredictQ();
}

function showPredictResults() {
  const selfAnswers = JSON.parse(localStorage.getItem('welo_predict_self') || '[]');
  const partnerAnswers = JSON.parse(localStorage.getItem('welo_predict_partner') || '[]');
  const total = Math.min(selfAnswers.length, partnerAnswers.length);
  
  let matches = 0;
  let html = `<div class="gradient-header"><h2>🎯 Resultados</h2><p>¿Cuánto os conocéis?</p></div>`;
  html += `<div class="card">`;
  
  for (var i = 0; i < total; i++) {
    const q = predictQuestions[i];
    const isMatch = selfAnswers[i] === partnerAnswers[i];
    if (isMatch) matches++;
    html += `<div style="padding:10px 0;border-bottom:1px solid #f5f5f5;${isMatch ? 'background:rgba(76,175,80,0.05);margin:0 -20px;padding-left:20px;padding-right:20px;' : ''}">
      <p style="font-size:0.75rem;color:var(--text-light);">${q.q}</p>
      <div style="display:flex;justify-content:space-between;margin-top:4px;">
        <span style="font-size:0.82rem;">👤 ${selfAnswers[i]}</span>
        <span>${isMatch ? '✅' : '❌'}</span>
        <span style="font-size:0.82rem;">👫 ${partnerAnswers[i]}</span>
      </div>
    </div>`;
  }
  html += `</div>`;
  
  const pct = total > 0 ? Math.round((matches / total) * 100) : 0;
  const xpEarned = matches * 5 + 10;
  
  html += `<div class="card" style="text-align:center;">
    <p style="font-size:2.5rem;font-weight:900;color:${pct >= 60 ? '#4caf50' : 'var(--primary)'};">${pct}%</p>
    <p style="font-size:1rem;font-weight:600;">${matches}/${total} coincidencias</p>
    <p style="font-size:0.85rem;color:var(--text-light);margin-top:8px;">${pct >= 80 ? '¡Os conocéis increíblemente bien! 🔥' : pct >= 60 ? '¡Buena conexión! Seguís descubriéndoos 💕' : pct >= 40 ? '¡Hay cosas nuevas por descubrir! 🌱' : '¡Sorpresas! Hay mucho por explorar juntos ✨'}</p>
    <p style="font-size:0.9rem;font-weight:700;color:var(--primary);margin-top:12px;">+${xpEarned} XP ganados</p>
    <button class="btn-outline" style="margin-top:12px;font-size:0.8rem;" onclick="shareMatchResult(${pct},${total})">📲 Compartir</button>
  </div>`;
  
  html += `<button class="btn-primary" onclick="addXP(${xpEarned});completeMission('juego');renderGames();">Volver a juegos</button>`;
  
  document.getElementById('app-content').innerHTML = html;
  
  // Cleanup
  localStorage.removeItem('welo_predict_self');
  localStorage.removeItem('welo_predict_partner');
  
  // Celebration if good score
  if (pct >= 80 && typeof showConfetti === 'function') showConfetti();
  if (typeof playSound === 'function') playSound('complete');
}
