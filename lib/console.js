import "server-only";
import { redirect } from "next/navigation";
import { getContext } from "./auth";
import events from "@/content/console/events";
import projectsCopy from "@/content/console/projects";

// For client pages: someone signed in with a business. Without one they are asked about their
// business first (team members too, when they open Client view).
export async function clientContext() {
  const ctx = await getContext();
  if (!ctx.user) redirect("/signin");
  if (!ctx.business) redirect("/console/start");
  return ctx;
}

// For Team view pages: the owner and team members only. `owner`: the owner only.
export async function teamContext({ owner = false } = {}) {
  const ctx = await getContext();
  if (!ctx.user) redirect("/signin");
  if (!ctx.isTeam || (owner && !ctx.isOwner)) redirect("/console");
  return ctx;
}

export const stepName = (n) => events.steps[n - 1] || "";

// The chip on a project: by step, or "Quote ready" while a quote waits for an answer.
export function projectStatus(project, quote) {
  if (quote && quote.status === "sent" && project.step <= 2) return projectsCopy.status.quote;
  return projectsCopy.status[project.step] || "";
}

// "12 KB", "3.4 MB"
export function fileSize(bytes) {
  const n = Number(bytes || 0);
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / 1024 / 1024).toFixed(1).replace(/\.0$/, "")} MB`;
}

// The first half of a setup price, and the second: kobo split so the halves add up exactly.
export function halves(totalKobo) {
  const first = Math.floor(Number(totalKobo) / 2);
  return { first, second: Number(totalKobo) - first };
}
