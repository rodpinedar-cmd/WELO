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
