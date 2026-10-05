import "server-only";
import { cache } from "react";
import { getAdmin } from "./supabase";
import { createUserClient } from "./supabaseUser";
import { accountsReady, ownerEmail } from "./accounts";
import { describeAgent, sha256 } from "./security";
import { sendEmail } from "./mail";
import { siteUrl } from "./seo";
import { lagosDayTime } from "./format";
import { format } from "./text";
import copy from "@/content/console/signin";

// Sign in links: no passwords. Supabase makes the link (it never sends an email of its own),
// we email it with Resend, and our own /auth/confirm signs the person in. A link works once,
// for 15 minutes, and only the newest one for an email works: auth_links enforces that.

export const LINK_MINUTES = 15;
export const RESEND_SECONDS = 60;
const HISTORY = 20;

export const cleanEmail = (e) => String(e || "").trim().toLowerCase();

export function deviceName(userAgent) {
  const { browser, device } = describeAgent(userAgent);
  if (browser && device) return format(copy.device, { browser, device });
  return browser || device || copy.deviceUnknown;
}

// The account for an email: made if there is none (with the email marked as confirmed, because
// the person proves it by opening the link). Sends nothing.
async function ensureUser(email, metadata) {
  const { error } = await getAdmin().auth.admin.createUser({ email, email_confirm: true, user_metadata: metadata || {} });
  if (error && error.code !== "email_exists" && !/already (been )?registered/i.test(error.message || "")) {
    throw new Error(`auth: could not make the account: ${error.message}`);
  }
  return !error;
}

// When the last link for this email was made, to space out new ones.
export async function lastLinkAt(email) {
  const { data } = await getAdmin().from("auth_links").select("created_at").eq("email", email).order("created_at", { ascending: false }).limit(1);
  return data && data[0] ? new Date(data[0].created_at).getTime() : 0;
}

// Makes a sign in link for `email` and emails it.
// - purpose: "signin", "signup", "invite" or "welcome" (kept with the link).
// - template and data: which email carries it (the sign in email unless said otherwise).
// - metadata: for a new account, its name and the business to make on first sign in.
// Returns { userId, created }.
export async function sendSignInLink({ email, purpose = "signin", userAgent = "", metadata, template = "signin", data = {} }) {
  const admin = getAdmin();
  const created = await ensureUser(email, metadata);
  if (!created && metadata && metadata.pending_business) await rememberSignup(email, metadata);

  const { data: link, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !link || !link.properties) throw new Error(`auth: could not make the link: ${error ? error.message : "no link"}`);
  const { hashed_token: tokenHash, verification_type: type } = link.properties;
  const userId = link.user && link.user.id;

  // Older links for this email stop working.
  await admin.from("auth_links").update({ replaced_at: new Date().toISOString() }).eq("email", email).is("used_at", null).is("replaced_at", null);
  const { error: saveError } = await admin.from("auth_links").insert({
    email,
    user_id: userId,
    token_digest: sha256(tokenHash),
    purpose,
    expires_at: new Date(Date.now() + LINK_MINUTES * 60 * 1000).toISOString(),
  });
  if (saveError) throw new Error(`auth: could not keep the link: ${saveError.message}`);

  const url = `${siteUrl}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type || "email")}`;
  const now = new Date();
  await sendEmail({
    to: email,
    key: template,
    url,
    data: { email, device: deviceName(userAgent), time: lagosDayTime(now), signin: `${siteUrl}/signin`, ...data },
  });
  return { userId, created };
}

// Someone who already has an account but no business signed up again: keep the name and
// business they typed for their first sign in.
async function rememberSignup(email, metadata) {
  const admin = getAdmin();
  const { data: member } = await admin.from("business_members").select("id").eq("email", email).maybeSingle();
  if (member) return;
  const { data: profile } = await admin.from("profiles").select("user_id").eq("email", email).maybeSingle();
  if (!profile) return;
  const { data } = await admin.auth.admin.getUserById(profile.user_id);
  const current = (data && data.user && data.user.user_metadata) || {};
  await admin.auth.admin.updateUserById(profile.user_id, { user_metadata: { ...current, ...metadata } });
}

// Uses a link: true only for the newest unused link, within its 15 minutes. Marks it used, so
// it never works again. Returns { ok, email }.
export async function useLink(tokenHash) {
  const admin = getAdmin();
  const digest = sha256(tokenHash);
  const { data: used } = await admin
    .from("auth_links")
    .update({ used_at: new Date().toISOString() })
    .eq("token_digest", digest)
    .is("used_at", null)
    .is("replaced_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("email, purpose")
    .maybeSingle();
  if (used) return { ok: true, email: used.email, purpose: used.purpose };
  const { data: known } = await admin.from("auth_links").select("email").eq("token_digest", digest).maybeSingle();
  return { ok: false, email: known ? known.email : "" };
}

// The work after someone has signed in (with their code too, when two step sign in is on):
// accept a waiting invite, make the business they signed up with, link them to the team,
// send the welcome email once, and add the sign in to their history.
export async function afterSignIn(user, { method, userAgent }) {
  const admin = getAdmin();
  const email = cleanEmail(user.email);
  const now = new Date().toISOString();
  const meta = user.user_metadata || {};

  await admin.from("team_members").update({ user_id: user.id }).eq("email", email).is("user_id", null);

  const { data: member } = await admin.from("business_members").select("id, business_id, joined_at, user_id").eq("email", email).maybeSingle();
  let businessId = member ? member.business_id : null;
  if (member && (!member.joined_at || member.user_id !== user.id)) {
    await admin.from("business_members").update({ user_id: user.id, joined_at: member.joined_at || now }).eq("id", member.id);
    await admin.from("activity").insert({ business_id: member.business_id, user_id: user.id, kind: "member_joined", data: { email } });
  }
  if (!member && meta.pending_business) {
    const { data: biz } = await admin.from("businesses").insert({ name: String(meta.pending_business).slice(0, 120), created_by: user.id }).select("id").single();
    if (biz) {
      businessId = biz.id;
      await admin.from("business_members").insert({ business_id: biz.id, user_id: user.id, email, role: "owner", joined_at: now });
      await admin.from("activity").insert({ business_id: biz.id, user_id: user.id, kind: "account_created", data: {} });
    }
  }
  if (meta.pending_business) {
    await admin.auth.admin.updateUserById(user.id, { user_metadata: { ...meta, pending_business: null } });
  }

  const { data: profile } = await admin.from("profiles").select("full_name, welcomed_at").eq("user_id", user.id).maybeSingle();
  if (profile && !profile.full_name && meta.full_name) {
    await admin.from("profiles").update({ full_name: String(meta.full_name).slice(0, 120), updated_at: now }).eq("user_id", user.id);
  }
  if (profile && !profile.welcomed_at && businessId) {
    const { data: biz } = await admin.from("businesses").select("name").eq("id", businessId).maybeSingle();
    const name = (profile.full_name || meta.full_name || "").trim();
    try {
      await sendEmail({ to: email, key: "welcome", url: `${siteUrl}/console`, data: { first: name.split(/\s+/)[0] || undefined, business: biz ? biz.name : "" } });
      await admin.from("profiles").update({ welcomed_at: now }).eq("user_id", user.id);
    } catch (e) {
      console.error("[auth] welcome email:", e.message);
    }
  }

  await recordSignIn(user.id, method, userAgent);
}

// Where someone goes after signing in: their console, or Team view for team members who have
// no business of their own.
export async function landingFor(user) {
  const admin = getAdmin();
  const email = cleanEmail(user.email);
  const { data: member } = await admin.from("business_members").select("id").eq("user_id", user.id).not("joined_at", "is", null).maybeSingle();
  if (member || !user.email_confirmed_at) return "/console";
  const isOwner = Boolean(ownerEmail()) && email === ownerEmail();
  if (isOwner) return "/console/team/inbox";
  const { data: team } = await admin.from("team_members").select("id").eq("email", email).maybeSingle();
  return team ? "/console/team/inbox" : "/console";
}

export async function recordSignIn(userId, method, userAgent) {
  const admin = getAdmin();
  const { browser, device } = describeAgent(userAgent);
  await admin.from("signin_events").insert({ user_id: userId, method, browser, device });
  const { data: old } = await admin.from("signin_events").select("id").eq("user_id", userId).order("created_at", { ascending: false }).range(HISTORY, HISTORY + 100);
  if (old && old.length) await admin.from("signin_events").delete().in("id", old.map((r) => r.id));
}

// How the first step of this sign in was done, from the session: a link or Google.
export function firstStep(amr) {
  const methods = (amr || []).map((a) => a.method);
  return methods.includes("oauth") ? "google" : "link";
}

// Who is asking, for every console page and action. Checked against the sign in service each
// time (so "Sign out of all devices" works at once), and cached for the rest of the request.
// - ready: false while accounts are not switched on.
// - user: null when nobody is signed in.
// - needsCode: two step sign in is on and the code has not been typed in this session yet.
// - business, role: the business they belong to and their role in it ("owner" or "member").
// - isOwner, isTeam: the owner of Titan Wave Media (OWNER_EMAIL), and anyone on our team.
export const getContext = cache(async () => {
  if (!accountsReady()) return { ready: false, user: null };
  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.getUser();
  const user = !error && data ? data.user : null;
  if (!user) return { ready: true, user: null };

  const factors = (user.factors || []).filter((f) => f.factor_type === "totp" && f.status === "verified");
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const needsCode = factors.length > 0 && (!aal || aal.currentLevel !== "aal2");
  const email = cleanEmail(user.email);
  const confirmed = Boolean(user.email_confirmed_at);

  const admin = getAdmin();
  const [member, team, profile] = await Promise.all([
    admin.from("business_members").select("id, role, business_id, businesses(id, name, phone, address, autopay, created_at)").eq("user_id", user.id).not("joined_at", "is", null).maybeSingle(),
    admin.from("team_members").select("id").eq("email", email).maybeSingle(),
    admin.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
  ]);
  const isOwner = confirmed && Boolean(ownerEmail()) && email === ownerEmail();
  const isTeam = isOwner || (confirmed && Boolean(team.data));

  return {
    ready: true,
    supabase,
    user,
    email,
    profile: profile.data || { full_name: "", email },
    firstName: ((profile.data && profile.data.full_name) || "").trim().split(/\s+/)[0] || "",
    business: member.data ? member.data.businesses : null,
    role: member.data ? member.data.role : null,
    memberId: member.data ? member.data.id : null,
    isOwner,
    isTeam,
    twoStep: factors.length > 0,
    factors,
    needsCode,
  };
});

