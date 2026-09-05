# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Qué es esto

**Arcade Vault**: plataforma para jugar arcades online y competir por puntaje (ver `README.md`). Hoy es un scaffold de `create-next-app` sin tocar: `app/page.tsx` y `app/layout.tsx` siguen siendo el template por defecto (título "Create Next App", logos de Vercel). No hay lógica de negocio todavía.

Vive dentro del repo de capacitación `arcanoid/` pero es **un proyecto aparte**: carpeta `arcade-vault/` sin trackear en el git del padre (no es submódulo, no tiene git propio). El `CLAUDE.md` del padre (`../CLAUDE.md`) describe el juego Arkanoid y el flujo spec-driven; no aplica al código de acá.

## Stack

- **Next.js 16.3.4** (App Router) + **React 19.2.8** + **TypeScript 5** en modo `strict`.
- **Tailwind CSS v4** vía `@tailwindcss/postcss` (config CSS-first en `app/globals.css` con `@import "tailwindcss"` y `@theme inline`; **no hay `tailwind.config`**).
- Sin framework de tests, sin CI, sin otras deps. Fuentes: `next/font/google` (Geist).

## Comandos

```
npm run dev      # next dev (Turbopack), http://localhost:3000
npm run build    # next build
npm run start     # next start (requiere build previo)
npm run lint     # eslint (flat config, eslint.config.mjs)
```

No hay runner de tests configurado.

## Cosas no obvias

- **Next 16 tiene breaking changes respecto al conocimiento de entrenamiento.** Antes de escribir código de Next, leer la guía correspondiente en `node_modules/next/dist/docs/` (`01-app/`, `03-architecture/`, `index.md`). Esto lo pide `AGENTS.md`, que es legítimo: lo regenera `next dev` (ver `node_modules/next/dist/server/lib/generate-agent-files.js`). No borrar ese bloque de `AGENTS.md`; si aparece en un diff, commitearlo junto al trabajo.
- **Tipos de rutas autogenerados.** `next dev`/`next build` escriben `.next/types/` y `.next/dev/types/`, y de ahí salen globals como `LayoutProps<"/">` (usado en `app/layout.tsx`). Si TS se queja de esos tipos, correr `npm run dev` una vez para regenerarlos. `next-env.d.ts` está gitignoreado.
- **Alias de imports:** `@/*` → raíz del proyecto (`tsconfig.json` `paths`).
- ESLint extiende `eslint-config-next` (`core-web-vitals` + `typescript`) y re-ignora `.next/`, `out/`, `build/`, `next-env.d.ts`.

## Flujo de trabajo

Según `README.md`, el desarrollo es spec-driven con las skills `/spec` y `/spec-impl` de `Klerith/fernando-skills` (instaladas en el repo padre `arcanoid/`, no acá). Todavía no hay carpeta `specs/` en este proyecto.
