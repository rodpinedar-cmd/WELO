# 🧪 TEST ROUND 3 — Versión LIVE (GitHub Pages)
## 10 parejas probando https://rodpinedar-cmd.github.io/WELO/

---

### TEST 1 — Ana (24) escanea QR desde PC de su novio
**Flujo:** Ve landing en PC → escanea QR → abre app en iPhone
- ✅ QR se ve en el hero (imagen API)
- ✅ Al escanear abre la app en Safari
- ✅ Onboarding se ve bien en móvil
- ✅ Registra como "Ella", pone ciclo, obtiene código
- ❌ **BUG:** El código WLO-XXXX se genera pero NO hay forma de compartirlo por WhatsApp fácilmente — el botón "📋 Copiar" usa clipboard API que NO funciona en todos los mobiles Safari
- ❌ **BUG:** Después de registrarse, si recarga la página, la app se ve bien PERO Lumi no se renderiza en el onboarding (SVG vacío) porque lumiSVG se ejecuta antes de que mascot.js cargue
- ⚠️ **UX:** No hay "volver atrás" en el onboarding si se equivoca de rol
- **FIXES NECESARIOS:** 
  - Fallback si clipboard no funciona (seleccionar texto)
  - Botón "Compartir por WhatsApp" con link `whatsapp://send?text=Mi código WELO: WLO-XXXX`

---

### TEST 2 — Hugo (25) recibe código, intenta conectar
**Flujo:** Ella le manda código → él abre link → registra como "Él"
- ✅ Selecciona "Él" → tema azul se activa
- ✅ Pone código WLO-XXXX → entra
- ⚠️ **REALIDAD:** El código no verifica nada (no hay backend). Puede poner cualquier cosa.
- ✅ Home se carga con contenido para él (insights, tips)
- ✅ 20 GLOW de bienvenida
- ✅ Racha empieza en 1
- **Veredicto:** Funciona, pero la conexión de pareja es ficticia sin backend.

---

### TEST 3 — Laura (29) — Explora el Home día 1
**Flujo:** Registrada → Home → scroll
- ✅ Header con stats visible
- ✅ Misiones 0/3 con barra de progreso
- ✅ Mensaje del día (bonito, no invasivo)
- ✅ Reto del día claro y accionable
- ✅ Pregunta del día con opción responder
- ❌ **PROBLEMA:** El ciclo solo aparece si eres "ella". Si eres "él" no ves nada de ciclo en el Home — se siente vacío
- ❌ **FALTA:** Para "él" no hay card de "qué fase tiene ella" en el Home (solo en tab Ciclo)
- ✅ Reconocimiento visible
- ✅ Dato curioso + acceso blog
- ✅ Streak + badges + álbum compacto abajo
- **FIX:** Agregar mini-card para él en Home: "Ella está en Fase X — tip rápido"

---

### TEST 4 — Marc (30) — Tab Plans
**Flujo:** Nav → Plans
- ✅ Lumi dice frase de recomendación
- ✅ Filtro por mood funciona
- ✅ Cards de planes con info completa
- ❌ **BUG:** Si no ha llenado gustos (tab Gustos), `getRecommendedPlans` devuelve planes en orden aleatorio, no recomendado — la frase de Lumi dice "Llena tus gustos para que recomiende mejor" pero no hay link directo a Gustos desde ahí
- ❌ **FALTA:** "📍 Ver dónde" → al expandir, el link de Google Maps se abre en nueva pestaña pero en MÓVIL abre Google Maps app directamente (bien) — sin embargo en escritorio abre una tab vacía si no tienes Google Maps
- ✅ "✅ Lo hicimos" funciona, da XP
- ✅ Memory prompt aparece
- **FIX:** Agregar botón "⚙️ Configura gustos" en Plans cuando no hay preferencias

---

### TEST 5 — Carla (26) — Tab Juegos
**Flujo:** Nav → Juegos → Verdad o Reto
- ✅ Lista de juegos clara con descripciones
- ✅ Selector de intensidad visible
- ❌ **BUG:** Al elegir intensidad, los botones NO filtran las preguntas/retos. El `tdLevel` variable se setea pero `showTruth()` y `showDare()` siguen usando el pool completo sin filtrar por nivel.
- ✅ Preguntas son variadas (pool de 30)
- ✅ +5 XP por responder
- ❌ **FALTA:** No hay indicador de "cuántas has hecho" ni "cuántas quedan"
- **FIX:** Implementar el filtro real por nivel (asignar nivel a cada truth/dare)

---

### TEST 6 — Pablo (28) — Swipe Pelis
**Flujo:** Juegos → Noche de Pelis → Reír
- ✅ Filtro por mood funciona
- ✅ Sistema de swipe por turnos
- ❌ **PROBLEMA UX:** En móvil, los botones 👍👎 son círculos pero NO hay swipe gesture real — solo botones. Se siente como "elegir" no como "swipear"
- ✅ Matches se detectan correctamente
- ✅ Añadir a watchlist funciona
- ❌ **FALTA:** Pool de pelis para "reír" es solo 7 — se acaba rápido
- ✅ Agregar peli propia funciona
- **FIX:** Agregar más pelis por categoría (al menos 15 por mood)

---

### TEST 7 — Diana (27) — Tab Ciclo (Calendario)
**Flujo:** Nav → Ciclo
- ✅ Info de fase COMPLETA (energía, fertilidad, tips, evitar)
- ✅ Navegación de meses ← → funciona
- ✅ Calendario visual con colores
- ✅ Síntomas esperados como chips
- ✅ Historial últimos 7 días
- ✅ Mood log con 8 opciones
- ❌ **BUG VISUAL:** En móvil el calendario grid (7 columnas) a veces los números se aprietan y no se leen bien en pantallas < 360px
- ❌ **FALTA:** No hay forma de marcar "hoy empezó mi periodo" (actualizar fecha de último periodo desde la app)
- **FIX:** Agregar botón "🩸 Empezó mi periodo" que actualice lastPeriodStart

---

### TEST 8 — Sergio (31) — Tab Gustos (Preferencias)
**Flujo:** Nav → Gustos
- ✅ Categorías claras (comida, música, deporte, hobbies, vibes)
- ✅ Pills seleccionables con feedback visual
- ✅ Budget selector funciona
- ❌ **FALTA:** No hay confirmación de que se guardó (no hay toast ni feedback)
- ❌ **FALTA:** La sección "Coincidencias de pareja" solo aparece si AMBOS llenaron gustos — pero sin backend, no hay forma de que ambos llenen
- ❌ **UX:** Las pills son muchas (12 por categoría × 5 categorías = 60 opciones). Se siente overwhelming. Mejor empezar con "elige tu TOP 3" en vez de todo
- **FIX:** Toast "✅ Guardado" al seleccionar + limitar a "elige hasta 5 por categoría"

---

### TEST 9 — Eva (25) — Perfil de Lumi + Casa
**Flujo:** Home → tap Lumi → Perfil → Casa
- ✅ Lumi se renderiza con SVG correcto
- ✅ Frase contextual aparece
- ✅ Stats (hambre/energía) visibles
- ✅ Alimentar/jugar funciona, da feedback
- ✅ Casa carga con rooms y tienda
- ❌ **BUG:** Al comprar un item (🌱 Planta, 5 GLOW), el GLOW se resta pero la página se recarga y la compra no se refleja inmediatamente — hay un lag visual
- ❌ **FALTA:** Los items en la casa son solo emojis sueltos, no tienen posición/diseño — se ve como una fila de emojis random
- ✅ Rooms locked se ven con opacity
- **FIX:** Mejorar layout de items en la casa (grid posicionado, no solo flex wrap)

---

### TEST 10 — Ambos juntos — Flujo completo día 1 a día 3
**Flujo:** Registro → día 1 → día 2 → día 3

**Día 1:**
- Registro OK. 20 GLOW. Racha 1. Misiones generadas.
- Completan reto (+15 XP). Misión 1/3.
- Registran mood (+5 XP). Misión 2/3.
- Juegan Verdad o Reto (+5 XP). Si "juego" es misión → 3/3!
- Cofre: "+7 GLOW". Total GLOW: 27.
- Alimentan Lumi. Guardan recuerdo del primer día.
- **Total día 1: ~45 XP, 27 GLOW, 1 recuerdo.**

**Día 2:**
- Abren app. Racha sube a 2. Nuevas misiones.
- ❌ **BUG:** Las misiones son IGUALES que ayer (misma seed si dayOfYear es consecutivo). El random no cambia suficiente.
- Reto nuevo ✅ (pool de 30 sí varía).
- Pregunta nueva ✅ (pool de 25 varía).
- Exploran Plans. Hacen un plan. Guardan recuerdo.
- **Total día 2: ~50 XP, +3 GLOW del recuerdo.**

**Día 3:**
- Racha 3 → Multiplicador x1.5 activo.
- ❌ **BUG:** El toast de multiplicador aparece EN CADA acción que da XP, no solo la primera. Se vuelve spam.
- Lumi tiene menos hambre (85 → 70 si no la alimentaron ayer — bien).
- Prueban Swipe Pelis. Match con 2 pelis. Añaden a watchlist.
- **Total día 3: ~60 XP (con x1.5).**

**Veredicto general:** Funcional, enganchante los 3 primeros días. Los bugs son menores pero el de misiones repetidas y toast spam molestan.

---

## RESUMEN DE BUGS Y FIXES

### 🔴 CRÍTICOS (rompen experiencia):
1. **Misiones se repiten** — El randomizer usa Math.random sin seed diaria diferente. Necesita shuffle basado en fecha.
2. **Verdad/Reto no filtra por nivel** — Los botones Suave/Medio/Spicy no hacen nada real.
3. **Toast multiplier spam** — Aparece en CADA addXP. Debería ser solo 1 vez al día.

### 🟡 IMPORTANTES:
4. Clipboard "Copiar código" falla en Safari iOS — agregar fallback WhatsApp
5. No hay "volver atrás" en onboarding
6. Para "él" el Home no muestra fase de ella
7. No hay "Empezó mi periodo" en calendario
8. Gustos sin confirmación visual
9. Plans sin link a Gustos cuando no hay preferencias
10. Items de casa sin layout visual (solo emojis en fila)

### 🟢 MINOR:
11. Calendario grid apretado en móviles <360px
12. Más pelis por mood necesarias
13. Preferencias overwhelming (60 opciones)

---

## FIXES A IMPLEMENTAR AHORA
