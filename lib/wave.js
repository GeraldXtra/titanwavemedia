// The wave: hundreds of thin lines strung between two moving edges. Where the edges cross, the lines
// pinch together and the ribbon twists. Warm white fades into red across the ribbon, and the left end
// fades out so the headline always sits on calm charcoal. The pointer parts the lines as it passes.
//
// The drawing is the design's own. Each line's gradient is built once per size instead of every
// frame, and the two edges are worked out once per frame for all the lines; the picture is the same.

const WHITE = [242, 236, 226];
const RED = [214, 69, 47];
const GREY = [150, 146, 140];
const CRED = [200, 16, 46];

export function createWave(cv, kind) {
  const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fineMQ = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = () => reduceMQ.matches;
  const ctx = cv.getContext("2d");
  let W = 0;
  let H = 0;
  let dpr = 1;
  let t = 7 + Math.random() * 20;
  let running = false;
  let visible = false;
  let last = 0;
  let px = -9999;
  let py = -9999;
  let amt = 0;
  let want = 0;
  let cache = null;
  let destroyed = false;

  function size() {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cache = null;
    if (!running) draw();
  }

  function shape(narrow) {
    if (kind === "paper" || kind === "night")
      return narrow
        ? { yc: (u) => H * (0.46 + 0.1 * u), a1: H * 0.12, a2: H * 0.14, spread: H * 0.12, wob: H * 0.02, from: -0.2, f1: 0.8, f2: 0.55 }
        : { yc: (u) => H * (0.5 + 0.06 * u), a1: H * 0.16, a2: H * 0.18, spread: H * 0.14, wob: H * 0.025, from: -0.2, f1: 0.75, f2: 0.5 };
    if (kind === "fig")
      return { yc: (u) => H * (0.58 - 0.14 * u), a1: H * 0.17, a2: H * 0.2, spread: H * 0.26, wob: H * 0.025, from: -0.2, f1: 0.9, f2: 0.62 };
    if (kind === "flat")
      return { yc: () => H * 0.62, a1: H * 0.03, a2: H * 0.18, spread: 0, wob: H * 0.012, from: 0.02, f1: 0.5, f2: 1, pinch: true };
    if (kind === "small")
      return narrow
        ? { yc: (u) => H * (0.86 - 0.04 * u), a1: H * 0.05, a2: H * 0.06, spread: H * 0.05, wob: H * 0.012, from: 0.0, f1: 0.8, f2: 0.6 }
        : { yc: (u) => H * (0.64 - 0.16 * u), a1: H * 0.13, a2: H * 0.15, spread: H * 0.14, wob: H * 0.02, from: 0.38, f1: 0.85, f2: 0.62 };
    return narrow
      ? { yc: (u) => H * (0.87 - 0.06 * u), a1: H * 0.05, a2: H * 0.065, spread: H * 0.06, wob: H * 0.012, from: 0.0, f1: 0.9, f2: 0.7 }
      : { yc: (u) => H * (0.76 - 0.36 * u), a1: H * 0.2, a2: H * 0.22, spread: H * 0.3, wob: H * 0.03, from: 0.32, f1: 0.9, f2: 0.62 };
  }

  // Everything that only changes with the size: line count, segments, shape and each line's gradient.
  function build() {
    const narrow = W < 700;
    const n =
      kind === "big" ? (narrow ? 90 : 160)
      : kind === "small" ? (narrow ? 46 : 80)
      : kind === "fig" ? (narrow ? 70 : 120)
      : kind === "paper" || kind === "night" ? (narrow ? 60 : 110)
      : 42;
    const seg = narrow ? 70 : 130;
    const s = shape(narrow);
    const lines = [];
    for (let k = 0; k < n; k++) {
      const f = k / (n - 1);
      const e = f * f * (3 - 2 * f);
      const paper = kind === "fig" || kind === "paper";
      const A = paper ? GREY : WHITE;
      const B = paper ? CRED : RED;
      const c = [
        Math.round(A[0] + (B[0] - A[0]) * e),
        Math.round(A[1] + (B[1] - A[1]) * e),
        Math.round(A[2] + (B[2] - A[2]) * e),
      ];
      const a =
        (kind === "flat" ? 0.22 : kind === "fig" ? 0.3 : kind === "paper" ? 0.07 : kind === "night" ? 0.06 : 0.16) +
        (kind === "paper" ? 0.26 : kind === "night" ? 0.34 : 0.5) * e;
      const g = ctx.createLinearGradient(0, 0, W, 0);
      const col = "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",";
      if (s.from <= 0) {
        g.addColorStop(0, col + (a * 0.85).toFixed(3) + ")");
        g.addColorStop(0.5, col + a.toFixed(3) + ")");
      } else {
        g.addColorStop(0, col + "0)");
        g.addColorStop(Math.min(0.96, s.from + 0.001), col + "0)");
        g.addColorStop(Math.min(0.98, s.from + 0.22), col + a.toFixed(3) + ")");
      }
      g.addColorStop(1, col + (a * 0.7).toFixed(3) + ")");
      lines.push({ f, g });
    }
    cache = {
      n,
      seg,
      s,
      lines,
      x: new Float64Array(seg + 1),
      top: new Float64Array(seg + 1),
      bot: new Float64Array(seg + 1),
      wob: new Float64Array(seg + 1),
    };
  }

  function draw() {
    if (!W || !H) return;
    if (!cache) build();
    const { n, seg, s, lines, x: X, top: TOP, bot: BOT, wob: WOB } = cache;
    ctx.clearRect(0, 0, W, H);
    const p1 = t * 0.11;
    const p2 = -t * 0.083 + 2.1;
    const p3 = t * 0.19;
    for (let i = 0; i <= seg; i++) {
      const u = i / seg;
      X[i] = -0.02 * W + 1.04 * W * u;
      let top = s.yc(u) + s.a1 * Math.sin(Math.PI * 2 * s.f1 * u + p1);
      let bot = s.yc(u) + s.a2 * Math.sin(Math.PI * 2 * s.f2 * u + p2) + s.spread * u;
      if (s.pinch) {
        const q = Math.abs(u - 0.5) * 2;
        bot = s.yc(u) + (bot - s.yc(u)) * q * q;
        top = s.yc(u) + (top - s.yc(u)) * q;
      }
      TOP[i] = top;
      BOT[i] = bot;
      WOB[i] = Math.PI * 2 * 2.1 * u + p3;
    }
    ctx.lineWidth = kind === "big" ? 1 : kind === "fig" ? 0.8 : 0.9;
    for (let k = 0; k < n; k++) {
      const { f, g } = lines[k];
      ctx.strokeStyle = g;
      ctx.beginPath();
      for (let i = 0; i <= seg; i++) {
        const x = X[i];
        let y = TOP[i] + (BOT[i] - TOP[i]) * f + s.wob * Math.sin(WOB[i] + f * 3.4);
        if (amt > 0.01) {
          const dx = (x - px) / 210;
          const dy = (y - py) / 120;
          const d = Math.exp(-dx * dx - dy * dy);
          y += Math.tanh((y - py) / 40) * 22 * d * amt;
        }
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
  }

  function frame(now) {
    if (!running) return;
    if (!visible || document.hidden) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    t += dt;
    amt += (want - amt) * Math.min(1, dt * 4);
    draw();
  }

  function start() {
    if (destroyed) return;
    if (running || reduced() || !visible || document.hidden) {
      if (!running) draw();
      return;
    }
    running = true;
    last = 0;
    requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
  }

  // Paused while off screen.
  let io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(cv);
  } else {
    visible = true;
  }

  // The pointer parts the lines.
  const host = cv.parentElement;
  const interactive = kind === "big" || kind === "fig" || kind === "paper" || kind === "night";
  function onMove(ev) {
    if (!fineMQ.matches) return;
    const r = cv.getBoundingClientRect();
    px = ev.clientX - r.left;
    py = ev.clientY - r.top;
    want = 1;
  }
  function onLeave() {
    want = 0;
  }
  if (interactive && host) {
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
  }

  function onVisibility() {
    if (!document.hidden) start();
  }
  document.addEventListener("visibilitychange", onVisibility);

  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (cv.offsetParent) size();
    }, 120);
  }
  window.addEventListener("resize", onResize);

  // Drawn once and still under reduced motion; switching the setting takes effect at once.
  function onMotionChange() {
    stop();
    draw();
    start();
  }
  if (reduceMQ.addEventListener) reduceMQ.addEventListener("change", onMotionChange);

  size();

  return {
    destroy() {
      destroyed = true;
      stop();
      if (io) io.disconnect();
      if (interactive && host) {
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
      }
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      if (reduceMQ.removeEventListener) reduceMQ.removeEventListener("change", onMotionChange);
    },
  };
}
