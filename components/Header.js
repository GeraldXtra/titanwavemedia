"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandMark from "./BrandMark";
import Icon from "./Icon";
import SiteSearch from "./SiteSearch";
import site from "@/content/site";
import { cx } from "@/lib/text";

// The header (logo, "Start a project" and Menu) and the full screen menu.
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headRef = useRef(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const section = pathname.replace(/^\/+/, "").split("/")[0] || "home";

  // The header turns solid, then gets smaller, once you scroll.
  useEffect(() => {
    const head = headRef.current;
    function onScroll() {
      const y = window.scrollY || 0;
      head.classList.toggle("is-solid", y > 8);
      head.classList.toggle("is-small", y > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the menu is open the page behind it stays still and focus starts on the first link.
  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      document.body.style.overflow = "hidden";
      root.style.overflow = "hidden";
      const first = menuRef.current.querySelector("a");
      if (first) first.focus();
    } else {
      document.body.style.overflow = "";
      root.style.overflow = "";
    }
  }, [open]);

  function close(focusBack = true) {
    setOpen(false);
    if (focusBack && buttonRef.current) buttonRef.current.focus();
  }

  // Escape closes the menu and puts focus back on the Menu button.
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Going to another page closes the menu without moving focus.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Tabbing out of the menu closes it, so focus never sits behind it.
  function onBlur(e) {
    if (open && e.relatedTarget && !menuRef.current.contains(e.relatedTarget)) close(false);
  }

  return (
    <>
      <header className="hd" id="head" ref={headRef}>
        <div className="wrap hd__in">
          <Link className="brand" href="/" aria-label={site.header.homeLabel}>
            <BrandMark />
            <span className="brand__name">{site.name}</span>
          </Link>
          <div className="hd__right">
            <Link className="btn btn--solid btn--sm" href={site.header.cta.href}>
              <span>{site.header.cta.label}</span>
            </Link>
            <button
              className="menu-btn"
              id="menu-btn"
              type="button"
              aria-expanded={open ? "true" : "false"}
              aria-controls="mnav"
              ref={buttonRef}
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" className={null} />
              {site.header.menu}
            </button>
          </div>
        </div>
      </header>
      <div
        className={cx("mnav", open && "is-open")}
        id="mnav"
        role="dialog"
        aria-modal="true"
        aria-label={site.menu.label}
        inert={!open}
        data-native=""
        ref={menuRef}
        onBlur={onBlur}
      >
        <div className="mnav__top">
          <Link className="brand" href="/" aria-label={site.header.homeLabel}>
            <BrandMark />
            <span className="brand__name">{site.name}</span>
          </Link>
          <button className="menu-btn" id="menu-close" type="button" onClick={() => close()}>
            <Icon name="close" className={null} />
            {site.header.close}
          </button>
        </div>
        <SiteSearch inputId="smenu" label={site.menu.searchLabel} placeholder={site.menu.searchPlaceholder} menu />
        <ul>
          {site.menu.links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} data-nav={l.section} aria-current={l.section && l.section === section ? "page" : undefined}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mnav__base">
          <span>{site.menu.base}</span>
          <span>
            <a href={site.whatsappUrl} target="_blank" rel="noopener">
              {site.menu.whatsapp}
            </a>
          </span>
        </div>
      </div>
    </>
  );
}
