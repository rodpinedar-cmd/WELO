# 🧪 TEST: Match Diario — 5 Parejas

---

## PAREJA 1: Ana (24) & Hugo (26) — Primer Match Diario

### Ella abre a las 13:00:
- Ve card en Home: "💕 Match Diario — ¡5 preguntas!"
- Toca → pantalla con 5 preguntas
- ✅ Funciona: pills de opciones visibles, seleccionables
- Responde en 25 segundos:
  1. ¿Qué se te antoja? → 🍣 Sushi
  2. ¿Para tomar? → 🍷 Vino
  3. ¿Qué plan? → 🌅 Atardecer
  4. ¿Mood de hoy? → 🥰 Romántico
  5. ¿Qué necesitas? → 🤗 Abrazo
- Tap "Ver matches →"
- Ve: "⏳ Esperando a tu pareja"
- ✅ Sus respuestas se muestran abajo
- ✅ Botón "📲 Recordar a mi pareja" funciona
- +10 XP ganados

### Él abre a las 19:00:
- Ve card: "💕 Match Diario — ¡5 preguntas!"
- Responde:
  1. 🍣 Sushi ← MATCH
  2. 🍺 Cerveza
  3. 🎬 Peli
  4. 🥰 Romántico ← MATCH
  5. 🤗 Abrazo ← MATCH
- Ve resultados: **60% match (3/5)**
- ✅ Lado a lado con ✅/❌ visual
- ✅ Mensaje: "¡Buena conexión! Muchas coincidencias 💕"

### ❌ BUG ENCONTRADO:
- Como ambos usan el MISMO dispositivo/browser (sin backend), cuando él responde, SOBREESCRIBE las respuestas de ella en localStorage
- El `dm.todayRole` se guarda pero `dm.week` push funciona — sin embargo la comparación busca `partnerRole` que no existe en el mismo browser
- **RESULTADO:** En el mismo dispositivo, no se pueden comparar. Solo funciona si cada uno tiene su propio navegador/dispositivo.

### ⚠️ WORKAROUND actual:
- Si ambos usan el MISMO teléfono: responden JUNTOS viendo la pantalla, ven matches al instante
- Si cada uno tiene su móvil: funciona correctamente (localStorage separado por device)

### VEREDICTO: La mecánica engancha mucho (25 seg para responder), pero sin backend la comparación solo funciona en devices separados.

---

## PAREJA 2: Laura (29) & Marc (31) — Día 3 de Match Diario

### Día 1: Él responde, ella no. → Él ve "Esperando..."
### Día 2: Ambos responden (devices separados):
- Match 40% (2/5). Mensaje: "Algunos matches — la variedad es buena"
- ✅ Se genera conversación: "¿En serio querías pizza? Yo pensé en sushi"

### Día 3:
- Preguntas del día diferentes (seed funciona ✅)
- Ella: 🏖 Playa / 🍹 Cóctel / ☀️ Aire libre / 😌 Tranquilo / 😊 Bien
- Él: 🏖 Playa / 🍺 Cerveza / ☀️ Aire libre / 😌 Tranquilo / ⚡ Energía
- **Match: 60% (3/5)** — coinciden en playa + outdoor + tranquilo
- ✅ Resultado claro visualmente

### ⚠️ FALTA:
- No hay historial visible de matches pasados (solo se acumula en `dm.week` pero no se muestra)
- No hay "racha de matches" ni "tu mejor día fue X%"

---

## PAREJA 3: Carlos & Diana — Match desde misma app (presencial)

### Usan el MISMO teléfono juntos:
- Ella responde primero → ve "Esperando"
- Le pasa el teléfono a él → él responde
- ❌ **PROBLEMA:** Como el `profile.role` es fijo (ella se registró como "ella"), cuando él intenta responder desde el mismo device, el sistema lo detecta como "ella" respondiendo de nuevo
- ❌ No funciona para uso presencial en 1 solo device

### SOLUCIÓN PROPUESTA:
- Añadir botón "Turno de mi pareja" que cambia el rol temporalmente para la respuesta
- O: Modo "Juntos" donde se muestra una pregunta a la vez y AMBOS señalan su respuesta

---

## PAREJA 4: Irene (32) & Dani (33) — La cita semanal

### Después de 5 días de matches:
- Sus coincidencias acumuladas: sushi (3 veces), naturaleza (2), relax (2), vino (2)
- ✅ Aparece la sección "🎯 Tu cita de la semana"
- Sugerencia generada: "Cena en un restaurante que ambos quieren probar 🍽"
- ✅ Es relevante (ambos eligieron sushi muchas veces)
- ✅ Botón "¡La hicimos!" da XP

### ⚠️ OBSERVACIÓN:
- La sugerencia es genérica ("un restaurante") — no recomienda uno ESPECÍFICO de Barcelona
- Podría conectarse con el motor de Plans para sugerir un lugar real con link

---

## PAREJA 5: Sofía (25) & Marco (26) — Power users, día 7

### Lo que aman:
- ✅ Es RÁPIDO (30 seg)
- ✅ Genera conversación ("¿Por qué elegiste aventura?")
- ✅ La card en Home es visible y atractiva (borde rosa, prominente)
- ✅ Después de responder, la card cambia a "✅ Match completado" (no molesta más)
- ✅ +10 XP por completar (engancha)

### Lo que falta:
- ❌ No pueden ver historial de la semana (matches de días anteriores)
- ❌ No hay gráfica de "% match por día" (evolución)
- ❌ La cita semanal podría tener MÁS detalle (lugar específico, hora sugerida, link de reserva)
- ❌ No hay opción de "repetir match" si quieren volver a hacerlo juntos por diversión

### Lo que comparten:
- Screenshot del resultado "80% match" → stories IG
- ⚠️ **FALTA:** Botón "Compartir resultado" con card bonita como en recuerdos

---

## RESUMEN DE BUGS Y MEJORAS

### 🔴 CRÍTICO:
1. **Mismo dispositivo no funciona para comparar** — El role está fijo. Si ambos usan 1 teléfono, no hay forma de que "él" responda desde la cuenta de "ella".

### SOLUCIÓN INMEDIATA (sin backend):
Agregar un **"Modo juntos"** donde:
- Se muestra 1 pregunta a la vez
- Ambos eligen al mismo tiempo (2 columns: "Ella" | "Él")
- Se ven los matches AL INSTANTE en la misma pantalla

### 🟡 MEJORAS:
2. Historial semanal visible (matches de cada día)
3. Botón "Compartir resultado" con card visual
4. Cita semanal más específica (conectar con Plans reales)
5. Gráfica de compatibilidad semanal

### ✅ LO QUE FUNCIONA PERFECTO:
- Preguntas cambian cada día (seed)
- 30 seg para completar (ultra rápido)
- +10 XP motiva
- Card en Home es prominente y clara
- Mensajes de resultado adaptativos (80% vs 40%)
- Genera conversación real

---

## IMPLEMENTAR: Modo "Juntos" (1 device)
