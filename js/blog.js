// WELO — Blog Module

const blogData = [
  {title:'Las 4 fases de tu ciclo',cat:'ciclo',preview:'Tu cuerpo cambia cada semana. Entiéndelo.'},
  {title:'Cólicos: 8 remedios naturales',cat:'ciclo',preview:'Calor, jengibre, magnesio y más.'},
  {title:'Los 5 lenguajes del amor',cat:'pareja',preview:'No todos amamos igual. Descubre el tuyo.'},
  {title:'Los 4 Jinetes de Gottman',cat:'pareja',preview:'Patrones que destruyen relaciones.'},
  {title:'Skincare según tu ciclo',cat:'belleza',preview:'Tu piel cambia cada semana.'},
  {title:'Cycle Syncing: entrena por fase',cat:'fitness',preview:'No todos los días son iguales.'},
  {title:'Nutrición por fase',cat:'nutricion',preview:'Tu cuerpo pide cosas diferentes cada semana.'},
  {title:'Ansiedad premenstrual',cat:'mental',preview:'No es imaginación: es química.'},
  {title:'Testosterona natural',cat:'mens',preview:'Cómo optimizarla sin suplementos caros.'},
  {title:'Ser mejor pareja (para él)',cat:'mens',preview:'Inteligencia emocional masculina.'}
];

const dailyFacts = [
  "El útero genera la misma presión que una serpiente constrictora 🐍",
  "Las parejas que ríen juntas 1x/día duran 40% más 😂",
  "Abrazo 20seg = oxitocina para bajar presión arterial 🤗",
  "90% de serotonina se produce en el intestino 🥗",
  "Parejas que dicen 'nosotros': -33% conflictos 👫",
  "Mirar 4min a los ojos reactiva el enamoramiento 👁️",
  "Chocolate oscuro = magnesio que relaja el útero 🍫",
  "Las parejas que entrenan juntas: +67% satisfacción 🏋️",
  "Decir 'gracias' diario: +35% satisfacción 🙏",
  "El enamoramiento activa las mismas zonas que la cocaína 🧪"
];

function renderBlog() {
  const fact = dailyFacts[dayOfYear() % dailyFacts.length];
  
  let html = `<div class="gradient-header"><h2>📖 Blog</h2><p>Datos y bienestar</p></div>`;
  
  // Daily fact
  html += `<div class="card" style="border-left:4px solid var(--glow);">
    <h4 style="font-size:0.8rem;color:var(--secondary);margin-bottom:6px;">💡 Dato del día</h4>
    <p id="blog-fact" style="font-size:0.9rem;line-height:1.5;">${fact}</p>
    <button class="btn-ghost" style="font-size:0.75rem;" onclick="document.getElementById('blog-fact').textContent=dailyFacts[Math.floor(Math.random()*dailyFacts.length)]">🔄 Otro dato</button>
  </div>`;
  
  // Articles
  html += `<p style="font-size:0.7rem;color:var(--text-light);text-transform:uppercase;letter-spacing:1px;margin:16px 0 8px;">📚 Artículos</p>`;
  blogData.forEach(a => {
    html += `<div class="card" onclick="openArticle('${a.title}')">
      <h4 style="font-size:0.9rem;margin-bottom:4px;">${a.title}</h4>
      <p style="font-size:0.8rem;color:var(--text-light);">${a.preview}</p>
      <span style="font-size:0.7rem;color:var(--primary);">${a.cat}</span>
    </div>`;
  });
  
  // Podcasts
  html += `<p style="font-size:0.7rem;color:var(--text-light);text-transform:uppercase;letter-spacing:1px;margin:16px 0 8px;">🎙️ Podcasts</p>`;
  html += `<div class="card">
    <a href="https://open.spotify.com/show/4PzSMdHFLGhMsQziKBbBT3" target="_blank" style="display:block;padding:8px 0;color:var(--text);">
      <b>Where Should We Begin?</b> — Esther Perel<br><span style="font-size:0.8rem;color:var(--text-light);">Sesiones reales de terapia de pareja</span>
    </a>
    <a href="https://open.spotify.com/show/79CkJF3UJTHFV8Dse3Oy0P" target="_blank" style="display:block;padding:8px 0;border-top:1px solid #f0f0f0;color:var(--text);">
      <b>Huberman Lab</b><br><span style="font-size:0.8rem;color:var(--text-light);">Neurociencia: sueño, hormonas, relaciones</span>
    </a>
    <a href="https://open.spotify.com/show/0TJB1CF3kB5NnhsIbZjCJR" target="_blank" style="display:block;padding:8px 0;border-top:1px solid #f0f0f0;color:var(--text);">
      <b>Entiende Tu Mente</b><br><span style="font-size:0.8rem;color:var(--text-light);">Psicología en español</span>
    </a>
  </div>`;
  
  document.getElementById('app-content').innerHTML = html;
}

function openArticle(title) {
  // Try to find in articles.js (if loaded)
  const mapping = {'Las 4 fases de tu ciclo':'ciclo-1','Cólicos: 8 remedios naturales':'ciclo-4','Los 5 lenguajes del amor':'pareja-1','Los 4 Jinetes de Gottman':'pareja-2','Skincare según tu ciclo':'belleza-1','Cycle Syncing: entrena por fase':'deporte-1','Nutrición por fase':'nutri-1','Ansiedad premenstrual':'mental-1','Testosterona natural':'mens-1','Ser mejor pareja (para él)':'mens-2'};
  const id = mapping[title];
  if(typeof A !== 'undefined' && id && A[id]) {
    document.getElementById('app-content').innerHTML = `
      <div class="card">
        <button class="btn-ghost" onclick="renderBlog()">← Volver</button>
        <h2 style="font-size:1.3rem;margin:12px 0;">${A[id].t}</h2>
        <div style="color:var(--text-light);line-height:1.7;font-size:0.9rem;">${A[id].b}</div>
      </div>`;
    completeMission('leer');
  } else {
    document.getElementById('app-content').innerHTML = `
      <div class="card">
        <button class="btn-ghost" onclick="renderBlog()">← Volver</button>
        <h2 style="font-size:1.3rem;margin:12px 0;">${title}</h2>
        <p style="color:var(--text-light);line-height:1.6;">Artículo completo disponible en la biblioteca.</p>
        <a href="biblioteca.html" target="_blank" class="btn-primary" style="display:block;text-align:center;margin-top:16px;">📚 Ver en Biblioteca</a>
      </div>`;
  }
}
