"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Icon from "../Icon";
import { postJson } from "@/lib/client";
import { format } from "@/lib/text";
import shell from "@/content/console/shell";

export default function Bell({ mode, onCounts }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [reading, setReading] = useState(false);
  const wrap = useRef(null);
  const btn = useRef(null);

  const load = useCallback(async () => {
    if (document.hidden) return;
    try {
      const res = await fetch(`/api/console/bell?mode=${mode}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items || []);
      setUnread(data.unread || 0);
      if (onCounts) onCounts(data.counts || {});
    } catch {}
  }, [mode, onCounts]);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load, pathname]);

  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current && btn.current.focus();
      }
    }
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function read(ids) {
    if (ids === "all") setReading(true);
    await postJson("/api/console/bell", { mode, ids });
    await load();
    if (ids === "all") setReading(false);
  }

  return (
    <div className="c-pop" ref={wrap}>
      <button
        ref={btn}
        className="c-iconbtn"
        type="button"
        aria-haspopup="true"
        aria-expanded={open ? "true" : "false"}
        aria-label={unread ? format(shell.bell.labelCount, { n: unread }) : shell.bell.label}
        onClick={() => setOpen(!open)}
      >
        <Icon name="bell" className={null} />
        {unread > 0 && (
          <span className="c-badge" aria-hidden="true">
            {unread > 99 ? "99" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="c-menu">
          <div className="c-menu__head">
            <b>{shell.bell.title}</b>
            {unread > 0 && (
              <button className="linkbtn" type="button" disabled={reading} aria-busy={reading || undefined} onClick={() => read("all")}>
                {shell.bell.readAll}
              </button>
            )}
          </div>
          <ul>
            {items.length ? (
              items.map((n) => (
                <li key={n.id}>
                  <a
                    href={n.link || "#"}
                    className={n.read ? undefined : "is-unread"}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(false);
                      if (!n.read) read([n.id]);
                      if (n.link) router.push(n.link);
                    }}
                  >
                    <Icon name={n.icon || "bell"} />
                    <span>
                      {n.text}
                      <small>{n.when}</small>
                    </span>
                  </a>
                </li>
              ))
            ) : (
              <li className="c-empty-line">{shell.bell.empty}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
