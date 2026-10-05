import "server-only";
import { Resend } from "resend";

// Sends a new contact message to CONTACT_TO_EMAIL through Resend.
// Until your domain is verified in Resend, mail can only come from onboarding@resend.dev and go
// to the address you signed up to Resend with. CONTACT_FROM_EMAIL changes the sender later.
const FROM = process.env.CONTACT_FROM_EMAIL || "Titan Wave Media <onboarding@resend.dev>";

let resend = null;

// With EMAIL_LOG_ONLY=1 (while checks run) nothing is sent: the message is only saved.
export function emailReady() {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL && process.env.EMAIL_LOG_ONLY !== "1");
}

export async function sendContactEmail(m) {
  if (!emailReady()) return { skipped: true };
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  const details = [
    `Name: ${m.name}`,
    `Email: ${m.email}`,
    `Needs: ${m.need}`,
    m.channel && `Answers on: ${m.channel}`,
    m.rows && `Size: ${m.rows}`,
    m.product && `Product: ${m.product}`,
    `Came from: ${m.source}`,
  ].filter(Boolean);
  const { error } = await resend.emails.send({
    from: FROM,
    to: [process.env.CONTACT_TO_EMAIL],
    replyTo: m.email,
    subject: `New message from ${m.name} (${m.need})`,
    text: [...details, "", m.message].join("\n"),
  });
  if (error) throw new Error(`Resend: ${error.name || "error"}: ${error.message || ""}`);
  return { sent: true };
}
