# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Qué es esto

**Arcade Vault**: plataforma para jugar arcades online y competir por puntaje (ver `README.md`). Hoy es la capa visual (SPEC 01 y 02) más el formulario de contacto (SPEC 03): 6 pantallas portadas de `reference/templates/` y `reference/home-about/` con datos mock y sesión fake en `localStorage`. No hay juegos ni auth real; el único backend es la Server Action que envía el contacto por Resend.

Estructura:
- Rutas (`app/`): `/` home (landing), `/biblioteca` biblioteca, `/juegos/[id]` detalle, `/jugar/[id]` reproductor, `/login`, `/salon`, `/acerca` (Acerca de + contacto).
- `components/`: UI; los que usan estado o `localStorage` son client components (`session-provider`, `nav`, `library`, `game-card`, `game-player`, `auth-form`, `hall-of-fame`, `home/reveal`, `about/contact-form`). `components/home/` agrupa las piezas de la landing y `components/about/` las de `/acerca`.
- `lib/games.ts`: tipos, catálogo mock (`GAMES`, `CATS`) y `seededScores` (determinista, sin `Math.random`).
- `lib/home.ts`: tipos y constantes mock de la home (beneficios, stats, actividad, top, precios, FAQ).
- `lib/contact.ts`: tipos (`ContactInput`, `ContactState`), `CONTACT_LIMITS` y `validateContact`, compartidos por cliente y servidor. `app/acerca/actions.ts` es la Server Action `sendContact` (Resend, honeypot `website`, `Reply-To` del usuario).
- `reference/templates/`: diseño original (React por CDN), solo referencia; ESLint lo ignora.

Vive dentro del repo de capacitación `arcanoid/` pero es **un proyecto aparte**: carpeta `arcade-vault/` sin trackear en el git del padre (no es submódulo, no tiene git propio). El `CLAUDE.md` del padre (`../CLAUDE.md`) describe el juego Arkanoid y el flujo spec-driven; no aplica al código de acá.

## Stack

- **Next.js 16.3.4** (App Router) + **React 19.2.8** + **TypeScript 5** en modo `strict`.
- **Tailwind CSS v4** vía `@tailwindcss/postcss` (config CSS-first en `app/globals.css` con `@import "tailwindcss"` y `@theme inline`; **no hay `tailwind.config`**).
- Sin framework de tests ni CI. Única dep de runtime extra: `resend`. Fuentes: `next/font/google` (Geist).

## Skills
- Usa siempre /frontend-design para guiar la estructura y el diseño de los componentes de la interfaz de usuario.


No hay runner de tests configurado.

## Cosas no obvias

- **Variables de entorno (contacto).** `.env.local` (ignorado) define `RESEND_API_KEY`, `CONTACT_TO_EMAIL` y `CONTACT_FROM_EMAIL`; plantilla en `.env.example`. Con el remitente sandbox `onboarding@resend.dev`, Resend solo entrega al correo de la cuenta, así que `CONTACT_TO_EMAIL` debe ser ese correo. La key solo se lee en `app/acerca/actions.ts` (sin `NEXT_PUBLIC_`).
- **Next 16 tiene breaking changes respecto al conocimiento de entrenamiento.** Antes de escribir código de Next, leer la guía correspondiente en `node_modules/next/dist/docs/` (`01-app/`, `03-architecture/`, `index.md`). Esto lo pide `AGENTS.md`, que es legítimo: lo regenera `next dev` (ver `node_modules/next/dist/server/lib/generate-agent-files.js`). No borrar ese bloque de `AGENTS.md`; si aparece en un diff, commitearlo junto al trabajo.
- **Tipos de rutas autogenerados.** `next dev`/`next build` escriben `.next/types/` y `.next/dev/types/`, y de ahí salen globals como `LayoutProps<"/">` (usado en `app/layout.tsx`). Si TS se queja de esos tipos, correr `npm run dev` una vez para regenerarlos. `next-env.d.ts` está gitignoreado.
- **Alias de imports:** `@/*` → raíz del proyecto (`tsconfig.json` `paths`).
- ESLint extiende `eslint-config-next` (`core-web-vitals` + `typescript`) y re-ignora `.next/`, `out/`, `build/`, `next-env.d.ts`.

## Flujo de trabajo

Según `README.md`, el desarrollo es spec-driven con las skills `/spec` y `/spec-impl` de `Klerith/fernando-skills` (instaladas en el repo padre `arcanoid/`, no acá). Todavía no hay carpeta `specs/` en este proyecto.
