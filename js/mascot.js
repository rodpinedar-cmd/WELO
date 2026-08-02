// WELO — Lumi Tamagotchi Mascot System
function getLumi(){try{return JSON.parse(localStorage.getItem('welo_lumi'))||{level:1,mood:'happy',hunger:100,energy:100,color:'default',accessory:'none',wings:'default',lastFed:null,lastPlayed:null,evolveStage:1};}catch{return{level:1,mood:'happy',hunger:100,energy:100,color:'default',accessory:'none',wings:'default',lastFed:null,lastPlayed:null,evolveStage:1};}}
function setLumi(l){localStorage.setItem('welo_lumi',JSON.stringify(l));}
function getLumiStage(xp){if(xp>=2000)return 4;if(xp>=1000)return 3;if(xp>=300)return 2;return 1;}
function getLumiStageName(s){return{1:'🥚 Bebé',2:'🌱 Joven',3:'✨ Adulta',4:'👑 Legendaria'}[s]||'🥚 Bebé';}

function updateLumiDaily(){
  const l=getLumi(),t=new Date().toISOString().split('T')[0],co=getCouple();
  if(l.lastFed!==t)l.hunger=Math.max(0,l.hunger-15);
  if(l.lastPlayed!==t)l.energy=Math.max(0,l.energy-10);
  if(l.hunger<30&&l.energy<30)l.mood='sad';
  else if(l.hunger<50)l.mood='sleepy';
  else if(l.energy>80&&l.hunger>80)l.mood='excited';
  else l.mood='happy';
  l.evolveStage=getLumiStage(co.xp);
  l.level=Math.min(20,Math.floor(co.xp/100)+1);
  setLumi(l);return l;
}
function feedLumi(){const l=getLumi();l.hunger=Math.min(100,l.hunger+30);l.lastFed=new Date().toISOString().split('T')[0];l.mood='happy';setLumi(l);addXP(2);completeMission('lumi');}
function playWithLumi(){const l=getLumi();l.energy=Math.min(100,l.energy+25);l.lastPlayed=new Date().toISOString().split('T')[0];l.mood='excited';setLumi(l);addXP(2);completeMission('lumi');}

function getLumiColors(c){const m={'default':{body:'#2d3436',belly:'#ffd700',glow:'#ffd700',ant:'#ff6b9d'},'pink':{body:'#c44569',belly:'#ffb8d0',glow:'#ff6b9d',ant:'#ffd700'},'blue':{body:'#2c5f8a',belly:'#87ceeb',glow:'#4a90d9',ant:'#ffd700'},'gold':{body:'#b8860b',belly:'#ffd700',glow:'#fff44f',ant:'#ff6b9d'},'purple':{body:'#6b2fa0',belly:'#d8b4fe',glow:'#a855f7',ant:'#ffd700'},'rainbow':{body:'#2d3436',belly:'url(#rbw)',glow:'#ffd700',ant:'#ff6b9d'}};return m[c]||m['default'];}

function lumiSVG(opt){
  const l=opt||getLumi(),c=getLumiColors(l.color||'default'),st=l.evolveStage||1;
  let eyes,mouth,acc='',wf='rgba(255,107,157,0.25)',ws='rgba(255,107,157,0.4)',sp='';
  // Eyes by mood
  if(l.mood==='sleepy')eyes=`<path d="M42 36L48 36" stroke="${c.body}" stroke-width="2" stroke-linecap="round"/><path d="M52 36L58 36" stroke="${c.body}" stroke-width="2" stroke-linecap="round"/>`;
  else if(l.mood==='sad')eyes=`<circle cx="45" cy="37" r="3" fill="white"/><circle cx="55" cy="37" r="3" fill="white"/><circle cx="45" cy="38" r="1.5" fill="${c.body}"/><circle cx="55" cy="38" r="1.5" fill="${c.body}"/>`;
  else eyes=`<circle cx="45" cy="36" r="3.5" fill="white"/><circle cx="55" cy="36" r="3.5" fill="white"/><circle cx="45.5" cy="36.5" r="1.8" fill="${c.body}"/><circle cx="55.5" cy="36.5" r="1.8" fill="${c.body}"/><circle cx="44" cy="35" r="1" fill="white"/><circle cx="54" cy="35" r="1" fill="white"/>`;
  // Mouth
  if(l.mood==='sad')mouth=`<path d="M45 44Q50 41 55 44" stroke="${c.body}" stroke-width="1.5" fill="none"/>`;
  else if(l.mood==='excited')mouth=`<ellipse cx="50" cy="43" rx="4" ry="3" fill="${c.ant}" opacity="0.4"/>`;
  else if(l.mood==='sleepy')mouth=`<line x1="47" y1="42" x2="53" y2="42" stroke="${c.body}" stroke-width="1"/>`;
  else mouth=`<path d="M45 41Q50 45 55 41" stroke="${c.ant}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  // Accessory
  if(l.accessory==='bow')acc=`<text x="38" y="25" font-size="10">🎀</text>`;
  else if(l.accessory==='crown')acc=`<text x="42" y="22" font-size="12">👑</text>`;
  else if(l.accessory==='glasses')acc=`<rect x="40" y="33" width="8" height="6" rx="3" fill="none" stroke="#333" stroke-width="1"/><rect x="52" y="33" width="8" height="6" rx="3" fill="none" stroke="#333" stroke-width="1"/><line x1="48" y1="36" x2="52" y2="36" stroke="#333"/>`;
  else if(l.accessory==='heart')acc=`<text x="60" y="30" font-size="8">💖</text>`;
  else if(l.accessory==='star')acc=`<text x="60" y="28" font-size="10">⭐</text>`;
  // Wings
  if(l.wings==='sparkle'){wf='rgba(255,215,0,0.3)';ws='rgba(255,215,0,0.6)';}
  else if(l.wings==='butterfly'){wf='rgba(168,85,247,0.3)';ws='rgba(168,85,247,0.5)';}
  else if(l.wings==='angel'){wf='rgba(255,255,255,0.5)';ws='rgba(200,200,200,0.6)';}
  else if(l.wings==='fire'){wf='rgba(249,115,22,0.3)';ws='rgba(249,115,22,0.6)';}
  // Sparkles for high stages
  if(st>=3)sp+=`<circle cx="30" cy="30" r="1.5" fill="${c.glow}" opacity="0.7"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></circle>`;
  if(st>=4)sp+=`<circle cx="72" cy="25" r="2" fill="${c.ant}"><animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" repeatCount="indefinite"/></circle>`;
  const wr=12+st*2,wh=7+st;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${l.color==='rainbow'?'<defs><linearGradient id="rbw" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff6b9d"/><stop offset="50%" stop-color="#ffd700"/><stop offset="100%" stop-color="#4ecdc4"/></linearGradient></defs>':''}${sp}<circle class="glow-circle" cx="50" cy="62" r="18" fill="${c.glow}" opacity="0.6"/><ellipse cx="50" cy="58" rx="12" ry="16" fill="${c.body}"/><ellipse cx="50" cy="64" rx="9" ry="11" fill="${c.belly}"/><circle cx="50" cy="38" r="12" fill="${c.body}"/>${eyes}${mouth}<path d="M45 28Q42 20 38 18" stroke="${c.body}" stroke-width="1.5" fill="none"/><path d="M55 28Q58 20 62 18" stroke="${c.body}" stroke-width="1.5" fill="none"/><circle cx="38" cy="18" r="2.5" fill="${c.ant}"/><circle cx="62" cy="18" r="2.5" fill="${c.ant}"/><ellipse class="wing-left" cx="35" cy="48" rx="${wr}" ry="${wh}" fill="${wf}" stroke="${ws}" stroke-width="0.5"/><ellipse class="wing-right" cx="65" cy="48" rx="${wr}" ry="${wh}" fill="${wf}" stroke="${ws}" stroke-width="0.5"/><line x1="44" y1="73" x2="42" y2="78" stroke="${c.body}" stroke-width="1.5" stroke-linecap="round"/><line x1="50" y1="74" x2="50" y2="80" stroke="${c.body}" stroke-width="1.5" stroke-linecap="round"/><line x1="56" y1="73" x2="58" y2="78" stroke="${c.body}" stroke-width="1.5" stroke-linecap="round"/>${acc}</svg>`;
}

const lumiTips={home:["¡Hola! Soy Lumi ✨ Estoy aquí para iluminarles el camino.","Un abrazo de 20seg = oxitocina pura 🤗","¿Ya hicieron el reto de hoy? ¡Se lo merecen!","Pequeños gestos diarios > grandes gestos esporádicos 💕","Reírse juntos -40% conflictos. Literal. 😄","¡Me encanta verlos aquí juntos! ✨","Tip: decir 'gracias' diario = +35% satisfacción 🙏","¿Sabían que cocinar juntos = jugar en equipo? 🧑‍🍳","Hoy es un buen día para un cumplido inesperado 💬"],calendar:["Tu ciclo es un superpoder. Conócelo y domínalo 🌙","En fase lútea: paciencia contigo misma. No decidas nada grande.","Registrar tu mood te ayuda a ver patrones. ¡Hazlo!","Chocolate oscuro 70% = magnesio para el alma 🍫","Cada fase es diferente. Y cada una tiene su magia ✨"],plans:["Toca 🔄 hasta que algo les llame. No hay prisa ✨","Un paseo sin celular vale más que una cena cara 🌊","Probar algo nuevo juntos reactiva el enamoramiento 🧪","¿Y si hoy se sorprenden mutuamente? 💡","El mejor plan es el que hacen juntos. Cualquier plan."],games:["Los juegos crean memorias compartidas 🎮","¿Ya probaron el Swipe de Pelis? Es adictivo 🎬","Las 36 Preguntas son intensas. Prepárense para llorar 💭","Verdad o Reto nivel spicy? 👀🔥","Jugar juntos es la cita más fácil que existe"],blog:["Saber es poder. Y leer juntos es intimidad 📚","El 90% de la serotonina se produce en el intestino 🥗","¿Sabían que las parejas con rituales duran más? ☕","Un dato al día mantiene la curiosidad viva 💡"]};

function renderLumiCorner(ctx){
  const ex=document.querySelector('.mascot-corner');if(ex)ex.remove();
  const l=updateLumiDaily(),tips=lumiTips[ctx||'home'],tip=tips[Math.floor(Math.random()*tips.length)];
  const d=document.createElement('div');d.className='mascot-corner';
  d.innerHTML=`<div class="mascot-tip">${tip}</div><div class="welo-mascot sm">${lumiSVG(l)}</div>`;
  d.onclick=function(){this.classList.toggle('show-tip');this.querySelector('.mascot-tip').textContent=tips[Math.floor(Math.random()*tips.length)];};
  document.body.appendChild(d);
}

function renderLumiProfile(){
  const l=updateLumiDaily(),co=getCouple(),items={colors:[{id:'default',n:'Original',r:0},{id:'pink',n:'Rosa',r:100},{id:'blue',n:'Azul',r:200},{id:'gold',n:'Dorada',r:500},{id:'purple',n:'Violeta',r:800},{id:'rainbow',n:'Arcoíris',r:1500}],accessories:[{id:'none',n:'Ninguno',r:0},{id:'bow',n:'Moño',r:50},{id:'glasses',n:'Gafas',r:150},{id:'heart',n:'Corazón',r:300},{id:'crown',n:'Corona',r:600},{id:'star',n:'Estrella',r:1000}],wings:[{id:'default',n:'Normal',r:0},{id:'sparkle',n:'Brillantes',r:200},{id:'butterfly',n:'Mariposa',r:400},{id:'angel',n:'Ángel',r:700},{id:'fire',n:'Fuego',r:1200}]};
  let h=`<div class="gradient-header"><h2>🪲 Lumi</h2><p>Tu luciérnaga de pareja</p></div>`;
  // Lumi says something contextual
  const greetings=["¡Yay! Vinieron a verme 🥰","¿Cómo están hoy? ✨","Los extrañaba 💕","¡Hola! ¿Jugamos? 🎮","Me encanta que estén aquí 🌟"];
  const greeting=greetings[Math.floor(Math.random()*greetings.length)];
  h+=`<div class="card" style="text-align:center;position:relative;">
    <div style="position:absolute;top:12px;right:16px;padding:4px 12px;background:rgba(255,215,0,0.15);border-radius:20px;font-size:0.7rem;font-weight:600;color:#b8860b;">${co.glow||0} GLOW ✨</div>
    <div class="welo-mascot xl" style="margin:0 auto;">${lumiSVG(l)}</div>
    <p style="font-size:0.85rem;font-style:italic;color:var(--secondary);margin-top:8px;">"${greeting}"</p>
    <p style="font-size:1.2rem;font-weight:700;margin-top:8px;">Lumi</p>
    <p style="font-size:0.8rem;color:var(--text-light);">Nivel ${l.level} • ${getLumiStageName(l.evolveStage)}</p>
    <div style="display:flex;gap:16px;justify-content:center;margin-top:16px;">
      <div><p style="font-size:0.7rem;color:var(--text-light);">🍯 Hambre</p><div style="width:60px;height:6px;background:#eee;border-radius:3px;"><div style="width:${l.hunger}%;height:100%;background:${l.hunger>50?'#4caf50':'#ff9800'};border-radius:3px;"></div></div></div>
      <div><p style="font-size:0.7rem;color:var(--text-light);">⚡ Energía</p><div style="width:60px;height:6px;background:#eee;border-radius:3px;"><div style="width:${l.energy}%;height:100%;background:${l.energy>50?'#2196f3':'#ff5722'};border-radius:3px;"></div></div></div>
    </div>
    <p style="font-size:0.75rem;margin-top:8px;">${l.mood==='happy'?'😊 Feliz':l.mood==='excited'?'🤩 Emocionada':l.mood==='sleepy'?'😴 Con sueño':l.mood==='sad'?'😢 Triste':'😊'}</p>
  </div>`;
  // Actions
  h+=`<div class="card"><h4 style="font-size:0.9rem;margin-bottom:12px;">Cuidar a Lumi</h4><div style="display:flex;gap:12px;"><button class="btn-primary" style="flex:1;font-size:0.85rem;" onclick="feedLumi();renderLumiProfile();">🍯 Alimentar</button><button class="btn-outline" style="flex:1;font-size:0.85rem;" onclick="playWithLumi();renderLumiProfile();">⚡ Jugar</button></div><p style="font-size:0.7rem;color:var(--text-light);margin-top:8px;text-align:center;">Interactúa diario • +2 XP</p></div>`;
  // Lumi's Home
  h+=`<div class="card" onclick="renderLumiHome()" style="cursor:pointer;">
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="font-size:2rem;">🏡</span>
      <div><h4 style="font-size:0.9rem;">Casa de Lumi</h4><p style="font-size:0.75rem;color:var(--text-light);">Decora su espacio con GLOW</p></div>
      <span style="margin-left:auto;color:var(--primary);">→</span>
    </div>
  </div>`;
  // Customization
  h+=`<div class="card"><h4 style="font-size:0.9rem;margin-bottom:12px;">🎨 Personalizar (${co.glow||0} GLOW ✨)</h4>`;
  h+=`<p style="font-size:0.75rem;font-weight:600;margin-bottom:6px;">Color</p><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">`;
  items.colors.forEach(i=>{const u=co.xp>=i.r,a=l.color===i.id;h+=`<button style="padding:5px 10px;border-radius:20px;font-size:0.7rem;border:2px solid ${a?'var(--primary)':'#eee'};background:${a?'rgba(255,107,157,0.1)':'white'};opacity:${u?1:0.4};cursor:${u?'pointer':'default'};" ${u?`onclick="customizeLumi('color','${i.id}')"`:''}>${i.n}${u?'':'🔒'+i.r}</button>`;});
  h+=`</div><p style="font-size:0.75rem;font-weight:600;margin-bottom:6px;">Accesorio</p><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">`;
  items.accessories.forEach(i=>{const u=co.xp>=i.r,a=l.accessory===i.id;h+=`<button style="padding:5px 10px;border-radius:20px;font-size:0.7rem;border:2px solid ${a?'var(--primary)':'#eee'};background:${a?'rgba(255,107,157,0.1)':'white'};opacity:${u?1:0.4};cursor:${u?'pointer':'default'};" ${u?`onclick="customizeLumi('accessory','${i.id}')"`:''}>${i.n}${u?'':'🔒'+i.r}</button>`;});
  h+=`</div><p style="font-size:0.75rem;font-weight:600;margin-bottom:6px;">Alas</p><div style="display:flex;flex-wrap:wrap;gap:6px;">`;
  items.wings.forEach(i=>{const u=co.xp>=i.r,a=l.wings===i.id;h+=`<button style="padding:5px 10px;border-radius:20px;font-size:0.7rem;border:2px solid ${a?'var(--primary)':'#eee'};background:${a?'rgba(255,107,157,0.1)':'white'};opacity:${u?1:0.4};cursor:${u?'pointer':'default'};" ${u?`onclick="customizeLumi('wings','${i.id}')"`:''}>${i.n}${u?'':'🔒'+i.r}</button>`;});
  h+=`</div></div>`;
  // Evolution
  h+=`<div class="card" style="text-align:center;"><h4 style="font-size:0.9rem;margin-bottom:8px;">🌟 Evolución</h4><div style="display:flex;justify-content:space-around;"><div style="opacity:${l.evolveStage>=1?1:0.3};"><p>🥚</p><p style="font-size:0.6rem;">0</p></div><div style="opacity:${l.evolveStage>=2?1:0.3};"><p>🌱</p><p style="font-size:0.6rem;">300</p></div><div style="opacity:${l.evolveStage>=3?1:0.3};"><p>✨</p><p style="font-size:0.6rem;">1000</p></div><div style="opacity:${l.evolveStage>=4?1:0.3};"><p>👑</p><p style="font-size:0.6rem;">2000</p></div></div></div>`;
  h+=`<button class="btn-ghost" onclick="renderHome();renderLumiCorner('home');">← Volver</button>`;
  document.getElementById('app-content').innerHTML=h;
}

// Lumi's Home
function renderLumiHome(){
  const co=getCouple();
  const home=JSON.parse(localStorage.getItem('welo_lumi_home')||'{"items":[],"room":"garden"}');
  const rooms=[
    {id:'garden',name:'🌿 Jardín',req:0},
    {id:'sala',name:'🛋️ Sala',req:300},
    {id:'terraza',name:'🏖️ Terraza',req:600},
    {id:'cielo',name:'🌌 Cielo',req:1000},
    {id:'castillo',name:'🏰 Castillo',req:2000}
  ];
  const shopItems=[
    {id:'plant1',name:'🌱 Planta',cost:5},
    {id:'plant2',name:'🌻 Girasol',cost:8},
    {id:'candle',name:'🕯️ Vela',cost:10},
    {id:'book',name:'📚 Libros',cost:12},
    {id:'cat',name:'🐱 Gatito',cost:30},
    {id:'dog',name:'🐶 Perrito',cost:30},
    {id:'fairy',name:'✨ Luces',cost:15},
    {id:'frame',name:'🖼️ Cuadro',cost:20},
    {id:'rug',name:'🟫 Alfombra',cost:15},
    {id:'music',name:'🎵 Tocadiscos',cost:25}
  ];
  const roomBgs={garden:'linear-gradient(180deg,#e8f5e9,#c8e6c9)',sala:'linear-gradient(180deg,#fff3e0,#ffe0b2)',terraza:'linear-gradient(180deg,#e3f2fd,#bbdefb)',cielo:'linear-gradient(180deg,#1a1a2e,#2d3436)',castillo:'linear-gradient(180deg,#f3e5f5,#e1bee7)'};
  
  let h=`<div class="gradient-header"><h2>🏡 Casa de Lumi</h2><p>Decora con GLOW (tienes ${co.glow||0} ✨)</p></div>`;
  // Room display
  h+=`<div class="card" style="min-height:200px;background:${roomBgs[home.room]||roomBgs.garden};border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;">
    <div class="welo-mascot" style="margin-bottom:8px;">${lumiSVG(getLumi())}</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px;">
      ${home.items.map(id=>{const item=shopItems.find(s=>s.id===id);return item?`<span style="font-size:1.5rem;">${item.name.split(' ')[0]}</span>`:''}).join('')}
    </div>
  </div>`;
  // Room selector
  h+=`<div class="card"><h4 style="font-size:0.85rem;margin-bottom:10px;">Habitaciones</h4><div style="display:flex;flex-wrap:wrap;gap:6px;">`;
  rooms.forEach(r=>{
    const unlocked=co.xp>=r.req;
    const active=home.room===r.id;
    h+=`<button style="padding:6px 12px;border-radius:20px;font-size:0.75rem;border:2px solid ${active?'var(--primary)':'#eee'};background:${active?'rgba(255,107,157,0.1)':'white'};opacity:${unlocked?1:0.4};cursor:${unlocked?'pointer':'default'};" ${unlocked?`onclick="setLumiRoom('${r.id}')"`:''}>${r.name}${unlocked?'':'🔒'+r.req}</button>`;
  });
  h+=`</div></div>`;
  // Shop
  h+=`<div class="card"><h4 style="font-size:0.85rem;margin-bottom:10px;">🛒 Tienda</h4><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">`;
  shopItems.forEach(item=>{
    const owned=home.items.includes(item.id);
    const canBuy=(co.glow||0)>=item.cost;
    h+=`<div style="padding:12px;border-radius:12px;background:${owned?'rgba(76,175,80,0.05)':'#f9f9f9'};border:1px solid ${owned?'#4caf50':'#eee'};text-align:center;">
      <p style="font-size:1.3rem;">${item.name.split(' ')[0]}</p>
      <p style="font-size:0.75rem;font-weight:600;">${item.name.split(' ').slice(1).join(' ')}</p>
      ${owned?'<p style="font-size:0.65rem;color:#4caf50;">✅ Tienes</p>':`<button style="margin-top:6px;padding:4px 12px;border-radius:20px;border:none;background:${canBuy?'var(--primary)':'#ccc'};color:white;font-size:0.7rem;font-weight:600;cursor:${canBuy?'pointer':'default'};" ${canBuy?`onclick="buyLumiItem('${item.id}',${item.cost})"`:''}>${item.cost} GLOW</button>`}
    </div>`;
  });
  h+=`</div></div>`;
  h+=`<button class="btn-ghost" onclick="renderLumiProfile()">← Volver a Lumi</button>`;
  document.getElementById('app-content').innerHTML=h;
}

function setLumiRoom(roomId){
  const home=JSON.parse(localStorage.getItem('welo_lumi_home')||'{"items":[],"room":"garden"}');
  home.room=roomId;
  localStorage.setItem('welo_lumi_home',JSON.stringify(home));
  renderLumiHome();
}

function buyLumiItem(itemId,cost){
  const co=getCouple();
  if((co.glow||0)<cost)return;
  co.glow=(co.glow||0)-cost;
  setCouple(co);
  const home=JSON.parse(localStorage.getItem('welo_lumi_home')||'{"items":[],"room":"garden"}');
  if(!home.items.includes(itemId)){home.items.push(itemId);}
  localStorage.setItem('welo_lumi_home',JSON.stringify(home));
  showToast(`🎉 ¡Comprado! Lumi está feliz ✨`);
  renderLumiHome();
}
function customizeLumi(p,v){const l=getLumi();l[p]=v;setLumi(l);renderLumiProfile();}
function getLumiHTML(s){return `<div class="welo-mascot ${s||''}">${lumiSVG(getLumi())}</div>`;}
