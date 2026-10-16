"use server";

import { Resend } from "resend";
import { validateContact, type ContactInput, type ContactState } from "@/lib/contact";

const GENERIC_ERROR = "No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos.";

export async function sendContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values: ContactInput = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };

  // Honeypot: un bot llena el campo oculto; se responde éxito sin enviar.
  if (String(formData.get("website") ?? "") !== "") {
    return { status: "success", name: values.name };
  }

  const invalid = validateContact(values);
  if (invalid) return { status: "error", message: invalid, values };

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    console.error("[contact] Faltan RESEND_API_KEY, CONTACT_TO_EMAIL o CONTACT_FROM_EMAIL");
    return { status: "error", message: GENERIC_ERROR, values };
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: values.email,
      subject: `[Arcade Vault] Mensaje de ${values.name.replace(/[\r\n]+/g, " ")}`,
      text: `Nombre: ${values.name}\nCorreo: ${values.email}\n\n${values.message}`,
    });
    if (error) {
      console.error("[contact] Resend respondió con error:", error);
      return { status: "error", message: GENERIC_ERROR, values };
    }
  } catch (err) {
    console.error("[contact] Falló el envío:", err);
    return { status: "error", message: GENERIC_ERROR, values };
  }

  return { status: "success", name: values.name };
}
