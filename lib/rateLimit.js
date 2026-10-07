import "server-only";

export function createLimiter({ limit, windowMs }) {
  const hits = new Map();
  let calls = 0;

  return function check(key) {
    const now = Date.now();
    const since = now - windowMs;
    const recent = (hits.get(key) || []).filter((t) => t > since);
    let ok = true;
    if (recent.length >= limit) ok = false;
    else recent.push(now);
    hits.set(key, recent);

    if (++calls % 500 === 0 || hits.size > 20000) {
      for (const [k, list] of hits) if (!list.length || list[list.length - 1] <= since) hits.delete(k);
    }
    return { ok, retryAfter: ok ? 0 : Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)) };
  };
}

const HOUR = 60 * 60 * 1000;

export const chatLimit = createLimiter({ limit: 30, windowMs: HOUR });
export const formLimit = createLimiter({ limit: 20, windowMs: HOUR });
export const assistConfigLimit = createLimiter({ limit: 60, windowMs: 60 * 1000 });
