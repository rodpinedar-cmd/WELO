# WELO — SEO Page Template

Standard de calidad obligatorio para todas las páginas públicas del sitio web de WELO.

---

## 1. Estructura SEO

| Elemento | Requisito |
|----------|-----------|
| `<title>` | 50-60 caracteres. Keyword principal + beneficio + "| WELO" |
| `<meta description>` | 120-160 caracteres. Incluir keyword, beneficio claro, call to action implícito |
| `<link rel="canonical">` | URL completa con base `https://rodpinedar-cmd.github.io/WELO/` |
| `<html lang="es">` | Siempre español |
| H1 | Uno solo por página. Incluye keyword principal. |
| H2 | Secciones principales (3-8 por página). Keywords secundarias. |
| H3 | Subsecciones dentro de cada H2. |
| Jerarquía | H1 → H2 → H3. Sin saltos (no H1 → H3 directo). |

---

## 2. Open Graph y Twitter Cards

Obligatorio en TODAS las páginas:

```html
<meta property="og:title" content="[mismo que title o versión corta]">
<meta property="og:description" content="[mismo que meta description o versión corta]">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:image" content="[URL imagen 1200x630]">
<meta property="og:url" content="[URL canonical]">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[mismo que og:title]">
<meta name="twitter:description" content="[mismo que og:description]">
<meta name="twitter:image" content="[mismo que og:image]">
```

---

## 3. Schema.org

Elegir según tipo de contenido:

| Tipo de página | Schema recomendado |
|---------------|-------------------|
| Herramienta/calculadora | `WebApplication` |
| Test/quiz interactivo | `Quiz` con `hasPart` |
| Lista de items | `ItemList` con `ListItem` |
| Guía/artículo educativo | `Article` |
| Preguntas frecuentes | `FAQPage` con `Question/Answer` |
| Instrucciones paso a paso | `HowTo` |

Reglas:
- `numberOfItems` debe coincidir con el contenido real.
- Incluir `provider` con nombre "WELO" y URL.
- No inventar datos (ratings, reviews) que no existan.

---

## 4. CTAs estándar

Mínimo 2 CTAs por página, máximo 3:

| Posición | Cuándo aparece | Texto tipo |
|----------|---------------|-----------|
| Mid-content | Después de sección 2 o 3 (cuando el usuario ya recibió valor) | Relacionado con lo que acaba de leer |
| Bottom | Final del contenido, antes del footer | Genérico de WELO |

Reglas para CTAs:
- Solo prometer funciones que WELO realmente tiene.
- Incluir `onclick` con PostHog tracking.
- Estilo: gradiente rosa, botón redondeado, texto blanco.
- Texto del botón: "Probar WELO gratis →"

---

## 5. Tracking PostHog

Obligatorio en `<head>`:

```html
<script>!function(t,e){...posthog snippet...}posthog.init('phc_ye8DtzRMohohkrpM5nS2AmjE8tMGCwfmQ7v3ZuzDbx8f',{api_host:'https://eu.i.posthog.com',persistence:'localStorage',autocapture:false});</script>
```

CTAs deben incluir:
```html
onclick="if(window.posthog)posthog.capture('cta_clicked',{page:'[page-id]',position:'[mid/bottom]',destination:'app'})"
```

---

## 6. Enlaces internos

| Tipo | Mínimo | Ubicación |
|------|--------|-----------|
| Contextuales | 4 links | Dentro del contenido o sección "También te puede interesar" |
| Footer | 11 links | Bloque estándar de herramientas WELO |
| Nav | 2 links | Logo → landing.html, CTA → index.html |

Reglas:
- Solo enlazar a páginas que EXISTEN.
- Priorizar páginas temáticamente relacionadas.
- No duplicar el mismo enlace más de 2 veces en la página.

---

## 7. Accesibilidad

| Elemento | Requisito |
|----------|-----------|
| Heading hierarchy | H1 → H2 → H3 sin saltos |
| Imágenes | `alt` descriptivo obligatorio. Hero puede ser decorativa (`alt=""`) |
| Navegación | `role="navigation"` + `aria-label` en nav por categorías |
| Contraste | Texto principal (#2d3436) sobre fondo claro (#fef0f5): ratio ≥ 4.5:1 |
| Touch targets | Botones y links mín 44x44px en mobile |
| Formularios | `<label>` asociado a cada `<input>` |
| Idioma | `<html lang="es">` |

---

## 8. Rendimiento

| Elemento | Requisito |
|----------|-----------|
| Imágenes | `loading="lazy"` en todas EXCEPTO la primera (LCP) |
| Google Fonts | `display=swap` obligatorio |
| CSS | Un solo bloque `<style>` en `<head>`. Inline. |
| JavaScript | Solo PostHog (async). Sin JS custom salvo que sea necesario para la funcionalidad. |
| Tamaño | Página < 100KB HTML |
| Sin recursos bloqueantes | No cargar scripts síncronos externos |

---

## 9. Estilo visual (consistencia)

| Elemento | Valor |
|----------|-------|
| Font | Inter (Google Fonts) |
| Color primario | #ff6b9d |
| Color secundario | #c44569 |
| Fondo | #fef0f5 |
| Cards | white, border-radius 16px, shadow 0 2px 12px rgba(0,0,0,0.04) |
| Botón CTA | Gradiente 135deg pink→dark-pink, radius 50px, font-weight 700 |
| Max-width contenido | 750px |
| Responsive breakpoint | 600px |

---

## 10. Contenido

| Requisito | Detalle |
|-----------|---------|
| Cumplir promesa del título | Si dice "30 juegos", debe haber 30 |
| No afirmaciones sin respaldo | Citar fuentes cuando se mencione investigación |
| Sin contenido genérico | Cada pieza debe aportar valor práctico inmediato |
| Tono | Cercano, directo, adulto. No infantil ni condescendiente. |
| Sin datos inventados | No fabricar estadísticas, ratings ni reviews |
| Aviso médico | Páginas de salud deben incluir disclaimer de que no sustituyen consejo profesional |

---

## 11. Checklist de validación pre-commit

| # | Check | ✅ |
|---|-------|---|
| 1 | Title 50-60 chars con keyword | |
| 2 | Description 120-160 chars | |
| 3 | Un solo H1 | |
| 4 | Jerarquía H1→H2→H3 sin saltos | |
| 5 | Canonical presente y correcto | |
| 6 | OG completo (title, desc, type, locale, image, url) | |
| 7 | Twitter Cards completo (card, title, desc, image) | |
| 8 | Schema.org válido y coherente con contenido | |
| 9 | PostHog snippet presente | |
| 10 | CTAs con tracking onclick | |
| 11 | Sin enlaces a páginas inexistentes | |
| 12 | Min 4 enlaces internos contextuales | |
| 13 | Footer con 11 herramientas | |
| 14 | Promesa del título cumplida | |
| 15 | Sin afirmaciones sin fuente | |
| 16 | CSS consolidado (1 bloque) | |
| 17 | Google Fonts con display=swap | |
| 18 | Lazy loading en imágenes off-screen | |
| 19 | Mobile responsive (breakpoint 600px) | |
| 20 | HTML sin errores (diagnostics = 0) | |
| 21 | Sitemap actualizado | |

---

## 12. Criterios de aceptación

- P0 = 0
- P1 = 0
- Lighthouse SEO ≥ 95
- Lighthouse Accessibility ≥ 90
- Sin enlaces rotos
- Schema válido en Google Rich Results Test
- OG preview correcto en social debuggers
