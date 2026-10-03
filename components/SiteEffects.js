"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const currentPage = () => document.querySelector("#content main");

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
// Nothing here moves because the visitor scrolls: content is simply there.
export default function SiteEffects() {
  const pathname = usePathname();
  const lastPath = useRef(null);
  const popped = useRef(false);

  // A new page starts at the top, and focus moves to its heading (not on the first load,
  // and not when going back or forward, where the browser restores the place you were).
  useEffect(() => {
    const page = currentPage();
    if (!page) return;
    if (lastPath.current !== null && lastPath.current !== pathname) {
      if (!popped.current) window.scrollTo(0, 0);
      const h1 = page.querySelector("h1");
      if (h1) h1.focus({ preventScroll: true });
    }
    popped.current = false;
    lastPath.current = pathname;
    jumpedTo = null;
    spy();
  }, [pathname]);

  useEffect(() => {
    const onPop = () => {
      popped.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // While scrolling: the "On this page" bar follows the section you are in.
  useEffect(() => {
    // Scrolling by hand takes over from a clicked "On this page" link.
    const handScroll = () => {
      jumpedTo = null;
    };
    window.addEventListener("scroll", spy, { passive: true });
    window.addEventListener("wheel", handScroll, { passive: true });
    window.addEventListener("touchstart", handScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", spy);
      window.removeEventListener("wheel", handScroll);
      window.removeEventListener("touchstart", handScroll);
    };
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

  return null;
}
