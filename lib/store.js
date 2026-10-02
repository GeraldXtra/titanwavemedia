import "server-only";
import { getSupabase } from "./supabase";
import { emailReady, sendContactEmail } from "./email";
import { redactText } from "./redact";

// Saves a message from the contact form (or one the assistant collected) and emails it.
// With no database and no email set up, the message is written to the server log instead,
// so nothing is lost while the keys are being added.
// Returns true when the message was kept somewhere.
export async function keepMessage(m) {
  const db = getSupabase();
  const jobs = [];
  if (db) {
    jobs.push(
      db
        .from("messages")
        .insert({
          name: m.name,
          email: m.email,
          need: m.need,
          channel: m.channel || null,
          rows: m.rows || null,
          product: m.product || null,
          message: m.message,
          source: m.source,
        })
        .then(({ error }) => {
          if (error) throw new Error(`Supabase: ${error.message}`);
        })
    );
  }
  if (emailReady()) jobs.push(sendContactEmail(m));

  if (!jobs.length) {
    console.log("[contact] New message (no database or email set up yet):", JSON.stringify(m));
    return true;
  }
  const results = await Promise.allSettled(jobs);
  const failed = results.filter((r) => r.status === "rejected");
  failed.forEach((r) => console.error("[contact]", r.reason && r.reason.message ? r.reason.message : r.reason));
  if (failed.length === results.length) {
    // Nothing worked: keep it in the server log as a last resort, and tell the visitor.
    console.error("[contact] Could not save or email this message:", JSON.stringify(m));
    return false;
  }
  return true;
}

// Adds an email to the "tell me when it launches" list. One row per email.
export async function keepNotify(email, source) {
  const db = getSupabase();
  if (!db) {
    console.log("[notify] New sign up (no database set up yet):", email, source);
    return true;
  }
  const { error } = await db.from("notify_list").upsert({ email, source }, { onConflict: "email", ignoreDuplicates: true });
  if (error) {
    console.error("[notify] Supabase:", error.message);
    return false;
  }
  return true;
}

// Saves one turn of an assistant conversation, with personal details taken out first.
export async function keepChatTurn(sessionId, turns) {
  const db = getSupabase();
  if (!db) return;
  const rows = turns.map((t) => ({ session_id: sessionId, role: t.role, content: redactText(t.content) }));
  const { error } = await db.from("chat_logs").insert(rows);
  if (error) console.error("[chat] Could not save the conversation:", error.message);
}
