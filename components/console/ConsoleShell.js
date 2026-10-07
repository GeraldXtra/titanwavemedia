"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandMark from "../BrandMark";
import Icon from "../Icon";
import ConsoleSprite from "./ConsoleSprite";
import ConsoleSearch from "./ConsoleSearch";
import Bell from "./Bell";
import ConsoleFooter from "./ConsoleFooter";
import ThemeSwitch from "../ThemeSwitch";
import site from "@/content/site";
import shell from "@/content/console/shell";
import products from "@/content/console/products";

export default function ConsoleShell({ me, counts: firstCounts, legal, children }) {
  const pathname = usePathname();
  const mode = pathname.startsWith("/console/team") ? "team" : "client";
  const [counts, setCounts] = useState(firstCounts || {});
  const [sideOpen, setSideOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [message, setMessage] = useState("");
  const side = useRef(null);
  const menuBtn = useRef(null);
  const acct = useRef(null);
  const acctBtn = useRef(null);

  const onCounts = useCallback((c) => setCounts((old) => ({ ...old, ...c })), []);

  useEffect(() => {
    setSideOpen(false);
    setAcctOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sideOpen) return;
    const first = side.current && side.current.querySelector("a,button");
    if (first) first.focus();
    function onKey(e) {
      if (e.key === "Escape") {
        setSideOpen(false);
        menuBtn.current && menuBtn.current.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sideOpen]);

  useEffect(() => {
    if (!acctOpen) return;
    function onDown(e) {
      if (acct.current && !acct.current.contains(e.target)) setAcctOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setAcctOpen(false);
        acctBtn.current && acctBtn.current.focus();
      }
    }
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [acctOpen]);

  useEffect(() => {
    let timer = null;
    function onToast(e) {
      setMessage(e.detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(""), 4000);
    }
    window.addEventListener("twm-toast", onToast);
    return () => {
      window.removeEventListener("twm-toast", onToast);
      clearTimeout(timer);
    };
  }, []);

  const current = (item) => {
    const path = item.href.split("?")[0];
    const on = item.exact ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);
    return on ? "page" : undefined;
  };

  const nav = mode === "team" ? shell.teamNav : shell.clientNav;
  const home = mode === "team" ? "/console/team/inbox" : "/console";

  return (
    <div className="app">
      <ConsoleSprite />
      <a className="skip" href="#main">
        {shell.skip}
      </a>
      <header className="c-top">
        <button
          ref={menuBtn}
          className="c-iconbtn c-menubtn"
          type="button"
          aria-label={sideOpen ? shell.menuClose : shell.menu}
          aria-expanded={sideOpen ? "true" : "false"}
          aria-controls="c-side"
          onClick={() => setSideOpen(!sideOpen)}
        >
          <Icon name={sideOpen ? "close" : "menu"} className={null} />
        </button>
        <Link className="c-brand" href={home} aria-label={shell.homeLabel}>
          <BrandMark />
          <span className="c-brand__name">{shell.brand}</span>
          <span className="c-brand__tag">{shell.tag}</span>
        </Link>
        <ConsoleSearch mode={mode} />
        {me.isTeam && (
          <nav className="c-views" aria-label={shell.views.label}>
            <Link href="/console" aria-current={mode === "client" ? "page" : undefined}>
              {shell.views.client}
              <span className="c-views__more">{shell.views.more}</span>
            </Link>
            <Link href="/console/team/inbox" aria-current={mode === "team" ? "page" : undefined}>
              {shell.views.team}
              <span className="c-views__more">{shell.views.more}</span>
            </Link>
          </nav>
        )}
        <Bell mode={mode} onCounts={onCounts} />
        <div className="c-pop" ref={acct}>
          <button
            ref={acctBtn}
            className="c-avatar"
            type="button"
            aria-haspopup="true"
            aria-expanded={acctOpen ? "true" : "false"}
            aria-label={shell.account.label}
            onClick={() => setAcctOpen(!acctOpen)}
          >
            {me.initials}
          </button>
          {acctOpen && (
            <div className="c-menu c-menu--acct">
              <div className="c-menu__head">
                <span>
                  <b>{me.name || me.email}</b>
                  <small>{mode === "team" ? shell.account.team : me.business || me.email}</small>
                </span>
              </div>
              <ul>
                {mode === "client" && (
                  <>
                    <li>
                      <Link href="/console/settings">
                        <Icon name="gear" />
                        {shell.account.settings}
                      </Link>
                    </li>
                    {me.business && (
                      <li>
                        <Link href="/console/billing">
                          <Icon name="card" />
                          {shell.account.billing}
                        </Link>
                      </li>
                    )}
                  </>
                )}
                <li>
                  <form action="/auth/signout" method="post">
                    <button type="submit">
                      <Icon name="out" />
                      {shell.signOut}
                    </button>
                  </form>
                </li>
              </ul>
              <div className="c-menu__theme">
                <b id="acct-theme">{site.theme.appearance}</b>
                <ThemeSwitch labelledBy="acct-theme" />
              </div>
            </div>
          )}
        </div>
      </header>

      <aside className={`c-side${sideOpen ? " is-open" : ""}`} id="c-side" aria-label={shell.sideLabel} ref={side}>
        <nav aria-label={shell.sideLabel}>
          {nav.map((group, gi) => (
            <div key={gi}>
              {group.title && <h2>{group.title}</h2>}
              <ul>
                {(group.products
                  ? products.items.map((p) => ({
                      label: p.name,
                      href: products.pages[p.slug] || `/console/products/${p.slug}`,
                      icon: p.icon,
                      chip: p.status === "live" ? shell.live : p.status === "soon" ? shell.soon : null,
                    }))
                  : group.items.filter((i) => !i.owner || me.isOwner)
                ).map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={current(item)}>
                      <Icon name={item.icon} />
                      {item.label}
                      {item.chip && <span className="c-side__soon">{item.chip}</span>}
                      {item.count && counts[item.count] > 0 && <span className="c-side__count">{counts[item.count]}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="c-side__foot">
          <form action="/auth/signout" method="post">
            <button type="submit">
              <Icon name="out" />
              {shell.signOut}
            </button>
          </form>
        </div>
      </aside>
      {sideOpen && <div className="c-scrim" aria-hidden="true" onClick={() => setSideOpen(false)} />}

      <main className="c-main" id="main" tabIndex={-1}>
        {children}
      </main>
      <ConsoleFooter legal={legal} />
      <div className="c-toast" role="status" aria-live="polite">
        {message}
      </div>
    </div>
  );
}
