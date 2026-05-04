// src/lib/email.ts
//
// Cliente de email basado en Resend (https://resend.com).
// Si RESEND_API_KEY no está configurado, sendEmail() es no-op silencioso
// (devuelve false), permitiendo que el sistema funcione sin email durante
// desarrollo. La notificación in-app SIEMPRE se crea.
//
// Para activar el envío real:
//   1. Crear cuenta en https://resend.com
//   2. Verificar dominio (ej. uao.edu.co o subdominio que controles)
//   3. .env: RESEND_API_KEY="re_xxxxxxxxxxxxx"
//   4. .env: EMAIL_FROM="Reservas UAO <reservas@uao.edu.co>"

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

const FROM = process.env.EMAIL_FROM ?? 'Reservas UAO <onboarding@resend.dev>';
const API_KEY = process.env.RESEND_API_KEY;

/**
 * Envía un email via Resend HTTP API.
 * Devuelve true si fue enviado, false si está deshabilitado o falló.
 * NUNCA throws — si quieres saber si falló, mira el valor de retorno.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!API_KEY) {
    console.log(`[email:disabled] would send to ${payload.to}: ${payload.subject}`);
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Resend ${res.status}: ${body.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[email] fetch failed:', e);
    return false;
  }
}

export const emailEnabled = !!API_KEY;
