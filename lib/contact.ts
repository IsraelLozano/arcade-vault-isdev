export type ContactInput = { name: string; email: string; message: string };

export type ContactState =
  | { status: "idle" }
  | { status: "success"; name: string }
  | { status: "error"; message: string; values: ContactInput };

export const CONTACT_LIMITS = {
  name: { min: 1, max: 80 },
  email: { min: 1, max: 254 },
  message: { min: 1, max: 2000 },
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(input: ContactInput): string | null {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name || !email || !message) return "Completa todos los campos.";
  if (name.length > CONTACT_LIMITS.name.max)
    return `El nombre no puede superar ${CONTACT_LIMITS.name.max} caracteres.`;
  if (email.length > CONTACT_LIMITS.email.max || !EMAIL_RE.test(email))
    return "Ingresa un correo electrónico válido.";
  if (message.length > CONTACT_LIMITS.message.max)
    return `El mensaje no puede superar ${CONTACT_LIMITS.message.max} caracteres.`;
  return null;
}
