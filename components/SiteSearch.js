"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cx } from "@/lib/text";
import site from "@/content/site";

export default function SiteSearch({ inputId, label, placeholder, light = false }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const q = value.trim().toLowerCase();
  const matches = q ? site.search.pages.filter((p) => (p.title + " " + p.words).toLowerCase().indexOf(q) >= 0).slice(0, 6) : [];

  function onSubmit(e) {
    e.preventDefault();
    if (matches.length) router.push(matches[0].href);
  }

  return (
    <form className={cx("sitesearch", light && "sitesearch--light")} data-sitesearch="" noValidate onSubmit={onSubmit}>
      <label className="sr-only" htmlFor={inputId}>
        {label}
      </label>
      <input id={inputId} type="search" placeholder={placeholder} autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)} />
      <ul className="sitesearch__out" aria-live="polite">
        {q &&
          (matches.length ? (
            matches.map((p) => (
              <li key={p.href}>
                <Link href={p.href}>{p.title}</Link>
              </li>
            ))
          ) : (
            <li className="note">{site.search.noMatch}</li>
          ))}
      </ul>
    </form>
  );
}
