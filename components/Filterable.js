"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

// The filter buttons and search above a list (Products, Work, Updates). The list itself is
// rendered by the page; every item with a data-cat inside the [data-list] after the filters
// is shown or hidden, and the search looks through each item's words.
export default function Filterable({ name, label, options, searchLabel, searchPlaceholder, empty, children }) {
  const barRef = useRef(null);
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(null);

  useEffect(() => {
    const list = barRef.current.parentElement.querySelector("[data-list]");
    if (!list) return;
    const q = query.trim().toLowerCase();
    let count = 0;
    list.querySelectorAll("[data-cat]").forEach((item) => {
      const ok = (cat === "all" || item.getAttribute("data-cat") === cat) && (!q || item.textContent.toLowerCase().indexOf(q) >= 0);
      item.hidden = !ok;
      if (ok) count++;
    });
    setShown(count);
  }, [cat, query]);

  return (
    <>
      <div className="filters" data-filter-for={name} ref={barRef}>
        <div className="tabs" role="group" aria-label={label}>
          {options.map((o) => (
            <button key={o.value} type="button" aria-pressed={cat === o.value ? "true" : "false"} data-filter={o.value} onClick={() => setCat(o.value)}>
              {o.label}
            </button>
          ))}
        </div>
        {searchLabel && (
          <label className="search">
            <span className="sr-only">{searchLabel}</span>
            <Icon name="code" className={null} />
            <input type="search" placeholder={searchPlaceholder} data-search="" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        )}
      </div>
      {children}
      {empty && (
        <p className="note" data-empty="" hidden={shown !== 0}>
          {empty}
        </p>
      )}
    </>
  );
}
