"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const currentPage = () => document.querySelector("#content main");
const REVEAL = { threshold: 0.08, rootMargin: "0px 0px -6% 0px" };

// Blocks below the hero are only laid out near the screen (content-visibility in globals.css).
// Measuring something inside a block that is still off screen would lay it out early, so the
// checks below look at the block's own box first.
const blockOf = (el) => el.closest("main .blk, .foot");
function blockBox(el, cache) {
  const block = blockOf(el);
  if (!block) return null;
  if (!cache.has(block)) cache.set(block, block.getBoundingClientRect());
  return cache.get(block);
}

// The step row draws its red line as it scrolls into view.
function drawSteps() {
  const cache = new Map();
  const vh = window.innerHeight;
  document.querySelectorAll(".steps--row").forEach((s) => {
    const box = blockBox(s, cache);
    let p;
    if (box && box.top >= vh * 0.85) p = 0;
    else if (box && box.bottom <= vh * 0.6) p = 1;
    else {
      const r = s.getBoundingClientRect();
      p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
    }
    const value = (p * 100).toFixed(1) + "%";
    if (s.style.getPropertyValue("--p") !== value) s.style.setProperty("--p", value);
  });
}

// Reveals what is in view or already above it, so nothing stays hidden.
function revealInView(page, { onlyOnScreen }) {
  const cache = new Map();
  const vh = window.innerHeight;
  page.querySelectorAll(".rv:not(.is-in)").forEach((el) => {
    const box = blockBox(el, cache);
    if (box) {
      if (box.top >= vh * 0.92) return;
      if (box.bottom <= 0) {
        if (!onlyOnScreen) el.classList.add("is-in");
        return;
      }
    }
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.92 && (!onlyOnScreen || r.bottom > 0)) el.classList.add("is-in");
  });
}

// "On this page": light the link of the section you are in. Sections near the end of a page can
// never scroll up to the line, so at the very bottom the link just clicked (or else the last
// section on screen) is lit instead.
let jumpedTo = null;
const lines = new WeakMap();
// Where a jump puts the section: the page's scroll padding plus the section's own scroll margin
// (the legal headings sit lower than the "On this page" sections). Never above the 140px line.
function lineFor(t) {
  if (!lines.has(t)) {
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const margin = parseFloat(getComputedStyle(t).scrollMarginTop) || 0;
    lines.set(t, Math.max(140, pad + margin + 10));
  }
  return lines.get(t);
}
function spy() {
  const links = Array.from(document.querySelectorAll("[data-spy]"));
  const target = (a) => document.getElementById(a.getAttribute("data-spy"));
  let current = null;
  links.forEach((a) => {
    const t = target(a);
    if (t && t.offsetParent && t.getBoundingClientRect().top <= lineFor(t)) current = a;
  });
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
  if (atBottom && links.length) {
    const clicked = jumpedTo && links.find((a) => a.getAttribute("data-spy") === jumpedTo);
    if (clicked) current = clicked;
    else
      links.forEach((a) => {
        const t = target(a);
        if (t && t.offsetParent && t.getBoundingClientRect().top < window.innerHeight) current = a;
      });
  }
  links.forEach((a) => {
    if (a === current) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  });
}

// Behaviour that belongs to the whole site rather than one component. It renders nothing.
export default function SiteEffects() {
  const pathname = usePathname();
  const lastPath = useRef(null);
  const popped = useRef(false);
  const wheel = useRef(null);

  // The head script adds "js" before the first paint and takes it away again if the site's
  // scripts have not started within a few seconds, so a slow connection never hides content.
  // While developing, React can drop the class when it rebuilds the page, so it goes back on.
  useLayoutEffect(() => {
    window.__siteReady = true;
    if (process.env.NODE_ENV !== "production") document.documentElement.classList.add("js");
  }, []);

  // Each page: content rises into view, with two safety nets so nothing stays hidden.
  useEffect(() => {
    const page = currentPage();
    if (!page) return;
    const pending = () => Array.from(page.querySelectorAll(".rv:not(.is-in)"));
    let io = null;
    if ("IntersectionObserver" in window && !reduced()) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      }, REVEAL);
      pending().forEach((el) => io.observe(el));
    } else {
      pending().forEach((el) => el.classList.add("is-in"));
    }
    const net = setTimeout(() => revealInView(page, { onlyOnScreen: true }), 60);

    // A new page starts at the top, and focus moves to its heading (not on the first load,
    // and not when going back or forward, where the browser restores the place you were).
    if (lastPath.current !== null && lastPath.current !== pathname) {
      if (!popped.current) window.scrollTo(0, 0);
      const h1 = page.querySelector("h1");
      if (h1) h1.focus({ preventScroll: true });
      if (wheel.current) wheel.current();
    }
    popped.current = false;
    lastPath.current = pathname;
    jumpedTo = null;
    drawSteps();
    spy();

    return () => {
      clearTimeout(net);
      if (io) io.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    const onPop = () => {
      popped.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // While scrolling: the step line, the second safety net and the "On this page" bar.
  useEffect(() => {
    let queued = false;
    function onScroll() {
      drawSteps();
      if (!queued) {
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          const page = currentPage();
          if (page) revealInView(page, { onlyOnScreen: false });
        });
      }
      spy();
    }
    // Scrolling by hand takes over from a clicked "On this page" link.
    const handScroll = () => {
      jumpedTo = null;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", handScroll, { passive: true });
    window.addEventListener("touchstart", handScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", handScroll);
      window.removeEventListener("touchstart", handScroll);
    };
  }, []);

  // The footer wordmark rises letter by letter.
  useEffect(() => {
    const word = document.querySelector("[data-letters]");
    if (!word) return;
    if (!("IntersectionObserver" in window) || reduced()) {
      word.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, REVEAL);
    io.observe(word);
    return () => io.disconnect();
  }, []);

  // Links inside a page (the "On this page" bars, the legal contents, "Notify me") scroll to
  // their target without changing the address.
  useEffect(() => {
    function onClick(e) {
      const a = e.target.closest && e.target.closest("a[data-jump]");
      if (!a) return;
      e.preventDefault();
      const t = document.getElementById(a.getAttribute("href").slice(1));
      if (!t) return;
      jumpedTo = t.id;
      // Lay out every block first so the jump lands exactly, then let them rest again once the
      // scroll is over (each keeps its real size).
      const root = document.documentElement;
      root.classList.add("cv-all");
      t.getBoundingClientRect();
      let done = false;
      const rest = () => {
        if (done) return;
        done = true;
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("cv-all")));
      };
      window.addEventListener("scrollend", rest, { once: true });
      setTimeout(rest, 1500);
      t.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      if (!t.hasAttribute("tabindex")) t.setAttribute("tabindex", "-1");
      t.focus({ preventScroll: true });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Smooth scrolling with the wheel on desktop. Places marked data-native keep their own scrolling.
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || reduced()) return;
    let target = window.scrollY;
    let cur = window.scrollY;
    let running = false;
    const max = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    function tick() {
      if (!running) return;
      cur += (target - cur) * 0.11;
      if (Math.abs(target - cur) < 0.5) {
        cur = target;
        running = false;
      }
      window.scrollTo(0, cur);
      if (running) requestAnimationFrame(tick);
    }
    function onWheel(e) {
      if (e.ctrlKey || (e.target.closest && e.target.closest(".row, .table-wrap, textarea, select, [data-native]"))) return;
      e.preventDefault();
      const d = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      target = Math.max(0, Math.min(max(), target + d));
      if (!running) {
        running = true;
        cur = window.scrollY;
        requestAnimationFrame(tick);
      }
    }
    function onScroll() {
      if (!running) target = cur = window.scrollY;
    }
    wheel.current = () => {
      running = false;
      target = cur = window.scrollY;
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      wheel.current = null;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
