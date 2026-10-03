"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import site from "@/content/site";

// The back to top button, shown once the page has scrolled 600px.
export default function ScrollUi() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    function onScroll() {
      setHidden(window.scrollY < 600);
    }
    onScroll();
    // After a page change the page has a new height.
    const later = setTimeout(onScroll, 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(later);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  function toTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button className="totop" id="totop" type="button" aria-label={site.backToTop} hidden={hidden} onClick={toTop}>
      <Icon name="close" className={null} />
    </button>
  );
}
