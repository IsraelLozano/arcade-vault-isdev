# SPEC 02 — Homepage (landing)

>- **Status:** Aprobado
>- **Depends on:** SPEC 01
>- **Date:** 2026-10-14
>- **Objective:** Implementar la landing page en `/` portada de `reference/home-about/home-about/home.jsx` y mover la biblioteca actual a `/biblioteca`.

## Por qué existe esta spec

Hoy `/` es la biblioteca (SPEC 01). El nuevo diseño en `reference/home-about/` agrega una landing de marketing (hero, beneficios, juegos, stats, actividad, precios/FAQ, CTA final) y reubica la biblioteca como una sección aparte, como en el template (Inicio / Biblioteca). Eso cambia rutas, nav y CSS global, por eso va en una spec propia.

## Alcance

**Dentro:**

- Nueva home en `/` con las 7 secciones de `home.jsx`: hero con siluetas flotantes, "¿POR QUÉ ARCADE VAULT?", "JUEGOS DISPONIBLES AHORA", stats, "ACTIVIDAD EN VIVO", "PRECIOS" (plan + FAQ) y CTA final.
- Mover la biblioteca de `/` a `/biblioteca` (mismo contenido: hero actual + `Library`).
- Nav: agregar link "Inicio" (`/`) en la barra y en el panel móvil; "Biblioteca" apunta a `/biblioteca`.
- Actualizar los links que apuntaban a `/` como biblioteca (VOLVER AL VAULT en detalle, VOLVER A LA BIBLIOTECA en salón, etc.).
- Anexar a `app/globals.css` el CSS de la home portado de `reference/home-about/home-about/styles.css` (bloques `HOME PAGE` líneas ~930-1070 y `ACTIVITY` / `PRICING` ~1621-1744), sin modificar reglas existentes.
- Datos mock de la home en `lib/home.ts`; el rail de juegos usa `GAMES.slice(0, 6)` de `lib/games.ts`.
- Animación reveal-on-scroll (IntersectionObserver) y siluetas SVG decorativas.
- CTAs "CREAR CUENTA" y "EMPEZAR GRATIS" → `/login`, siempre visibles (con o sin sesión).
- Actualizar `CLAUDE.md` del repo (rutas y componentes).

**Fuera de alcance (specs futuras):**

- Página "Acerca de" y formulario de contacto (`about.jsx`): sin ruta `/acerca` ni link en la nav.
- Gamepad virtual y variantes de tema del `styles.css` de reference (líneas ~1151-1620).
- Datos reales (puntuaciones en vivo, stats, ranking): todo es mock estático.
- CTAs que cambien según la sesión.
- Editar SPEC 01 (queda como registro histórico).
- Tests automatizados.
- Cambios a las pantallas existentes más allá de links y nav.

## Modelo de datos

Archivo nuevo `lib/home.ts` (datos portados de `home.jsx`):

```ts
type NeonColor = "cyan" | "magenta" | "yellow" | "green"; // reutilizar el de lib/games.ts

type Feature = { icon: "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET"; title: string; desc: string; color: NeonColor };
type Stat = { n: string; unit: string; sub: string };
type RecentScore = { player: string; game: string; score: number; ago: string; color: NeonColor };
type TopPlayer = { rank: number; player: string; score: number };
type Faq = { q: string; a: string };
```

Exports: `FEATURES: Feature[]` (4), `STATS: Stat[]` (3), `RECENT_SCORES: RecentScore[]` (7), `TOP_PLAYERS: TopPlayer[]` (5), `FAQS: Faq[]` (3), `PLAN_FEATURES: string[]` (6).

Convenciones:

- Valores idénticos a `home.jsx`; no se usa `Math.random` ni fechas dinámicas (evita errores de hidratación).
- Números con `toLocaleString("es-ES")`.
- `NeonColor` se importa de `lib/games.ts` (si hoy no está exportado, exportarlo; no duplicarlo).

## Plan de implementación

Antes del paso 1: leer en `node_modules/next/dist/docs/` las guías de `01-app/` relevantes (layouts/pages, `Link`, client components), según `AGENTS.md`. Para la estructura visual usar `/frontend-design` (indicado en `CLAUDE.md`) tomando `reference/home-about/home-about/home.jsx` como referencia.

1. **Mover la biblioteca.** Crear `app/biblioteca/page.tsx` con el contenido actual de `app/page.tsx` (hero + `Library`). Cambiar en `components/nav.tsx` el link "Biblioteca" a `/biblioteca` y `isLibraryPath` a `/biblioteca`, `/juegos*`, `/jugar*`; actualizar los links a `/` de detalle, reproductor y salón. `/` sigue sirviendo la biblioteca hasta el paso 5.
2. **Datos.** Crear `lib/home.ts` con tipos y constantes. Verificar con `npm run lint` y `npx tsc --noEmit`.
3. **CSS.** Anexar al final de `app/globals.css` los bloques de home, actividad y precios del reference. Verificar clase por clase contra `reference/home-about/home-about/styles.css`; no tocar reglas existentes.
4. **Componentes.** Crear en `components/home/`: `floating-silhouettes.tsx` (server, 8 SVG), `feature-icon.tsx` (server), `reveal.tsx` (client, wrapper con IntersectionObserver que agrega la clase `in`; si no hay `IntersectionObserver` o `prefers-reduced-motion`, muestra el contenido sin animar) y `mini-card.tsx` (server, `Link` a `/juegos/[id]`).
5. **Home.** Reemplazar `app/page.tsx` por la landing (server component) armando las 7 secciones con los componentes y datos anteriores. Botones: EXPLORAR JUEGOS / VER TODOS LOS JUEGOS / INSERTAR MONEDA → `/biblioteca`; CREAR CUENTA / EMPEZAR GRATIS → `/login`; VER SALÓN → `/salon`.
6. **Nav.** Agregar "Inicio" (`/`, activo solo en `pathname === "/"`) en la barra y en el panel móvil. Quitar `/` de `isLibraryPath`.
7. **Docs.** Actualizar `CLAUDE.md` (rutas: `/` home, `/biblioteca`; carpeta `components/home/`; `lib/home.ts`).

Cada paso deja `npm run dev` funcionando y es commiteable por separado.

## Criterios de aceptación

- [ ] `npm run lint` termina sin errores ni warnings.
- [ ] `npm run build` termina sin errores y lista las rutas `/`, `/biblioteca`, `/juegos/[id]`, `/jugar/[id]`, `/login`, `/salon`.
- [ ] `/` muestra el título "EL ARCADE CLÁSICO ESTÁ DE VUELTA" y las secciones `// 01` a `// 04` más el CTA final "¿LISTO PARA JUGAR?".
- [ ] `/` muestra 4 tarjetas de beneficio, 6 mini-tarjetas de juego (los primeros 6 de `GAMES`), 3 bloques de stats, 7 filas de últimas puntuaciones y 5 de top jugadores.
- [ ] Click en una mini-tarjeta navega a `/juegos/<id>` del juego correspondiente.
- [ ] EXPLORAR JUEGOS, VER TODOS LOS JUEGOS e INSERTAR MONEDA navegan a `/biblioteca`; CREAR CUENTA y EMPEZAR GRATIS navegan a `/login`; VER SALÓN navega a `/salon`.
- [ ] `/biblioteca` muestra el hero "ARCADE VAULT" y 8 tarjetas; la búsqueda y el filtro por categoría funcionan igual que en SPEC 01.
- [ ] La nav muestra Inicio / Biblioteca / Salón de la Fama (barra y panel móvil); Inicio se resalta solo en `/`; Biblioteca se resalta en `/biblioteca`, `/juegos/*` y `/jugar/*`.
- [ ] Los links VOLVER (detalle, salón) llevan a `/biblioteca` o a la ruta que corresponda; ningún link interno deja de funcionar.
- [ ] Al hacer scroll, las secciones con `.reveal` reciben la clase `in`; con `prefers-reduced-motion: reduce` el contenido es visible sin animación.
- [ ] Con sesión iniciada (`KAI ▾`) la home sigue mostrando los CTAs a `/login` y la consola no muestra errores de hidratación.
- [ ] En ancho 375px no hay scroll horizontal en `/`.
- [ ] Las reglas de `app/globals.css` previas al bloque anexado no cambian (el diff solo agrega líneas).
- [ ] `CLAUDE.md` describe `/` como home y `/biblioteca` como biblioteca.

## Decisiones

- **Sí:** home en `/` y biblioteca en `/biblioteca`. Replica la estructura del template y deja `/` como puerta de entrada.
- **No:** dejar la biblioteca en `/` y la home en otra ruta. Contradice el pedido de "homepage".
- **Sí:** solo la home; "Acerca de" y contacto quedan afuera. El pedido fue la homepage y about añade un formulario con estado propio (otra spec).
- **Sí:** datos mock en `lib/home.ts` tipados. Fáciles de reemplazar por una API y separados del catálogo.
- **No:** arrays inline en los componentes. Mezclan contenido y presentación.
- **Sí:** anexar CSS a `app/globals.css` sin tocar lo existente. Mantiene el enfoque CSS-first de SPEC 01; esta spec reabre solo la regla "no modificar globals.css" para agregar, no para cambiar.
- **No:** archivo CSS aparte. Parte los estilos en dos lugares sin ganancia real.
- **Sí:** home como Server Component, con un único client component (`Reveal`) para la animación. Minimiza JS en cliente.
- **Sí:** CTAs de registro siempre visibles, sin depender de la sesión. Evita client components y riesgos de hidratación; igual que el template.
- **No:** editar SPEC 01. Está aprobada y es histórica; los cambios de ruta se documentan acá y en `CLAUDE.md`.
- **No:** portar el gamepad virtual ni las variantes de tema de `styles.css`. No pertenecen a la home.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Mover la biblioteca rompe links a `/` en otras pantallas | Paso 1 busca todas las referencias a `"/"` con grep y las actualiza antes de reemplazar `app/page.tsx`. |
| CSS anexado pisa reglas existentes por selectores repetidos (`.btn`, `.kicker`, `.fade-in`) | Portar solo los bloques de home/actividad/precios; antes de anexar, comparar selectores con `globals.css` y omitir duplicados idénticos. |
| `.reveal` deja contenido invisible si JS falla o no hidrata | `Reveal` agrega `in` también cuando no existe `IntersectionObserver` o hay `prefers-reduced-motion`; verificar visibilidad con JS deshabilitado en la revisión. |
| Next 16 cambia APIs respecto del conocimiento previo | Leer `node_modules/next/dist/docs/` antes de escribir código, según `AGENTS.md`. |

## Qué **no** está en esta spec

- Página "Acerca de" ni formulario de contacto.
- Gamepad virtual, variantes de tema o cualquier otro bloque de `styles.css` fuera de la home.
- Datos reales, backend o actualización en vivo de actividad y ranking.
- CTAs dependientes de la sesión.
- Tests automatizados.

Cada uno de esos puntos, si se aborda, va en su propia spec.
