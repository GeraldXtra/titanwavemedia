"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../Icon";
import shell from "@/content/console/shell";

// Search the console's pages. Arrow keys move through the results and Enter opens one.
export default function ConsoleSearch({ mode }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const box = useRef(null);
  const pages = shell.search[mode] || [];
  const term = q.trim().toLowerCase();
  const found = term ? pages.filter((p) => p.label.toLowerCase().includes(term)).slice(0, 7) : [];

  useEffect(() => {
    function onDown(e) {
      if (box.current && !box.current.contains(e.target)) setQ("");
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  function go(href) {
    setQ("");
    router.push(href);
  }

  function onKey(e) {
    if (e.key === "Escape") setQ("");
    if (!found.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => (s + (e.key === "ArrowDown" ? 1 : -1) + found.length) % found.length);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      go(found[Math.min(sel, found.length - 1)].href);
    }
  }

  return (
    <div className="c-search" role="search" ref={box}>
      <label className="sr-only" htmlFor="c-q">
        {shell.search.label}
      </label>
      <Icon name="search" />
      <input
        id="c-q"
        type="search"
        placeholder={shell.search.placeholder}
        autoComplete="off"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setSel(0);
        }}
        onKeyDown={onKey}
        aria-controls={term ? "c-q-out" : undefined}
      />
      {term && (
        <ul className="c-search__out" id="c-q-out">
          {found.length ? (
            found.map((p, i) => (
              <li key={p.label}>
                <a
                  href={p.href}
                  className={i === sel ? "is-on" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    go(p.href);
                  }}
                >
                  <Icon name={p.icon} />
                  {p.label}
                </a>
              </li>
            ))
          ) : (
            <li className="note">{shell.search.empty}</li>
          )}
        </ul>
      )}
    </div>
  );
}
