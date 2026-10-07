import "server-only";
import { redirect } from "next/navigation";
import { getContext } from "./auth";
import events from "@/content/console/events";
import projectsCopy from "@/content/console/projects";

export async function clientContext() {
  const ctx = await getContext();
  if (!ctx.user) redirect("/signin");
  if (!ctx.business) redirect("/console/start");
  return ctx;
}

export async function teamContext({ owner = false } = {}) {
  const ctx = await getContext();
  if (!ctx.user) redirect("/signin");
  if (!ctx.isTeam || (owner && !ctx.isOwner)) redirect("/console");
  return ctx;
}

export const stepName = (n) => events.steps[n - 1] || "";

export function projectStatus(project, quote) {
  if (quote && quote.status === "sent" && project.step <= 2) return projectsCopy.status.quote;
  return projectsCopy.status[project.step] || "";
}

export function fileSize(bytes) {
  const n = Number(bytes || 0);
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / 1024 / 1024).toFixed(1).replace(/\.0$/, "")} MB`;
}

export function halves(totalKobo) {
  const first = Math.floor(Number(totalKobo) / 2);
  return { first, second: Number(totalKobo) - first };
}
