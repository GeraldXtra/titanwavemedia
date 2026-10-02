"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import site from "@/content/site";

// The red progress line along the top and the back to top button.
export default function ScrollUi() {
  const pathname = usePathname();
  const barRef = useRef(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      barRef.current.style.transform = "scaleX(" + (h > 0 ? Math.min(1, window.scrollY / h) : 0).toFixed(4) + ")";
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
    <>
      <div className="progress" id="progress" aria-hidden="true" ref={barRef} />
      <button className="totop" id="totop" type="button" aria-label={site.backToTop} hidden={hidden} onClick={toTop}>
        <Icon name="close" className={null} />
      </button>
    </>
  );
}
