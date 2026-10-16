# SPEC 03 — Acerca de y contacto con Resend

>- **Status:** Aprobado
>- **Depends on:** SPEC 01, SPEC 02
>- **Date:** 2026-10-14
>- **Objective:** Implementar la página `/acerca` portada de `reference/home-about/home-about/about.jsx` y enviar por Resend, mediante una Server Action, el mensaje de su formulario de contacto.

## Por qué existe esta spec

SPEC 02 dejó fuera "Acerca de" y el formulario de contacto porque este tiene estado propio. Además es la primera funcionalidad con backend real del proyecto: introduce una dependencia (`resend`), variables de entorno y una acción de servidor. Por eso va en una spec aparte.

## Alcance

**Dentro:**

- Ruta `/acerca` con las secciones de `about.jsx`: hero "ACERCA DE ARCADE VAULT" con misión y 3 highlights, divisor de píxeles y sección "CONTÁCTANOS" (intro con 3 tips + formulario).
- Diseño idéntico al template: mismos textos, iconos SVG (`HEART`, `BROWSER`, `PLANT`), clases y animaciones.
- Link "Acerca de" (`/acerca`) en la nav, en la barra y en el panel móvil, como en `nav.jsx` del reference.
- Formulario con campos NOMBRE, CORREO ELECTRÓNICO y MENSAJE, y el botón "▶ ENVIAR MENSAJE".
- Envío con **Server Action** (`app/acerca/actions.ts`) usando el SDK `resend`.
- Validación en cliente (los campos vacíos hacen shake, como el template) y en servidor (obligatoria).
- Estados del formulario: reposo, enviando (botón deshabilitado), éxito (terminal `VAULT-OS // TERMINAL` solo si Resend confirma) y error (mensaje inline, datos conservados y shake).
- `Reply-To` con el correo del usuario.
- Honeypot anti-spam: campo oculto; si llega lleno se responde éxito sin enviar nada.
- Variables de entorno: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. Se documentan en `.env.example`; `.env*` ya está en `.gitignore`.
- Reveal-on-scroll con el `Reveal` existente de `components/home/reveal.tsx`.
- Anexar a `app/globals.css` el CSS de about/contacto de `styles.css` (líneas ~1071-1147), sin modificar reglas existentes.
- Actualizar `CLAUDE.md` (ruta, componentes, variables de entorno).

**Fuera de alcance (specs futuras):**

- Autorespuesta de confirmación al usuario.
- Rate limit por IP o CAPTCHA.
- Dominio propio verificado en Resend (se usa la sandbox).
- Guardar los mensajes en base de datos o panel de administración.
- Plantilla de correo HTML elaborada (el correo es texto plano).
- Tests automatizados.
- Gamepad virtual y variantes de tema de `styles.css`.
- Cambios a otras pantallas más allá de la nav.

## Modelo de datos

Archivo nuevo `lib/contact.ts` (tipos y validación compartidos entre cliente y servidor):

```ts
type ContactInput = { name: string; email: string; message: string };

type ContactState =
  | { status: "idle" }
  | { status: "success"; name: string }
  | { status: "error"; message: string; values: ContactInput };
```

Exports: `ContactInput`, `ContactState`, `CONTACT_LIMITS` y `validateContact(input): string | null` (devuelve el mensaje de error o `null`).

Convenciones:

- Límites: `name` 1-80 caracteres, `email` con formato válido y hasta 254, `message` 1-2000, todos tras `trim()`.
- Honeypot: campo `website` en el `FormData`; no forma parte de `ContactInput`.
- Remitente: `CONTACT_FROM_EMAIL=onboarding@resend.dev` (sandbox, ver Decisiones).
- Destinatario: `CONTACT_TO_EMAIL` con el correo de la cuenta de Resend (`danielitolozano85@gmail.com`).
- Asunto: `[Arcade Vault] Mensaje de <name>`. Cuerpo en texto plano con nombre, correo y mensaje.
- No hay persistencia de mensajes ni nuevas claves de `localStorage`.

## Plan de implementación

Antes del paso 1: leer en `node_modules/next/dist/docs/01-app/` las guías de Server Actions / formularios, `useActionState` y variables de entorno, según `AGENTS.md`. Para la estructura visual usar `/frontend-design` (indicado en `CLAUDE.md`) tomando `about.jsx` como referencia.

1. **Dependencia y entorno.** `npm install resend`. Crear `.env.example` con las 3 variables y poner los valores reales en `.env.local` (no versionado). Verificar con `npm run lint`.
2. **Datos y validación.** Crear `lib/contact.ts` con tipos, límites y `validateContact`.
3. **CSS.** Anexar al final de `app/globals.css` los bloques `ABOUT PAGE` y `terminal-success`/`term-*` (con `shake`, `pxblink` y `.btn.press:active`). Antes de anexar, comparar selectores con lo existente y omitir los duplicados idénticos (`.field`, `blink`). No tocar reglas previas.
4. **Server Action.** Crear `app/acerca/actions.ts` (`"use server"`) con `sendContact(prev, formData): Promise<ContactState>`: lee el honeypot, valida con `validateContact`, envía con `resend.emails.send` (`from`, `to`, `replyTo`, `subject`, `text`) y devuelve `success` o `error`. Si falta `RESEND_API_KEY` o Resend responde error, devuelve `error` con un mensaje genérico y registra el detalle solo en el log del servidor.
5. **Componentes.** Crear en `components/about/`: `highlight-icon.tsx` (server, 3 SVG) y `contact-form.tsx` (client, `useActionState`, shake en vacíos, mensaje de error, terminal de éxito con "ENVIAR OTRO MENSAJE").
6. **Página.** Crear `app/acerca/page.tsx` (server component) con hero, divisor y sección de contacto, envolviendo divisor y contacto con `Reveal`. Metadata con título "Acerca de".
7. **Nav.** Agregar "Acerca de" (`/acerca`, activo en `pathname === "/acerca"`) en la barra y en el panel móvil de `components/nav.tsx`.
8. **Docs.** Actualizar `CLAUDE.md` (ruta `/acerca`, carpeta `components/about/`, `lib/contact.ts`, variables de entorno y que ya hay un backend mínimo).

Cada paso deja `npm run dev` funcionando y es commiteable por separado.

## Criterios de aceptación

- [ ] `npm run lint` termina sin errores ni warnings.
- [ ] `npm run build` termina sin errores y lista las rutas `/`, `/biblioteca`, `/acerca`, `/juegos/[id]`, `/jugar/[id]`, `/login`, `/salon`.
- [ ] `/acerca` muestra "ACERCA DE ARCADE VAULT", la misión, 3 highlights, el divisor de píxeles, "CONTÁCTANOS" y 3 tips, con los textos de `about.jsx`.
- [ ] La nav muestra Inicio / Biblioteca / Salón de la Fama / Acerca de (barra y panel móvil); "Acerca de" se resalta solo en `/acerca`.
- [ ] Enviar con algún campo vacío no llama a la Server Action, aplica shake y no cambia de estado.
- [ ] Enviar con un correo de formato inválido muestra un mensaje de error inline y conserva los valores escritos.
- [ ] Con datos válidos y claves correctas, llega un correo a `CONTACT_TO_EMAIL` con asunto `[Arcade Vault] Mensaje de <name>`, y al responderlo el destinatario es el correo del usuario (`Reply-To`).
- [ ] Tras un envío exitoso aparece la terminal `VAULT-OS // TERMINAL` con "GRACIAS, <NOMBRE EN MAYÚSCULAS>"; "ENVIAR OTRO MENSAJE" vuelve al formulario vacío.
- [ ] Con `RESEND_API_KEY` inválida o ausente no aparece la terminal de éxito: se muestra un mensaje de error, el formulario conserva los datos y el botón vuelve a estar habilitado.
- [ ] Con el honeypot `website` lleno no se envía ningún correo, aunque la UI muestre éxito.
- [ ] Durante el envío el botón queda deshabilitado, por lo que un doble click no envía dos correos.
- [ ] `RESEND_API_KEY` no aparece en el bundle del cliente (búsqueda en `.next/static` sin resultados) ni en el repo (`.env.local` ignorado, `.env.example` sin valores reales).
- [ ] Con `prefers-reduced-motion: reduce` el contenido de `/acerca` es visible sin animación.
- [ ] En ancho 375px no hay scroll horizontal en `/acerca`.
- [ ] Las reglas de `app/globals.css` previas al bloque anexado no cambian (el diff solo agrega líneas).
- [ ] `CLAUDE.md` describe `/acerca`, `components/about/`, `lib/contact.ts` y las variables de entorno.

## Decisiones

- **Sí:** Server Action. Evita un endpoint público extra y se integra con `useActionState`; el único consumidor es este formulario.
- **No:** Route Handler `/api/contacto`. Más código (fetch, parseo, estados manuales) sin otro cliente que lo necesite.
- **Sí:** remitente sandbox `onboarding@resend.dev` con destino al correo de la cuenta de Resend. No exige dominio y alcanza para el MVP; Resend solo entrega a ese correo en sandbox.
- **No:** dominio propio verificado. Requiere DNS y es una tarea de despliegue, no de esta spec.
- **Sí:** remitente y destinatario por variables de entorno. Cambiar a un dominio propio no toca código.
- **Sí:** validación también en servidor. La del cliente es solo comodidad y se puede saltar.
- **Sí:** el éxito se muestra solo si Resend confirma. El template simula el envío; acá no se puede decir "MENSAJE RECIBIDO" sin que sea cierto.
- **Sí:** mensaje de error genérico al usuario, detalle solo en el log. No filtra información de la API.
- **Sí:** `Reply-To` con el correo del usuario. Permite responder desde el correo sin copiar la dirección.
- **Sí:** honeypot. Sin dependencias ni fricción para el usuario.
- **No:** autorespuesta. El template promete "SIN SPAM" y la sandbox no permite enviar a terceros.
- **No:** rate limit ni CAPTCHA. Requieren almacenamiento externo; se revisa si aparece abuso real.
- **Sí:** correo en texto plano. Evita HTML con riesgo de inyección y no aporta valor al equipo.
- **Sí:** reutilizar `Reveal` de SPEC 02 en vez de duplicar el `IntersectionObserver` de `about.jsx`.
- **Sí:** anexar CSS a `globals.css` sin tocar lo existente, igual que SPEC 02.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| La sandbox de Resend rechaza destinatarios distintos al de la cuenta | `CONTACT_TO_EMAIL` debe ser el correo de la cuenta; se documenta en `.env.example` y `CLAUDE.md`. |
| La API key se filtra al cliente o al repo | Solo se lee en `actions.ts` (servidor), sin prefijo `NEXT_PUBLIC_`; `.env*` está ignorado y se verifica en los criterios. |
| El formulario se usa para spam o abuso de la cuota de Resend | Honeypot y límites de longitud; rate limit queda como spec futura si hay abuso. |
| Resend no responde o tarda | El botón se deshabilita mientras envía y el error es recuperable sin perder lo escrito. |
| CSS anexado pisa reglas existentes (`.field`, `.btn`, `blink`) | Comparar selectores antes de anexar y omitir duplicados idénticos. |
| Next 16 cambia APIs de Server Actions respecto del conocimiento previo | Leer `node_modules/next/dist/docs/` antes de escribir código, según `AGENTS.md`. |

## Qué **no** está en esta spec

- Autorespuesta al usuario.
- Rate limit, CAPTCHA o cualquier anti-abuso más allá del honeypot.
- Dominio propio verificado en Resend.
- Guardar mensajes o panel de administración.
- Correo en HTML con plantilla.
- Tests automatizados.
- Gamepad virtual, variantes de tema o cualquier otro bloque de `styles.css` fuera de about/contacto.

Cada uno de esos puntos, si se aborda, va en su propia spec.
