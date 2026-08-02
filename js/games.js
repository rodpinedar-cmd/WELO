// WELO — Games Module

function renderGames() {
  const game = getGame();
  const couple = getCouple();
  document.getElementById('app-content').innerHTML = `
    <div class="gradient-header"><h2>🎮 Juegos</h2><p>Sin competencia. Solo conexión.</p></div>
    
    <p style="font-size:0.7rem;color:var(--text-light);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;padding:0 4px;">⚡ Rápidos</p>
    <div class="card" onclick="gameThisOrThat()"><b>⚡ Esto o Aquello</b><br><span style="font-size:0.8rem;color:var(--text-light);">25 rondas — descubran coincidencias</span></div>
    <div class="card" onclick="gameWouldYouRather()"><b>🤔 ¿Qué Preferirías?</b><br><span style="font-size:0.8rem;color:var(--text-light);">Dilemas divertidos</span></div>
    <div class="card" onclick="gameTruthDare()"><b>🎲 Verdad o Reto</b><br><span style="font-size:0.8rem;color:var(--text-light);">30 verdades + 28 retos</span></div>
    
    <p style="font-size:0.7rem;color:var(--text-light);text-transform:uppercase;letter-spacing:1px;margin:16px 0 8px;padding:0 4px;">🧠 Conócete</p>
    <div class="card" onclick="gameMovieNight()"><b>🎬 Noche de Pelis</b><br><span style="font-size:0.8rem;color:var(--text-light);">Elige pelis + watchlist</span></div>
    <div class="card" onclick="game36Questions()"><b>💭 36 Preguntas</b><br><span style="font-size:0.8rem;color:var(--text-light);">Para enamorarse (de nuevo)</span></div>
    <div class="card" onclick="gameBucketList()"><b>✨ Bucket List</b><br><span style="font-size:0.8rem;color:var(--text-light);">Sueños y metas juntos</span></div>
  `;
}

// =================== THIS OR THAT ===================
const thisOrThat = [
  ['☀️ Mañana','🌙 Noche'],['🏖️ Playa','🏔️ Montaña'],['🍕 Pizza','🍣 Sushi'],
  ['📖 Libro','🎬 Película'],['🎤 Cantar','💃 Bailar'],['☕ Café','🍵 Té'],
  ['🐶 Perro','🐱 Gato'],['🏠 Quedarse','✈️ Viajar'],['🍫 Dulce','🧀 Salado'],
  ['❄️ Frío','🔥 Calor'],['📱 Llamada','💬 Mensaje'],['🎭 Comedia','😢 Drama'],
  ['🍳 Cocinar','🍽️ Restaurante'],['🏃 Cardio','🏋️ Pesas'],['🌅 Amanecer','🌇 Atardecer'],
  ['🚗 Road trip','✈️ Volar'],['🎮 Videojuegos','🎲 Board games'],['💐 Flores','🍫 Chocolate'],
  ['👫 Doble cita','👩‍❤️‍👨 Solo nosotros'],['🎪 Feria','🎨 Museo'],
  ['🍷 Vino','🍺 Cerveza'],['📸 Fotos','🎥 Videos'],['🌊 Piscina','🏊 Mar'],
  ['🎄 Navidad','🎆 Año nuevo'],['🛋️ Netflix','🎬 Cine']
];
let totIdx=0, totMatches=0;

function gameThisOrThat() {
  // Restore progress if they left mid-game
  const saved = JSON.parse(localStorage.getItem('welo_tot')||'null');
  if(saved) { totIdx=saved.idx; totMatches=saved.matches; }
  else { totIdx=0; totMatches=0; }
  renderTOT();
}

function renderTOT() {
  // Save progress
  localStorage.setItem('welo_tot', JSON.stringify({idx:totIdx,matches:totMatches}));
  
  if(totIdx >= thisOrThat.length) {
    localStorage.removeItem('welo_tot');
    addXP(15);
    document.getElementById('app-content').innerHTML = `
      <div class="card" style="text-align:center;">
        <h2>⚡ ¡Completado!</h2>
        <p style="font-size:2rem;font-weight:800;color:var(--primary);margin:16px 0;">${totMatches}/${thisOrThat.length}</p>
        <p>coincidencias</p>
        <p style="margin-top:12px;color:var(--text-light);">${totMatches>=20?'¡Prácticamente la misma persona! 😂':totMatches>=15?'Se conocen MUY bien 💕':totMatches>=10?'Buena conexión 🌱':'¡Opuestos se atraen! 🔥'}</p>
        <button class="btn-primary" style="margin-top:20px;" onclick="localStorage.removeItem('welo_tot');gameThisOrThat();">🔄 Jugar de nuevo</button>
        <button class="btn-ghost" onclick="renderGames()">← Volver</button>
      </div>`;
    return;
  }
  const q = thisOrThat[totIdx];
  document.getElementById('app-content').innerHTML = `
    <div class="card" style="text-align:center;">
      <h3>⚡ Ronda ${totIdx+1}/${thisOrThat.length}</h3>
      <p style="margin:8px 0;font-size:0.8rem;color:var(--text-light);">Cada uno elige en su mente. Luego digan en voz alta. ¿Coinciden?</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0;">
        <button class="btn-outline" style="padding:20px;font-size:1.1rem;" onclick="this.style.borderColor='var(--primary)'">${q[0]}</button>
        <button class="btn-outline" style="padding:20px;font-size:1.1rem;" onclick="this.style.borderColor='var(--primary)'">${q[1]}</button>
      </div>
      <div style="display:flex;gap:12px;margin-top:12px;">
        <button class="btn-primary" style="flex:1;" onclick="totMatches++;totIdx++;renderTOT();">✅ Coincidimos</button>
        <button class="btn-outline" style="flex:1;" onclick="totIdx++;renderTOT();">❌ Diferente</button>
      </div>
      <p style="font-size:0.75rem;color:var(--text-light);margin-top:12px;">Coincidencias: ${totMatches}/${totIdx} • Pueden pausar y volver después</p>
      <button class="btn-ghost" onclick="renderGames()">⏸️ Pausar y volver</button>
    </div>`;
}

// =================== WOULD YOU RATHER ===================
const wouldYouRather = [
  ['Vivir en la playa para siempre','Vivir en la montaña para siempre'],
  ['Poder leer mentes','Poder volar'],
  ['Revivir un recuerdo feliz juntos','Borrar un recuerdo doloroso'],
  ['Tener una cita perfecta cada semana','Una aventura épica una vez al año'],
  ['Saber qué piensa tu pareja siempre','Que tu pareja siempre sepa qué piensas'],
  ['Nunca más discutir pero sin pasión','Discutir a veces pero con mucha pasión'],
  ['Cocine increíble pero nunca limpie','Limpie todo pero queme el agua'],
  ['Vivir en casa gigante lejos de todo','Apartamento pequeño en el centro'],
  ['3 meses de vacaciones sin dinero','1 semana de lujo total'],
  ['Que tu pareja sepa TODAS tus contraseñas','Que tú sepas todas las suyas'],
  ['Relación pública (todo en redes)','Relación 100% privada'],
  ['Revivir su primer beso cada día','Revivir su mejor cita cada año'],
  ['Conocer el futuro de su relación','No saber nada pero elegir libremente'],
  ['Siempre tener la última palabra','Que siempre te dé la razón']
];

function gameWouldYouRather() {
  const q = wouldYouRather[Math.floor(Math.random()*wouldYouRather.length)];
  document.getElementById('app-content').innerHTML = `
    <div class="card" style="text-align:center;">
      <h3>🤔 ¿Qué preferirías?</h3>
      <p style="margin:8px 0;font-size:0.8rem;color:var(--text-light);">Cada uno piensa su respuesta. Digan "1, 2, 3" y respondan juntos.</p>
      <button class="btn-outline" style="width:100%;padding:18px;margin:8px 0;text-align:left;" onclick="this.style.borderColor='var(--primary)';this.style.background='rgba(255,107,157,0.05)'">${q[0]}</button>
      <p style="font-weight:700;color:var(--text-light);">— o —</p>
      <button class="btn-outline" style="width:100%;padding:18px;margin:8px 0;text-align:left;" onclick="this.style.borderColor='var(--primary)';this.style.background='rgba(255,107,157,0.05)'">${q[1]}</button>
      <button class="btn-primary" style="margin-top:16px;" onclick="addXP(3);gameWouldYouRather();">Siguiente →</button>
      <button class="btn-ghost" onclick="renderGames();">← Volver a juegos</button>
    </div>`;
}

// =================== TRUTH OR DARE ===================
const truths = ['¿Tu crush más vergonzoso?','¿Qué pensaste al verme la primera vez?','¿Algo que nunca dijiste por pena?','¿Qué mejorarías de mí?','¿Cuándo supiste que me amabas?','¿Mayor inseguridad en la relación?','¿Algo que extrañes del principio?','¿Qué harías si nos separáramos?','¿Qué es lo más bonito que sentiste por mí?','¿Tu sueño más grande para nosotros?','¿Algo que no me hayas perdonado del todo?','¿Cuándo te sentiste más orgullos@ de mí?','¿Tu peor miedo sobre nosotros?','¿Qué nota le pondrías a la relación?','¿Si pudieras cambiar UNA decisión?','¿Qué es lo que más te atrae de mí físicamente?','¿Alguna vez pensaste en dejarme?','¿Qué es lo más difícil de estar conmigo?','¿Cuál es tu recuerdo favorito juntos?','¿Hay algo que te gustaría que hiciera más?','¿Qué pensaban tus amigos de mí al principio?','¿Cuál fue tu primer pensamiento esta mañana?','¿Hay algo de ti que crees que no conozco?','¿Qué parte de nuestra rutina te aburre?','¿Cuándo fue la última vez que te hice llorar (de cualquier forma)?','¿Qué me dirías si no hubiera consecuencias?','¿Qué es lo que más te cuesta comunicarme?','¿Te arrepientes de algo que me dijiste?','¿Cuál es tu love language y sientes que te lo doy?','¿Qué admiras de mis padres/familia?'];
const dares = ['Beso de 10 segundos AHORA','5 cosas que amas de su cuerpo','Masaje de 2 min','Cántale una canción','Baila sexy 30seg','Mírense 2 min sin hablar','Abrazo de oso 30seg','Piropo MUY exagerado','3 cosas que nunca dijiste','Dale un beso en la frente muy lento','Hazle un dibujo de los dos juntos','Ponle una canción que te recuerde a ella/él','Dile su cualidad favorita mirándole a los ojos','Intenta hacerle reír en 30 seg','Imita cómo te pidió ser novios','Mándale un audio diciéndole por qué le amas','Hazle un masaje en las manos por 1 min','Escríbele algo bonito en la mano con el dedo','Dile 5 razones por las que te quedas','Ponle apodo cariñoso nuevo ahora mismo','Baila con ella/él la próxima canción que suene','Dale un beso en cada dedo de la mano','Dile qué pensaste la primera vez que te atrajo','Míralo/a a los ojos y dile "te amo" sin reírte','Cuéntale un sueño que tuviste con ella/él','Háblale al oído por 20 segundos','Dedícale un verso inventado','Dile algo que nunca le hayas dicho en voz alta','Propón un plan sorpresa para este fin de semana','Describe tu momento favorito del día de hoy con ella/él'];

function gameTruthDare() {
  document.getElementById('app-content').innerHTML = `
    <div class="card" style="text-align:center;">
      <h3>🎲 Verdad o Reto</h3>
      <p style="margin:12px 0;font-size:0.85rem;color:var(--text-light);">Elige intensidad:</p>
      <div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px;">
        <button class="btn-outline" style="font-size:0.8rem;" onclick="setTDLevel('suave')">😊 Suave</button>
        <button class="btn-outline" style="font-size:0.8rem;" onclick="setTDLevel('medio')">😏 Medio</button>
        <button class="btn-outline" style="font-size:0.8rem;" onclick="setTDLevel('spicy')">🔥 Spicy</button>
      </div>
      <p style="margin:16px 0;">Elige tu destino 😏</p>
      <button class="btn-primary" style="margin-bottom:8px;" onclick="showTruth()">😳 Verdad</button>
      <button class="btn-outline" style="width:100%;" onclick="showDare()">🔥 Reto</button>
      <button class="btn-ghost" onclick="completeMission('juego');renderGames()">← Volver</button>
    </div>`;
}
let tdLevel='medio';
function setTDLevel(l){tdLevel=l;document.querySelectorAll('.card .btn-outline').forEach(b=>{b.style.borderColor='#eee';});event.target.style.borderColor='var(--primary)';}

function showTruth() {
  // Filter by level
  const suave = truths.slice(0,10);
  const medio = truths.slice(10,20);
  const spicy = truths.slice(20,30);
  const pool = tdLevel==='suave'?suave:tdLevel==='spicy'?spicy:medio;
  const t = pool[Math.floor(Math.random()*pool.length)];
  document.getElementById('app-content').innerHTML = `
    <div class="card" style="text-align:center;">
      <h3>😳 Verdad <span style="font-size:0.7rem;color:var(--text-light);">(${tdLevel})</span></h3>
      <p style="font-size:1.1rem;font-style:italic;margin:20px 0;line-height:1.5;">${t}</p>
      <button class="btn-primary" onclick="addXP(5);gameTruthDare()">✅ Respondida</button>
      <button class="btn-ghost" onclick="gameTruthDare()">⏭️ Otra</button>
    </div>`;
}
function showDare() {
  const suave = dares.slice(0,10);
  const medio = dares.slice(10,20);
  const spicy = dares.slice(20,30);
  const pool = tdLevel==='suave'?suave:tdLevel==='spicy'?spicy:medio;
  const d = pool[Math.floor(Math.random()*pool.length)];
  document.getElementById('app-content').innerHTML = `
    <div class="card" style="text-align:center;">
      <h3>🔥 Reto <span style="font-size:0.7rem;color:var(--text-light);">(${tdLevel})</span></h3>
      <p style="font-size:1.1rem;font-weight:600;margin:20px 0;line-height:1.5;">${d}</p>
      <button class="btn-primary" onclick="addXP(5);gameTruthDare()">✅ ¡Hecho!</button>
      <button class="btn-ghost" onclick="gameTruthDare()">😅 Paso</button>
    </div>`;
}

// =================== MOVIE NIGHT (Swipe Style) ===================
const movies = [
  {title:'The Notebook',genre:'romance',year:2004,why:'Llorarán juntos.',mood:'llorar'},
  {title:'La La Land',genre:'romance',year:2016,why:'Musical y agridulce.',mood:'pensar'},
  {title:'Parasite',genre:'thriller',year:2019,why:'Les volará la cabeza.',mood:'pensar'},
  {title:'Everything Everywhere',genre:'scifi',year:2022,why:'Locura + amor.',mood:'reír'},
  {title:'Coco',genre:'animacion',year:2017,why:'Llorarán los dos.',mood:'llorar'},
  {title:'Game Night',genre:'comedia',year:2018,why:'Acción + humor.',mood:'reír'},
  {title:'Palm Springs',genre:'comedia',year:2020,why:'Time loop + amor.',mood:'reír'},
  {title:'Gone Girl',genre:'thriller',year:2014,why:'Discutirán quién tenía razón.',mood:'pensar'},
  {title:'About Time',genre:'romance',year:2013,why:'Final BRUTAL.',mood:'llorar'},
  {title:'Interstellar',genre:'scifi',year:2014,why:'Épica y emocional.',mood:'pensar'},
  {title:'Up',genre:'animacion',year:2009,why:'Primeros 10 min = llorar.',mood:'llorar'},
  {title:'Knives Out',genre:'thriller',year:2019,why:'Adivinen juntos.',mood:'pensar'},
  {title:'Your Name',genre:'animacion',year:2016,why:'Anime devastador.',mood:'llorar'},
  {title:'Barbie',genre:'comedia',year:2023,why:'Divertida y feminista.',mood:'reír'},
  {title:'Past Lives',genre:'drama',year:2023,why:'Amor entre culturas.',mood:'pensar'},
  {title:'10 Things I Hate About You',genre:'comedia',year:1999,why:'Clásico teens romántico.',mood:'reír'},
  {title:'Eternal Sunshine',genre:'drama',year:2004,why:'¿Borrarías tus recuerdos juntos?',mood:'pensar'},
  {title:'The Grand Budapest Hotel',genre:'comedia',year:2014,why:'Visual y excéntrica.',mood:'reír'},
  {title:'Pride & Prejudice',genre:'romance',year:2005,why:'La declaración bajo la lluvia.',mood:'llorar'},
  {title:'Amélie',genre:'romance',year:2001,why:'Creatividad y amor silencioso.',mood:'reír'}
];

let movieSwipeIdx = 0;
let movieSwipePool = [];
let movieSwipeLikes = {p1:[], p2:[]};
let movieSwipeTurn = 1; // 1 or 2

function gameMovieNight() {
  const wl = getWatchlist();
  document.getElementById('app-content').innerHTML = `
    <div class="gradient-header"><h2>🎬 Noche de Pelis</h2><p>Swipe, match, y véanla juntos</p></div>
    <div class="card" style="text-align:center;">
      <h4 style="margin-bottom:12px;">¿Qué mood tienen?</h4>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">
        <button class="btn-outline" onclick="startMovieSwipe('reír')">😂 Reír</button>
        <button class="btn-outline" onclick="startMovieSwipe('llorar')">😢 Llorar</button>
        <button class="btn-outline" onclick="startMovieSwipe('pensar')">🧠 Pensar</button>
        <button class="btn-outline" onclick="startMovieSwipe('all')">🎲 Todo</button>
      </div>
    </div>
    <div class="card" style="text-align:center;">
      <button class="btn-outline" style="width:100%;margin-bottom:8px;" onclick="showWatchlist()">📋 Watchlist (${wl.length})</button>
      <button class="btn-outline" style="width:100%;" onclick="showAddMovie()">➕ Agregar peli/serie</button>
    </div>
    <button class="btn-ghost" onclick="renderGames()">← Volver</button>`;
}

function startMovieSwipe(mood) {
  const custom = JSON.parse(localStorage.getItem('welo_custom_movies')||'[]');
  const allMovies = [...movies, ...custom];
  movieSwipePool = mood === 'all' ? [...allMovies].sort(()=>Math.random()-0.5) : allMovies.filter(m=>m.mood===mood).sort(()=>Math.random()-0.5);
  movieSwipeIdx = 0;
  movieSwipeLikes = {p1:[], p2:[]};
  movieSwipeTurn = 1;
  renderMovieSwipe();
}

function renderMovieSwipe() {
  if(movieSwipeIdx >= movieSwipePool.length) {
    showMovieMatches();
    return;
  }
  const m = movieSwipePool[movieSwipeIdx];
  const moodEmoji = m.mood==='reír'?'😂':m.mood==='llorar'?'😢':'🧠';
  document.getElementById('app-content').innerHTML = `
    <div class="card" style="text-align:center;min-height:320px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <p style="font-size:0.75rem;color:var(--text-light);margin-bottom:8px;">Turno: ${movieSwipeTurn===1?'Jugador 1':'Jugador 2'} • ${movieSwipeIdx+1}/${movieSwipePool.length}</p>
      <div style="font-size:3rem;margin-bottom:12px;">🎬</div>
      <h2 style="font-size:1.4rem;margin-bottom:4px;">${m.title}</h2>
      <p style="font-size:0.85rem;color:var(--text-light);margin-bottom:8px;">${m.year} • ${moodEmoji} ${m.mood}</p>
      <p style="font-size:0.9rem;font-style:italic;color:var(--secondary);margin-bottom:20px;">"${m.why}"</p>
      <div style="display:flex;gap:16px;">
        <button class="btn-outline" style="width:70px;height:70px;border-radius:50%;font-size:1.5rem;border-color:#ff6b6b;" onclick="movieSwipeAction('pass')">👎</button>
        <button class="btn-outline" style="width:70px;height:70px;border-radius:50%;font-size:1.5rem;border-color:#51cf66;" onclick="movieSwipeAction('like')">👍</button>
      </div>
    </div>
    <button class="btn-ghost" onclick="gameMovieNight()">⏸️ Pausar</button>`;
}

function movieSwipeAction(action) {
  const m = movieSwipePool[movieSwipeIdx];
  if(action === 'like') {
    if(movieSwipeTurn === 1) movieSwipeLikes.p1.push(m.title);
    else movieSwipeLikes.p2.push(m.title);
  }
  
  // If both players swipe same movie pool
  if(movieSwipeTurn === 1) {
    movieSwipeTurn = 2;
    renderMovieSwipe(); // Same movie, player 2's turn
  } else {
    movieSwipeTurn = 1;
    movieSwipeIdx++;
    renderMovieSwipe(); // Next movie
  }
}

function showMovieMatches() {
  const matches = movieSwipeLikes.p1.filter(t => movieSwipeLikes.p2.includes(t));
  let html = `<div class="card" style="text-align:center;">
    <h2 style="margin-bottom:12px;">${matches.length ? '🎬 ¡Match!' : '😅 Sin matches'}</h2>`;
  if(matches.length) {
    html += `<p style="color:var(--text-light);margin-bottom:16px;">Ambos quieren ver:</p>`;
    matches.forEach(t => {
      const m = [...movies, ...JSON.parse(localStorage.getItem('welo_custom_movies')||'[]')].find(x=>x.title===t);
      html += `<div style="padding:12px;background:rgba(255,107,157,0.05);border-radius:12px;margin:8px 0;display:flex;justify-content:space-between;align-items:center;">
        <span><b>${t}</b>${m?' ('+m.year+')':''}</span>
        <button class="btn-outline" style="padding:6px 12px;font-size:0.7rem;" onclick="addToWL('${t.replace(/'/g,"\\'")}',${m?m.year:2024})">+ Watchlist</button>
      </div>`;
    });
  } else {
    html += `<p style="color:var(--text-light);">No coincidieron esta vez. ¡Intenten con otro mood!</p>`;
  }
  html += `<button class="btn-primary" style="margin-top:16px;" onclick="gameMovieNight()">🔄 Jugar de nuevo</button>`;
  html += `</div>`;
  addXP(10);
  document.getElementById('app-content').innerHTML = html;
}

function showWatchlist() {
  const wl = getWatchlist();
  let html = `<div class="gradient-header"><h2>📋 Watchlist</h2><p>Para ver juntos</p></div>`;
  if(!wl.length) {
    html += `<div class="card" style="text-align:center;"><p style="color:var(--text-light);">Aún no tienen pelis. ¡Hagan swipe!</p></div>`;
  } else {
    wl.forEach((m,i) => {
      html += `<div class="card" style="display:flex;justify-content:space-between;align-items:center;">
        <div><b>${m.title}</b> (${m.year})${m.watched?` <span style="color:var(--glow);">★${m.rating||''}</span>`:''}</div>
        <div style="display:flex;gap:8px;">
          ${!m.watched?`<button class="btn-outline" style="padding:4px 10px;font-size:0.7rem;" onclick="markWatched(${i})">✅ Vista</button>`:''}
          <button class="btn-outline" style="padding:4px 10px;font-size:0.7rem;color:#ff6b6b;" onclick="removeWL(${i})">✕</button>
        </div>
      </div>`;
    });
  }
  html += `<button class="btn-ghost" onclick="gameMovieNight()">← Volver</button>`;
  document.getElementById('app-content').innerHTML = html;
}

function markWatched(i) {
  const wl = getWatchlist();
  wl[i].watched = true;
  // Simple rating prompt
  const rating = prompt('¿Rating? (1-5 estrellas)','5');
  if(rating) wl[i].rating = Math.min(5, Math.max(1, parseInt(rating)||5));
  setWatchlist(wl);
  addXP(10);
  showWatchlist();
}

function showAddMovie() {
  document.getElementById('app-content').innerHTML = `
    <div class="card">
      <h3>➕ Agregar peli o serie</h3>
      <p style="font-size:0.8rem;color:var(--text-light);margin-bottom:12px;">Agrega sus propias recomendaciones</p>
      <input type="text" class="input" id="add-movie-title" placeholder="Título">
      <input type="number" class="input" id="add-movie-year" placeholder="Año" value="2024">
      <input type="text" class="input" id="add-movie-why" placeholder="¿Por qué verla?">
      <select class="input" id="add-movie-mood">
        <option value="reír">😂 Reír</option>
        <option value="llorar">😢 Llorar</option>
        <option value="pensar">🧠 Pensar</option>
      </select>
      <button class="btn-primary" onclick="saveCustomMovie()">Guardar</button>
      <button class="btn-ghost" onclick="gameMovieNight()">← Cancelar</button>
    </div>`;
}

function saveCustomMovie() {
  const title = document.getElementById('add-movie-title').value.trim();
  const year = parseInt(document.getElementById('add-movie-year').value) || 2024;
  const why = document.getElementById('add-movie-why').value.trim() || 'Recomendación de la pareja';
  const mood = document.getElementById('add-movie-mood').value;
  if(!title) return;
  const custom = JSON.parse(localStorage.getItem('welo_custom_movies')||'[]');
  custom.push({title, year, why, mood, genre:'custom'});
  localStorage.setItem('welo_custom_movies', JSON.stringify(custom));
  addXP(5);
  gameMovieNight();
}

function addToWL(title,year) { const wl=getWatchlist(); if(wl.find(m=>m.title===title))return; wl.push({title,year,watched:false}); setWatchlist(wl); addXP(3); gameMovieNight(); }
function removeWL(i) { const wl=getWatchlist(); wl.splice(i,1); setWatchlist(wl); showWatchlist(); }

// =================== 36 QUESTIONS ===================
const questions36 = ['Si pudieras cenar con cualquier persona, ¿quién?','¿Te gustaría ser famoso/a?','¿Ensayas antes de llamar?','¿Cómo sería un día perfecto?','¿Cuál es tu recuerdo más preciado?','¿Algo que soñaste hacer y no has hecho?','¿Cuándo lloraste frente a alguien?','Si murieras esta noche, ¿qué lamentarías no haber dicho?','Tu casa se incendia: ¿qué salvas?','Comparte un problema y pide consejo.','¿Qué agradeces más?','Si pudieras cambiar algo de cómo te criaron, ¿qué?','¿Tu mayor logro?','¿Qué valoras más en una amistad?','¿Tu recuerdo más vergonzoso?','¿Qué rol tiene el amor en tu vida?','Dile algo que te guste de tu pareja (nuevo).','Completa: "Me gustaría tener alguien con quien compartir..."','¿Qué significaría para ti una relación perfecta?','¿Cuál es tu posesión más valiosa emocionalmente?','¿De qué aspecto de tu vida estás más agradecid@?','¿Qué cambiarías de ti si pudieras?','¿Hay algo que siempre quisiste decirme y no lo has hecho?','¿Qué es lo más importante en una relación para ti?','Comparte un momento embarazoso de tu vida.','¿Cuándo fue la última vez que lloraste solo/a? ¿Y frente a alguien?','Dile algo que ya te guste de tu pareja.','¿Hay algo que sea demasiado serio para bromear?','Si supieras que vas a morir en un año, ¿cambiarías algo de cómo vives?','¿Qué significa la amistad para ti?','¿Qué tan importante es el cariño y el afecto en tu vida?','Comparte algo que consideres un recuerdo positivo de tu infancia.','¿Cómo es la relación con tu madre?','Di tres cosas que creas que ambos tienen en común.','¿Qué es lo que más valoras de nuestra relación?','Completa: "Desearía tener a alguien con quien compartir..."'];

function game36Questions() {
  const game = getGame();
  const progress = game.q36progress || 0;
  if(progress >= questions36.length) {
    document.getElementById('app-content').innerHTML = `<div class="card" style="text-align:center;"><h3>✅ ¡Completaron las ${questions36.length}!</h3><p>Han profundizado su conexión 💕</p><button class="btn-primary" onclick="const g=getGame();g.q36progress=0;setGame(g);game36Questions();">🔄 Reiniciar</button><button class="btn-ghost" onclick="renderGames()">← Volver</button></div>`;
    return;
  }
  const end = Math.min(progress+3, questions36.length);
  let html = `<div class="card"><h3>💭 Preguntas ${progress+1}-${end}</h3><p style="font-size:0.8rem;color:var(--text-light);margin-bottom:12px;">Lean en voz alta y respondan juntos</p>`;
  for(let i=progress;i<end;i++) html += `<div style="padding:12px;background:rgba(255,107,157,0.05);border-radius:12px;margin:8px 0;"><p style="font-size:0.85rem;">${i+1}. ${questions36[i]}</p></div>`;
  html += `<button class="btn-primary" onclick="const g=getGame();g.q36progress=${end};setGame(g);addXP(20);game36Questions();">✅ Respondidas</button><button class="btn-ghost" onclick="renderGames()">← Volver</button></div>`;
  document.getElementById('app-content').innerHTML = html;
}

// =================== BUCKET LIST ===================
function gameBucketList() {
  const bl = JSON.parse(localStorage.getItem('welo_bucket')||'[]');
  const ideas = ['Ver amanecer juntos','Cocinar algo nuevo','Ir a la playa sin celular','Probar restaurante nuevo','Hacer un picnic','Paseo nocturno','Clase de baile','Hacer fotos juntos','Maratón de pelis','Masajes mutuos'];
  let html = `<div class="card"><h3>✨ Bucket List</h3><input type="text" class="input" id="bucket-inp" placeholder="Añadir algo..."><button class="btn-primary" onclick="addBucketItem()">+ Añadir</button></div>`;
  if(bl.length) {
    html += `<div class="card"><h4>📋 Lista (${bl.length})</h4>`;
    bl.forEach((item,i) => { html += `<p style="padding:8px 0;border-bottom:1px solid #f0f0f0;${item.done?'text-decoration:line-through;color:#aaa;':''}">${item.done?'✅':'⬜'} ${item.text} <span onclick="toggleBucket(${i})" style="cursor:pointer;color:var(--primary);font-size:0.8rem;">${item.done?'↩️':'✅'}</span></p>`; });
    html += `</div>`;
  }
  html += `<div class="card"><h4>💡 Ideas</h4><div style="display:flex;flex-wrap:wrap;gap:6px;">${ideas.sort(()=>Math.random()-0.5).slice(0,6).map(s=>`<button class="btn-outline" style="font-size:0.75rem;padding:6px 12px;" onclick="addBucketIdea('${s}')">${s}</button>`).join('')}</div></div>`;
  html += `<button class="btn-ghost" onclick="renderGames()">← Volver</button>`;
  document.getElementById('app-content').innerHTML = html;
}
function addBucketItem() { const inp=document.getElementById('bucket-inp'); const t=inp.value.trim(); if(!t)return; const bl=JSON.parse(localStorage.getItem('welo_bucket')||'[]'); bl.push({text:t,done:false}); localStorage.setItem('welo_bucket',JSON.stringify(bl)); addXP(3); gameBucketList(); }
function addBucketIdea(s) { const bl=JSON.parse(localStorage.getItem('welo_bucket')||'[]'); bl.push({text:s,done:false}); localStorage.setItem('welo_bucket',JSON.stringify(bl)); addXP(3); gameBucketList(); }
function toggleBucket(i) { const bl=JSON.parse(localStorage.getItem('welo_bucket')||'[]'); bl[i].done=!bl[i].done; localStorage.setItem('welo_bucket',JSON.stringify(bl)); if(bl[i].done) addXP(10); gameBucketList(); }
