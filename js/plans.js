// WELO — Plans Module

const plans = [
  {emoji:'🌅',title:'¿Y si ven el atardecer desde un mirador?',place:'Bunkers del Carmel',desc:'Vista 360° de la ciudad. Lleven algo para brindar.',time:'2h',cost:'€',cat:'date',tags:['romántico','naturaleza','gratis','atardecer'],map:'https://maps.google.com/?q=41.4190,2.1620'},
  {emoji:'🏊',title:'¿Nadar juntos al amanecer?',place:'Platja de la Barceloneta',desc:'El agua antes de las 9am es terapéutica. Toalla y café.',time:'1.5h',cost:'Gratis',cat:'sport',tags:['natación','playa','naturaleza','deportivo'],map:'https://maps.google.com/?q=41.3784,2.1915'},
  {emoji:'🧗',title:'¿Probar escalada indoor en pareja?',place:'Sharma Climbing',desc:'Confianza extrema. No necesitan experiencia.',time:'2h',cost:'€€',cat:'sport',tags:['escalada','aventura','deportivo','indoor'],map:'https://maps.google.com/?q=41.2940,1.9930'},
  {emoji:'💃',title:'¿Y si toman una clase de baile juntos?',place:'Escola de ball',desc:'Bachata, salsa o lo que sea. Reírse del proceso.',time:'1.5h',cost:'€',cat:'sport',tags:['baile','música','social','deportivo'],map:'https://maps.google.com/?q=41.3850,2.1830'},
  {emoji:'☕',title:'¿Una ruta de cafeterías que no conozcan?',place:'Barrio del Born',desc:'Prueben 3 cafés nuevos. Voten el mejor.',time:'3h',cost:'€€',cat:'date',tags:['café','foodie','paseo','brunch'],map:'https://maps.google.com/?q=41.3840,2.1820'},
  {emoji:'🧘',title:'¿Yoga juntos al aire libre?',place:'Parc de la Ciutadella',desc:'Con mat en un parque. YouTube + bocina = clase privada gratis.',time:'1h',cost:'Gratis',cat:'sport',tags:['yoga','naturaleza','relax','deportivo'],map:'https://maps.google.com/?q=41.3633,2.1660'},
  {emoji:'🏰',title:'¿Un fuerte de cobijas + peli?',place:'En casa',desc:'Construyan un fuerte. Palomitas. Celulares fuera.',time:'3h',cost:'Gratis',cat:'home',tags:['cine','relax','romántico','indoor']},
  {emoji:'👨‍🍳',title:'¿Cocinar algo que nunca hicieron?',place:'En casa',desc:'Elijan una receta nueva. El desastre es parte de la diversión.',time:'2h',cost:'€',cat:'home',tags:['cocinar','foodie','creativo','indoor']},
  {emoji:'🎵',title:'¿Armar su playlist del recuerdo?',place:'En casa',desc:'Cada canción cuenta una historia de ustedes.',time:'1.5h',cost:'Gratis',cat:'home',tags:['música','relax','romántico','indoor']},
  {emoji:'🧖',title:'¿Un spa casero?',place:'En casa',desc:'Mascarillas, velas, música, masajes mutuos.',time:'1.5h',cost:'€',cat:'self',tags:['relax','bienestar','romántico','indoor']},
  {emoji:'📝',title:'¿Journaling de pareja?',place:'En casa',desc:'3 cosas que amas. 1 que mejorar. 1 sueño juntos.',time:'45min',cost:'Gratis',cat:'self',tags:['creativo','relax','comunicación','indoor']},
  {emoji:'💆',title:'¿Unos baños árabes en pareja?',place:'Aire Ancient Baths',desc:'Circuito de aguas. Experiencia sensorial total.',time:'2h',cost:'€€€',cat:'self',tags:['bienestar','relax','romántico','premium'],map:'https://maps.google.com/?q=41.3840,2.1800'},
  {emoji:'🚲',title:'¿Bici por el litoral sin prisa?',place:'Passeig Marítim',desc:'8km de brisa y sol. Sin prisa.',time:'2h',cost:'€',cat:'sport',tags:['bici','naturaleza','deportivo','playa'],map:'https://maps.google.com/?q=41.3850,2.1950'},
  {emoji:'🎲',title:'¿Una noche de juegos de mesa?',place:'Bar de juegos',desc:'En un bar con juegos o en casa. Competencia sana.',time:'3h',cost:'€',cat:'social',tags:['videojuegos','social','nocturno','indoor'],map:'https://maps.google.com/?q=41.4020,2.1560'},
  {emoji:'🍺',title:'¿Una ruta de vermuterías?',place:'Gràcia',desc:'Vermut + olivas + bravas. La tradición local.',time:'3h',cost:'€€',cat:'social',tags:['foodie','social','tapas','paseo'],map:'https://maps.google.com/?q=41.3900,2.1640'},
  {emoji:'🌿',title:'¿Caminar entre árboles sin celular?',place:'Parc de Collserola',desc:'Sin destino. Solo naturaleza y silencio compartido.',time:'2h',cost:'Gratis',cat:'self',tags:['senderismo','naturaleza','relax','gratis'],map:'https://maps.google.com/?q=41.4200,2.1100'},
  {emoji:'📚',title:'¿Leer juntos en silencio?',place:'Biblioteca o café',desc:'Después hablen de lo que leyeron.',time:'2h',cost:'Gratis',cat:'self',tags:['leer','relax','café','indoor']},
  {emoji:'🎤',title:'¿Karaoke? Las ridículas primero',place:'Karaoke bar',desc:'La vergüenza compartida une. Mucho.',time:'2h',cost:'€',cat:'social',tags:['música','social','nocturno','aventura']},
  {emoji:'🏄',title:'¿Paddle surf juntos?',place:'Playa',desc:'Alquiler por horas. Caerse juntos = risas.',time:'1.5h',cost:'€€',cat:'sport',tags:['surf','playa','aventura','deportivo'],map:'https://maps.google.com/?q=41.3940,2.2120'},
  {emoji:'🌊',title:'¿Paseo nocturno por la playa?',place:'Barceloneta',desc:'Pies en la arena. Sonido del mar. Solo estar.',time:'1h',cost:'Gratis',cat:'date',tags:['playa','romántico','nocturno','gratis'],map:'https://maps.google.com/?q=41.3760,2.1900'}
];

function renderPlans() {
  if(window.welo&&window.welo.track)window.welo.track('plan_viewed');
  let html = `<div class="gradient-header"><h2>✨ Planes</h2><p>Recomendados para ustedes</p></div>`;
  
  // Lumi recommendation
  const lumiRec = getLumiRecommendation();
  if(lumiRec) {
    html += `<div class="card" style="border-left:4px solid var(--glow);padding:14px 18px;">
      <p style="font-size:0.82rem;color:var(--text);line-height:1.4;font-style:italic;">"${lumiRec}"</p>
    </div>`;
  }
  
  // Mood selector
  html += `<div class="card">
    <h3 style="font-size:0.9rem;margin-bottom:12px;">¿Qué mood tienen hoy?</h3>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      <button class="btn-outline" style="font-size:0.8rem;" onclick="showPlans('all')">🌟 Todo</button>
      <button class="btn-outline" style="font-size:0.8rem;" onclick="showPlans('sport')">🏋️ Activos</button>
      <button class="btn-outline" style="font-size:0.8rem;" onclick="showPlans('date')">💕 Cita</button>
      <button class="btn-outline" style="font-size:0.8rem;" onclick="showPlans('home')">🏠 Casa</button>
      <button class="btn-outline" style="font-size:0.8rem;" onclick="showPlans('self')">🧘 Relax</button>
      <button class="btn-outline" style="font-size:0.8rem;" onclick="showPlans('social')">🎉 Social</button>
    </div>
  </div>`;
  
  // Get recommended plans (sorted by compatibility score)
  const recommended = getRecommendedPlans(plans);
  const picks = recommended.slice(0, 4);
  
  picks.forEach((p,i) => {
    html += renderPlanCard(p, i);
    // Show score subtly
    if(p.score > 70) html = html.replace(`⏱️ ${p.time}`, `⏱️ ${p.time} • <span style="color:var(--primary);font-weight:600;">${p.score}% match</span>`);
  });
  
  html += `<button class="btn-primary" onclick="renderPlans()">🔄 Otras opciones</button>`;
  // Plans history
  const done = JSON.parse(localStorage.getItem('welo_plans_done')||'[]');
  if(done.length) {
    html += `<div class="card" style="margin-top:16px;"><h4 style="font-size:0.85rem;margin-bottom:8px;">📋 Planes hechos (${done.length})</h4>`;
    done.slice(-5).reverse().forEach(d => {
      html += `<p style="font-size:0.8rem;padding:6px 0;border-bottom:1px solid #f5f5f5;color:var(--text-light);">✅ ${d.title} <span style="font-size:0.7rem;">(${d.date})</span></p>`;
    });
    html += `</div>`;
  }
  document.getElementById('app-content').innerHTML = html;
}

function renderPlanCard(p, i) {
  const detailId = 'plan-detail-'+i+'-'+Math.random().toString(36).substr(2,5);
  return `<div class="card">
    <p style="font-size:1.5rem;margin-bottom:6px;">${p.emoji}</p>
    <h4 style="font-size:0.95rem;margin-bottom:4px;">${p.title}</h4>
    <p style="font-size:0.82rem;color:var(--text-light);line-height:1.4;">${p.desc}</p>
    <p style="font-size:0.72rem;color:var(--text-light);margin-top:8px;">⏱️ ${p.time} • 💰 ${p.cost}</p>
    <div id="${detailId}" style="display:none;margin-top:10px;padding:10px;background:rgba(255,107,157,0.04);border-radius:12px;">
      <p style="font-size:0.85rem;font-weight:600;margin-bottom:4px;">📍 ${p.place}</p>
      ${p.map?`<a href="${p.map}" target="_blank" style="display:inline-block;padding:4px 12px;background:#e3f2fd;color:#1565c0;border-radius:20px;font-size:0.7rem;font-weight:600;text-decoration:none;">🗺️ Ver en mapa</a>`:''}
    </div>
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button class="btn-ghost" style="font-size:0.75rem;flex:1;" onclick="document.getElementById('${detailId}').style.display=document.getElementById('${detailId}').style.display==='none'?'block':'none'">📍 Ver dónde</button>
      <button class="btn-outline" style="font-size:0.7rem;padding:6px 12px;" onclick="markPlanDone('${p.title.replace(/'/g,"\\'")}');this.textContent='✅ +15 XP';this.disabled=true;">✅ Lo hicimos</button>
    </div>
  </div>`;
}

function markPlanDone(title) {
  const done = JSON.parse(localStorage.getItem('welo_plans_done')||'[]');
  done.push({title, date: today()});
  localStorage.setItem('welo_plans_done', JSON.stringify(done));
  addXP(15);
  if(window.welo&&window.welo.track)window.welo.track('plan_completed',{title:title});
  showToast('🎉 ¡Plan completado! +15 XP');
  setTimeout(() => promptSaveMemory('plan', title), 1000);
}

function showPlans(cat) {
  let filtered = cat==='all' ? plans : plans.filter(p=>p.cat===cat);
  filtered = [...filtered].sort(()=>Math.random()-0.5).slice(0,4);
  
  let html = `<div class="gradient-header"><h2>✨ Planes</h2><p>Te podría gustar algo así...</p></div>`;
  filtered.forEach((p,i) => {
    html += renderPlanCard(p, i);
  });
  html += `<button class="btn-primary" onclick="showPlans('${cat}')">🔄 Otras opciones</button>`;
  html += `<button class="btn-ghost" onclick="renderPlans()">← Volver</button>`;
  document.getElementById('app-content').innerHTML = html;
}
