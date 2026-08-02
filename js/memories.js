// WELO — Memories/Recuerdos System

function getMemories() {
  try { return JSON.parse(localStorage.getItem('welo_memories')) || []; } catch { return []; }
}
function setMemories(m) { localStorage.setItem('welo_memories', JSON.stringify(m)); }

// Templates
const memoryTemplates = {
  romantic: { name: 'Cita romántica', bg: 'linear-gradient(135deg,#ff6b9d,#ffd700)', color: '#fff' },
  sunset: { name: 'Atardecer', bg: 'linear-gradient(135deg,#ff9a56,#ff6b9d)', color: '#fff' },
  food: { name: 'Gastronómica', bg: 'linear-gradient(135deg,#2d3436,#636e72)', color: '#fff' },
  adventure: { name: 'Aventura', bg: 'linear-gradient(135deg,#4ecdc4,#2d9b93)', color: '#fff' },
  cozy: { name: 'Momento cozy', bg: 'linear-gradient(135deg,#fef0f5,#ffe8d6)', color: '#2d3436' },
  milestone: { name: 'Logro', bg: 'linear-gradient(135deg,#ffd700,#ff9800)', color: '#fff' },
  anniversary: { name: 'Aniversario', bg: 'linear-gradient(135deg,#ff6b9d,#c44569)', color: '#fff' },
  streak: { name: 'Racha', bg: 'linear-gradient(135deg,#ff5722,#ff9800)', color: '#fff' }
};

const memoryPhrases = [
  'Hoy creamos otro recuerdo juntos.',
  'Otro lugar en nuestra lista.',
  'La mejor compañía.',
  'Pequeños momentos, grandes recuerdos.',
  'Creciendo juntos, un día a la vez.',
  'Somos equipo.',
  'Y los que faltan.'
];

// Prompt to save memory after action
function promptSaveMemory(type, title) {
  const el = document.createElement('div');
  el.id = 'memory-prompt';
  el.style.cssText = 'position:fixed;bottom:80px;left:16px;right:16px;max-width:400px;margin:0 auto;background:white;border-radius:16px;padding:20px;box-shadow:0 8px 32px rgba(0,0,0,0.15);z-index:9998;animation:fadeIn 0.3s;font-family:Inter,sans-serif;';
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <p style="font-size:0.9rem;font-weight:700;">📸 ¿Guardar este momento?</p>
      <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:#aaa;">✕</button>
    </div>
    <p style="font-size:0.82rem;color:#636e72;margin-bottom:14px;">${title}</p>
    <div style="display:flex;gap:8px;">
      <button onclick="openMemoryCreator('${type}','${title.replace(/'/g,"\\'")}')" style="flex:1;padding:10px;background:linear-gradient(135deg,#ff6b9d,#c44569);color:white;border:none;border-radius:10px;font-weight:600;font-size:0.85rem;cursor:pointer;font-family:inherit;">Guardar recuerdo</button>
      <button onclick="this.parentElement.parentElement.remove()" style="flex:1;padding:10px;background:#f5f5f5;border:none;border-radius:10px;font-weight:600;font-size:0.85rem;cursor:pointer;color:#636e72;font-family:inherit;">No ahora</button>
    </div>
  `;
  // Remove after 8s if not interacted
  setTimeout(() => { if(document.getElementById('memory-prompt')) el.remove(); }, 8000);
  document.body.appendChild(el);
}

// Memory creator view
function openMemoryCreator(type, title) {
  const existing = document.getElementById('memory-prompt');
  if(existing) existing.remove();
  
  const phrase = memoryPhrases[Math.floor(Math.random() * memoryPhrases.length)];
  const templates = Object.entries(memoryTemplates);
  
  document.getElementById('app-content').innerHTML = `
    <div class="gradient-header"><h2>📸 Nuevo recuerdo</h2><p>${title}</p></div>
    
    <div class="card">
      <h4 style="font-size:0.85rem;margin-bottom:10px;">Elige un estilo</h4>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;" id="template-selector">
        ${templates.map(([id,t]) => `
          <div onclick="selectTemplate('${id}')" style="height:50px;border-radius:10px;background:${t.bg};cursor:pointer;border:2px solid transparent;display:flex;align-items:center;justify-content:center;" data-tid="${id}">
            <span style="font-size:0.6rem;color:${t.color};font-weight:600;">${t.name}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="card">
      <h4 style="font-size:0.85rem;margin-bottom:10px;">Añade una nota (opcional)</h4>
      <input type="text" id="memory-note" class="input" placeholder="${phrase}" maxlength="140" value="">
      <p style="font-size:0.7rem;color:#aaa;margin-top:4px;">Máx 140 caracteres</p>
    </div>

    <div class="card" style="text-align:center;" id="memory-preview">
      <p style="font-size:0.75rem;color:#aaa;margin-bottom:8px;">Vista previa</p>
      <div id="preview-card" style="width:100%;max-width:300px;margin:0 auto;aspect-ratio:9/16;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#ff6b9d,#ffd700);">
        <p style="font-size:0.7rem;opacity:0.8;color:white;">📸 Espacio para foto</p>
        <p style="font-size:1.1rem;font-weight:700;color:white;margin:16px 0 4px;">${title}</p>
        <p style="font-size:0.8rem;color:white;opacity:0.9;font-style:italic;" id="preview-note">"${phrase}"</p>
        <p style="font-size:0.7rem;color:white;opacity:0.6;margin-top:12px;">${today()} • Barcelona</p>
        <p style="font-size:0.6rem;color:white;opacity:0.4;margin-top:8px;">— WELO</p>
      </div>
    </div>

    <div class="card">
      <div style="display:flex;gap:4px;align-items:center;margin-bottom:12px;">
        <input type="checkbox" id="include-logo" checked>
        <label for="include-logo" style="font-size:0.75rem;color:#636e72;">Incluir "WELO" en la card</label>
      </div>
      <div style="display:flex;gap:4px;align-items:center;">
        <input type="checkbox" id="include-date" checked>
        <label for="include-date" style="font-size:0.75rem;color:#636e72;">Incluir fecha</label>
      </div>
    </div>

    <button class="btn-primary" onclick="saveMemory('${type}','${title.replace(/'/g,"\\'")}')">💾 Guardar en álbum</button>
    <button class="btn-primary" style="background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);margin-top:8px;" onclick="shareMemory('${title.replace(/'/g,"\\'")}')">📲 Compartir</button>
    <button class="btn-ghost" onclick="renderHome();renderLumiCorner('home');">← Volver sin guardar</button>
  `;
  // Select first template by default
  selectTemplate('romantic');
}

let selectedTemplate = 'romantic';
function selectTemplate(id) {
  selectedTemplate = id;
  document.querySelectorAll('#template-selector > div').forEach(d => {
    d.style.borderColor = d.dataset.tid === id ? '#ff6b9d' : 'transparent';
  });
  const t = memoryTemplates[id];
  document.getElementById('preview-card').style.background = t.bg;
}

function saveMemory(type, title) {
  const note = document.getElementById('memory-note').value || memoryPhrases[Math.floor(Math.random()*memoryPhrases.length)];
  const memories = getMemories();
  memories.push({
    id: 'rec_' + Date.now(),
    type: type,
    title: title,
    note: note,
    date: today(),
    template: selectedTemplate,
    shared: false
  });
  setMemories(memories);
  addXP(5);
  addGlow(3);
  showToast('📸 Recuerdo guardado • +5 XP +3 GLOW');
  
  // Check memory badges
  if(memories.length === 1) showToast('🏅 Badge: Primer recuerdo 📸');
  if(memories.length === 10) showToast('🏅 Badge: 10 recuerdos ✨');
  
  renderHome(); renderLumiCorner('home');
}

function shareMemory(title) {
  const note = document.getElementById('memory-note').value || memoryPhrases[Math.floor(Math.random()*memoryPhrases.length)];
  const text = `${note}\n\n📍 Barcelona • ${today()}\n\n— via WELO\n#WELO #RecuerdosDePareja`;
  
  if(navigator.share) {
    navigator.share({ title: title, text: text }).then(() => {
      addGlow(5);
      showToast('📲 Compartido • +5 GLOW');
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => showToast('📋 Texto copiado para compartir'));
  }
  
  // Also save
  saveMemory('shared', title);
}

// Album view
function renderAlbum() {
  const memories = getMemories();
  let html = `<div class="gradient-header"><h2>📸 Álbum</h2><p>${memories.length} recuerdos guardados</p></div>`;
  
  if(!memories.length) {
    html += `<div class="card" style="text-align:center;padding:40px 20px;">
      <p style="font-size:2rem;margin-bottom:12px;">📸</p>
      <p style="font-size:0.9rem;color:#636e72;">Aún no tienes recuerdos.</p>
      <p style="font-size:0.8rem;color:#aaa;margin-top:8px;">Completa un reto o plan y guarda el momento.</p>
    </div>`;
  } else {
    // Stats
    html += `<div class="card" style="display:flex;justify-content:space-around;text-align:center;">
      <div><p style="font-size:1.3rem;font-weight:800;color:#ff6b9d;">${memories.length}</p><p style="font-size:0.7rem;color:#636e72;">Recuerdos</p></div>
      <div><p style="font-size:1.3rem;font-weight:800;color:#ff6b9d;">${memories.filter(m=>m.shared).length}</p><p style="font-size:0.7rem;color:#636e72;">Compartidos</p></div>
      <div><p style="font-size:1.3rem;font-weight:800;color:#ff6b9d;">${[...new Set(memories.map(m=>m.date.slice(0,7)))].length}</p><p style="font-size:0.7rem;color:#636e72;">Meses</p></div>
    </div>`;
    
    // Timeline
    const byMonth = {};
    memories.forEach(m => {
      const key = m.date.slice(0, 7);
      if(!byMonth[key]) byMonth[key] = [];
      byMonth[key].push(m);
    });
    
    Object.entries(byMonth).sort((a,b) => b[0].localeCompare(a[0])).forEach(([month, mems]) => {
      const [y, mo] = month.split('-');
      const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      html += `<p style="font-size:0.75rem;font-weight:700;color:#636e72;text-transform:uppercase;letter-spacing:1px;margin:20px 0 8px;">${monthNames[parseInt(mo)-1]} ${y}</p>`;
      mems.reverse().forEach(m => {
        const t = memoryTemplates[m.template] || memoryTemplates.romantic;
        html += `<div class="card" style="padding:14px;display:flex;gap:12px;align-items:center;">
          <div style="width:44px;height:44px;border-radius:10px;background:${t.bg};flex-shrink:0;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:0.6rem;color:${t.color};">📸</span>
          </div>
          <div style="flex:1;min-width:0;">
            <p style="font-size:0.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.title}</p>
            <p style="font-size:0.75rem;color:#aaa;">${m.date}${m.note ? ' • "'+m.note.slice(0,30)+'..."' : ''}</p>
          </div>
        </div>`;
      });
    });
  }
  
  html += `<button class="btn-ghost" onclick="renderHome();renderLumiCorner('home');">← Volver</button>`;
  document.getElementById('app-content').innerHTML = html;
}
