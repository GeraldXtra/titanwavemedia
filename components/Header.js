"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandMark from "./BrandMark";
import Icon from "./Icon";
import SiteSearch from "./SiteSearch";
import site from "@/content/site";
import { cx } from "@/lib/text";

const WIDE = "(min-width: 1000px)";

// The header. From 1000px wide: the logo, the main links, Search and "Start a project".
// Below that: the logo and a Menu button that opens a panel from the right with the search,
// the same links and "Start a project". Neither panel traps focus: tabbing out closes it.
export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);
  const searchRef = useRef(null);
  const searchBtnRef = useRef(null);
  const section = pathname.replace(/^\/+/, "").split("/")[0] || "home";
  const current = (l) => (l.section && l.section === section ? "page" : undefined);

  function closeMenu(focusBack = true) {
    setMenuOpen(false);
    if (focusBack && menuBtnRef.current) menuBtnRef.current.focus();
  }
  function closeSearch(focusBack = true) {
    setSearchOpen(false);
    if (focusBack && searchBtnRef.current) searchBtnRef.current.focus();
  }

  // While the menu is open the page behind it stays still, and focus starts on its Close button.
  useEffect(() => {
    const root = document.documentElement;
    document.body.style.overflow = menuOpen ? "hidden" : "";
    root.style.overflow = menuOpen ? "hidden" : "";
    if (menuOpen) {
      const first = menuRef.current.querySelector("button");
      if (first) first.focus();
    }
  }, [menuOpen]);

  // The search panel puts focus straight into the search box.
  useEffect(() => {
    if (searchOpen) {
      const input = searchRef.current.querySelector("input");
      if (input) input.focus();
    }
  }, [searchOpen]);

  // Escape closes whichever is open and puts focus back on the button that opened it.
  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    function onKey(e) {
      if (e.key !== "Escape") return;
      if (menuOpen) closeMenu();
      if (searchOpen) closeSearch();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, searchOpen]);

  // A click outside the search panel closes it.
  useEffect(() => {
    if (!searchOpen) return;
    function onDown(e) {
      if (!searchRef.current.contains(e.target) && !searchBtnRef.current.contains(e.target)) closeSearch(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [searchOpen]);

  // Going to another page closes both without moving focus.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // The menu belongs to narrow screens and the search panel to wide ones: turning a tablet or
  // resizing the window across 1000px closes the one that no longer fits.
  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    function onChange() {
      if (mq.matches) setMenuOpen(false);
      else setSearchOpen(false);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Tabbing out of a panel closes it, so focus never sits behind it.
  function onMenuBlur(e) {
    if (menuOpen && e.relatedTarget && !menuRef.current.contains(e.relatedTarget)) closeMenu(false);
  }
  function onSearchBlur(e) {
    if (searchOpen && e.relatedTarget && !searchRef.current.contains(e.relatedTarget) && e.relatedTarget !== searchBtnRef.current) closeSearch(false);
  }

  return (
    <>
      <header className="hd" id="head">
        <div className="wrap hd__in">
          <Link className="brand" href="/" aria-label={site.header.homeLabel}>
            <BrandMark />
            <span className="brand__name">{site.name}</span>
          </Link>
          <nav className="hd__nav" aria-label={site.header.navLabel}>
            <ul>
              {site.nav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} aria-current={current(l)}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="hd__right">
            <button
              className="hd__search"
              id="search-btn"
              type="button"
              aria-expanded={searchOpen ? "true" : "false"}
              aria-controls="hsearch"
              ref={searchBtnRef}
              onClick={() => (searchOpen ? closeSearch(false) : setSearchOpen(true))}
            >
              <Icon name="search" className={null} />
              <span className="sr-only">{site.header.search}</span>
            </button>
            <Link className="hd__signin" href={site.header.signin.href}>
              {site.header.signin.label}
            </Link>
            <Link className="btn btn--solid btn--sm hd__cta" href={site.header.cta.href}>
              {site.header.cta.label}
            </Link>
            <button
              className="menu-btn"
              id="menu-btn"
              type="button"
              aria-expanded={menuOpen ? "true" : "false"}
              aria-controls="mnav"
              ref={menuBtnRef}
              onClick={() => setMenuOpen(true)}
            >
              <Icon name="menu" className={null} />
              {site.header.menu}
            </button>
          </div>
        </div>
        <div className="hsearch" id="hsearch" hidden={!searchOpen} ref={searchRef} onBlur={onSearchBlur}>
          <div className="wrap">
            <SiteSearch inputId="shead" label={site.menu.searchLabel} placeholder={site.menu.searchPlaceholder} light />
          </div>
        </div>
      </header>
      <div className={cx("mnav__shade", menuOpen && "is-open")} aria-hidden="true" onClick={() => closeMenu()} />
      <div
        className={cx("mnav", menuOpen && "is-open")}
        id="mnav"
        role="dialog"
        aria-modal="false"
        aria-label={site.menu.label}
        inert={!menuOpen}
        data-native=""
        ref={menuRef}
        onBlur={onMenuBlur}
      >
        <div className="mnav__top">
          <span className="mnav__title">{site.menu.label}</span>
          <button className="menu-btn" id="menu-close" type="button" onClick={() => closeMenu()}>
            <Icon name="close" className={null} />
            {site.header.close}
          </button>
        </div>
        <SiteSearch inputId="smenu" label={site.menu.searchLabel} placeholder={site.menu.searchPlaceholder} light />
        <ul className="mnav__links">
          {site.nav.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={current(l)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link className="btn mnav__signin" href={site.header.signin.href}>
          {site.header.signin.label}
        </Link>
        <Link className="btn btn--solid mnav__cta" href={site.header.cta.href}>
          {site.header.cta.label}
        </Link>
      </div>
    </>
  );
}
