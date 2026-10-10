"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const STUCK = 15000;

function Bar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const bar = useRef(null);
  const api = useRef(null);
  const route = `${pathname}?${search}`;
  const seen = useRef(route);

  useEffect(() => {
    const el = bar.current;
    const fill = el.firstChild;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let on = false;
    let value = 0;
    let trickle = 0;
    let stuck = 0;
    let hide = 0;
    let watcher = null;

    const paint = (v, instant) => {
      value = v;
      if (instant) {
        fill.style.transition = "none";
        fill.style.transform = `scaleX(${v})`;
        void fill.offsetWidth;
        fill.style.transition = "";
      } else {
        fill.style.transform = `scaleX(${v})`;
      }
    };

    const stopWatching = () => {
      if (watcher) watcher.disconnect();
      watcher = null;
    };

    const finish = () => {
      if (!on) return;
      on = false;
      clearInterval(trickle);
      clearTimeout(stuck);
      stopWatching();
      paint(1, reduced.matches);
      hide = setTimeout(() => {
        el.classList.remove("is-on");
        hide = setTimeout(() => paint(0, true), 250);
      }, reduced.matches ? 0 : 180);
    };

    const start = () => {
      clearTimeout(hide);
      if (on) return;
      on = true;
      el.classList.add("is-on");
      paint(reduced.matches ? 0.35 : 0.12, true);
      if (!reduced.matches) {
        trickle = setInterval(() => paint(value + (0.9 - value) * 0.1), 300);
      }
      stuck = setTimeout(finish, STUCK);
    };

    const settle = () => {
      if (!on) return;
      if (!document.querySelector("[data-skeleton]")) {
        finish();
        return;
      }
      stopWatching();
      watcher = new MutationObserver(() => {
        if (!document.querySelector("[data-skeleton]")) finish();
      });
      watcher.observe(document.body, { childList: true, subtree: true });
    };

    const onClick = (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      let url;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || url.pathname.startsWith("/api/")) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      start();
    };

    const onSubmit = (e) => {
      const form = e.target;
      if (e.defaultPrevented || !(form instanceof HTMLFormElement)) return;
      if (form.dataset.sending) {
        e.preventDefault();
        return;
      }
      form.dataset.sending = "1";
      const button = e.submitter;
      if (button) {
        button.setAttribute("aria-busy", "true");
        button.setAttribute("aria-disabled", "true");
        button.dataset.autoBusy = "1";
      }
      if (!form.target || form.target === "_self") start();
    };

    const onPop = () => {
      if (`${window.location.pathname}${window.location.search}` !== seen.current.replace(/\?$/, "")) start();
    };

    const onShow = (e) => {
      if (!e.persisted) return;
      finish();
      document.querySelectorAll("form[data-sending]").forEach((f) => delete f.dataset.sending);
      document.querySelectorAll("[data-auto-busy]").forEach((b) => {
        b.removeAttribute("aria-busy");
        b.removeAttribute("aria-disabled");
        delete b.dataset.autoBusy;
      });
    };

    api.current = { settle };
    window.addEventListener("click", onClick, true);
    window.addEventListener("submit", onSubmit);
    window.addEventListener("popstate", onPop);
    window.addEventListener("pageshow", onShow);
    window.addEventListener("twm-nav", start);
    return () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("submit", onSubmit);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("pageshow", onShow);
      window.removeEventListener("twm-nav", start);
      clearInterval(trickle);
      clearTimeout(stuck);
      clearTimeout(hide);
      stopWatching();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    if (seen.current === route) return;
    seen.current = route;
    if (api.current) api.current.settle();
  }, [route]);

  return (
    <div className="nprog" ref={bar} aria-hidden="true">
      <i />
    </div>
  );
}

export default function NavProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
