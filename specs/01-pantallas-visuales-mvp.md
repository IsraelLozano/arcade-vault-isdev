# SPEC 01 — Pantallas visuales del MVP

>- **Status:** Aprobado
>- **Depends on:** ninguna (los estilos del tema ya están en `app/globals.css` y las fuentes en `app/layout.tsx`)
>- **Date:** 2026-10-12
>- **Objective:** Portar a Next.js (App Router, TypeScript, Tailwind v4) las 5 pantallas de `reference/templates/` (Biblioteca, Detalle, Reproductor, Login/Registro y Salón de la Fama) con datos mock, sin implementar ningún juego.

## Por qué existe esta spec

Hoy `app/page.tsx` es el template de `create-next-app`. El diseño ya está resuelto en `reference/templates/` (React vía CDN, SPA con hash). Esta spec lo convierte en la base real del proyecto: rutas reales, componentes tipados y datos mock reemplazables por backend más adelante.

## Alcance

**Dentro:**

- 5 rutas con App Router: `/` (biblioteca), `/juegos/[id]` (detalle), `/jugar/[id]` (reproductor), `/login` (iniciar sesión / crear cuenta), `/salon` (Salón de la Fama).
- Layout compartido: navegación (con menú móvil), contador de créditos decorativo, footer.
- Catálogo mock de 8 juegos y ranking mock determinista, portados de `data.jsx` a TypeScript.
- Sesión fake: el login "entra" con cualquier dato y guarda `{ name }` en `localStorage` (`av_user`); la nav y el Salón muestran el estado logueado / invitado.
- Biblioteca con búsqueda por nombre y filtro por categoría (estado local, sin URL).
- Reproductor con marco CRT, arena decorativa estática, HUD con puntaje/vidas/nivel fijos, botones PAUSA / FIN / SALIR y modal "Fin del juego" con guardado simulado.
- Páginas `not-found` para ids de juego inexistentes.
- Reemplazo del scaffold de `app/page.tsx`.

**Fuera de alcance (specs futuras):**

- Cualquier lógica de juego (game loop, colisiones, input de teclado/táctil, canvas).
- Autenticación real (backend, OAuth Google/GitHub, validación de formularios, recuperación de contraseña).
- Persistencia real de puntajes (el template guarda `av_scores` en `localStorage`; acá **no**).
- Backend, base de datos, API routes.
- Tests automatizados (no hay runner configurado).
- Mejora/cambio del tema visual: los estilos de `app/globals.css` se usan tal cual.
- Internacionalización: todo el texto queda en español.

## Modelo de datos

Archivo nuevo `lib/games.ts` (datos y tipos portados de `reference/templates/data.jsx`):

```ts
type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
type NeonColor = "cyan" | "magenta" | "yellow" | "green";

type Game = {
  id: string;          // slug, ej. "bloque-buster"
  title: string;
  short: string;
  long: string;
  cat: Category;
  cover: string;       // clase CSS existente en globals.css, ej. "cover-bricks"
  color: NeonColor;
  best: number;
  plays: string;       // ya formateado, ej. "12.4K"
};

type ScoreRow = { rank: number; name: string; score: number; date: string }; // date: "DD/MM/2026"

type SessionUser = { name: string }; // localStorage["av_user"], name en mayúsculas, máx. 10 chars
```

Exports: `GAMES: Game[]`, `CATS: ("TODOS" | Category)[]`, `seededScores(seed: number, count?: number): ScoreRow[]`.

Convenciones:

- `seededScores` es determinista (misma semilla → mismas filas) para evitar errores de hidratación; no usa `Math.random`.
- Las semillas son las del template: detalle `id.length * 17 + 3` (10 filas), salón `id.length * 23 + 7` (12 filas).
- Formato de números: `toLocaleString("es-ES")`.

## Plan de implementación

Antes del paso 1: leer en `node_modules/next/dist/docs/` las guías de `01-app/` relevantes (params async en rutas dinámicas, `notFound`, `generateStaticParams`, client components), según `AGENTS.md`. Para la estructura visual de cada componente usar `/frontend-design` (indicado en `CLAUDE.md`) tomando `reference/templates/*.jsx` como referencia.

1. **Datos.** Crear `lib/games.ts` con tipos, `GAMES`, `CATS`, `PLAYERS` y `seededScores`. Verificar con `npm run lint` y `npx tsc --noEmit`.
2. **Sesión.** Crear `components/session-provider.tsx` (client): context con `user`, `login(user | null)`, `signOut()`; lee `av_user` de `localStorage` en un `useEffect` (primer render siempre como invitado) y envuelve lecturas/escrituras en `try/catch`.
3. **Shell.** Crear `components/nav.tsx` (client, menú móvil, link activo con `usePathname`) y `components/footer.tsx`. Modificar `app/layout.tsx`: `SessionProvider` + `Nav` + `<main className="av-main">` + `Footer`, conservando fuentes, `av-bg` y `av-noise`. Resultado: el sitio muestra la nav y el footer sobre el scaffold.
4. **Biblioteca.** Crear `components/game-card.tsx` (client, tilt con el mouse) y `components/library.tsx` (client, búsqueda + chips + estado vacío "NO HAY RESULTADOS"). Reemplazar `app/page.tsx` con hero + `Library`. Click en tarjeta / JUGAR → `/juegos/[id]`.
5. **Detalle.** Crear `app/juegos/[id]/page.tsx` (server, `params` async, `generateStaticParams`, `notFound()`): portada, tags, stats, botones, tabla "MEJORES PUNTUACIONES". Botón JUGAR AHORA → `/jugar/[id]`; VOLVER AL VAULT → `/`.
6. **Reproductor.** Crear `components/game-player.tsx` (client) y `app/jugar/[id]/page.tsx` (server, mismo manejo de `params`/`notFound`). HUD fijo (puntaje `12.450`, vidas 3, nivel `01`), PAUSA/REANUDAR alterna overlay "EN PAUSA", FIN abre el modal, GUARDAR PUNTUACIÓN muestra "PUNTUACIÓN GUARDADA_" sin persistir, JUGAR DE NUEVO cierra el modal, SALIR → `/juegos/[id]`. El nombre del jugador viene de la sesión o `INVITADO`.
7. **Login.** Crear `components/auth-form.tsx` (client) y `app/login/page.tsx`: tabs INICIAR SESIÓN / CREAR CUENTA (el segundo agrega el campo correo), submit llama `login({ name })` (usuario vacío → `PLAYER1`) y navega a `/`; JUGAR COMO INVITADO llama `login(null)` y navega a `/`. Botones Google/GitHub decorativos (`type="button"`, sin acción).
8. **Salón de la Fama.** Crear `components/hall-of-fame.tsx` (client, tabs por juego, podio, tabla, bloque "TU MEJOR MARCA" solo logueado) y `app/salon/page.tsx`. Botón VOLVER A LA BIBLIOTECA → `/`.
9. **Limpieza.** Quitar del scaffold cualquier resto sin uso (`public/next.svg`, `public/vercel.svg` si ya no se referencian) y actualizar `CLAUDE.md` en lo que quede desactualizado ("scaffold sin tocar", sección Stack/estructura).

Cada paso deja `npm run dev` funcionando y es commiteable por separado.

## Criterios de aceptación

- [ ] `npm run lint` termina sin errores ni warnings.
- [ ] `npm run build` termina sin errores y lista las rutas `/`, `/juegos/[id]`, `/jugar/[id]`, `/login`, `/salon`.
- [ ] `/` muestra el hero "ARCADE VAULT" y 8 tarjetas de juego.
- [ ] En `/`, escribir "caí" en el buscador deja solo la tarjeta CAÍDA; elegir la categoría SHOOTER deja INVASORES y ROCAS; una búsqueda sin coincidencias muestra "NO HAY RESULTADOS".
- [ ] Click en una tarjeta navega a `/juegos/<id>` y muestra título, descripción larga, stats y 10 filas de puntuaciones.
- [ ] `/juegos/no-existe` y `/jugar/no-existe` muestran la página 404.
- [ ] En `/jugar/<id>`, PAUSA muestra "EN PAUSA" y el botón pasa a REANUDAR; FIN abre el modal "FIN DEL JUEGO"; GUARDAR PUNTUACIÓN muestra "PUNTUACIÓN GUARDADA_"; SALIR vuelve a `/juegos/<id>`.
- [ ] En `/login`, enviar el formulario con usuario `kai` deja la nav mostrando `KAI ▾` y redirige a `/`; JUGAR COMO INVITADO redirige a `/` con la nav mostrando "Iniciar Sesión".
- [ ] Recargar la página tras iniciar sesión mantiene `KAI ▾` en la nav (persistencia en `localStorage["av_user"]`) y la consola no muestra errores de hidratación.
- [ ] En `/salon`, cambiar de tab actualiza podio y tabla; el bloque "TU MEJOR MARCA" aparece solo con sesión iniciada.
- [ ] En ancho 375px: no hay scroll horizontal, aparece el botón hamburguesa y el panel móvil abre/cierra con sus 3 links.
- [ ] El link activo de la nav se resalta en `/` (también en `/juegos/*` y `/jugar/*` para Biblioteca) y en `/salon`.
- [ ] No queda texto ni logos del template de `create-next-app` en `app/page.tsx`.

## Decisiones

- **Sí:** rutas reales del App Router en vez de la SPA con hash del template. URLs compartibles, aprovecha Server Components y 404 nativo.
- **No:** replicar el template como una sola página client. Pierde las ventajas de Next y complica la migración a datos reales.
- **Sí:** sesión fake con `localStorage` (`av_user`), como el template. Permite revisar los dos estados de la UI (invitado / logueado) sin backend.
- **No:** guardar puntajes en `localStorage` (`av_scores` del template). No hay juego que los genere; se evaluará con el backend.
- **Sí:** reproductor con escena estática y HUD interactivo. Cubre pausa / fin / modal sin introducir lógica de juego ni temporizadores.
- **No:** contador de puntaje aleatorio con `setInterval` del template. Es una simulación de juego, fuera del alcance "solo visual".
- **Sí:** datos mock tipados en `lib/games.ts` con `seededScores` determinista. Fácil de reemplazar por una API y sin errores de hidratación.
- **Sí:** el nombre de la app es **Arcade Vault** (como en repo, README, metadata y templates); "Arcade Ball" en el pedido original se interpretó como el MVP de esta app.
- **Sí:** el estado de búsqueda, filtro y tab del Salón vive en estado local de React, no en la URL. Simplicidad; si se quiere compartir filtros, va en otra spec.
- **Sí:** usar los estilos y clases de `app/globals.css` sin cambios (`.av-nav`, `.card`, `.crt`, `.podium`, etc.) en lugar de reescribirlos en utilidades Tailwind.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Next 16 cambia APIs respecto del conocimiento previo (`params` async, tipos de ruta) | Leer `node_modules/next/dist/docs/` antes de escribir rutas; si TS se queja de `PageProps`/`LayoutProps`, correr `npm run dev` una vez para regenerar tipos. |
| Error de hidratación por leer `localStorage` en el primer render | `SessionProvider` arranca como invitado y lee `localStorage` en `useEffect`; la nav no depende de datos del cliente durante el render inicial. |
| `localStorage` bloqueado (modo privado) | `try/catch` en lecturas y escrituras; la sesión queda solo en memoria. |
| Clases CSS del template no coinciden con `globals.css` | Verificar con la referencia (`reference/templates/styles.css`) clase por clase al maquetar cada pantalla; no modificar `globals.css` salvo bug probado. |

## Qué **no** está en esta spec

- Ningún juego (ni Bloque Buster ni los demás): sin game loop, colisiones ni controles.
- Autenticación real ni OAuth.
- Guardado real de puntuaciones, backend o base de datos.
- Tests automatizados o CI.
- Rediseño del tema o nuevos assets de portada.

Cada uno de esos puntos, si se aborda, va en su propia spec.
