import products from "@/content/console/products";
import { guard } from "@/lib/api";
import { addActivity } from "@/lib/events";
import { json, readJson } from "@/lib/http";
import { getAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Notify me on a coming soon product: on puts the person on its list, off takes them off.
export async function POST(request) {
  const { ctx, res } = await guard(request);
  if (res) return res;
  const body = await readJson(request, 1024);
  const data = (body.data && typeof body.data === "object" && body.data) || {};
  // Only products on the way have a list; a product that works today has nothing to wait for.
  const product = products.items.find((p) => p.slug === data.product && p.status === "soon");
  if (!product) return json({ ok: false, error: "not_found" }, 404);
  const admin = getAdmin();
  if (data.on === true) {
    const { error } = await admin.from("product_interest").insert({ product: product.slug, user_id: ctx.user.id, business_id: ctx.business ? ctx.business.id : null });
    if (error && error.code !== "23505") return json({ ok: false }, 502);
    if (!error && ctx.business) await addActivity(ctx.business.id, ctx.user.id, "product_interest", { name: product.name });
  } else {
    await admin.from("product_interest").delete().eq("product", product.slug).eq("user_id", ctx.user.id);
  }
  return json({ ok: true });
}
