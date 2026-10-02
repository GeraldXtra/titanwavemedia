"use client";

import { useEffect, useRef, useState } from "react";

// Copies the page address, and says so for two seconds.
export default function CopyLinkButton({ label, done, prompt }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  function onClick() {
    const url = window.location.href;
    const ok = () => {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    };
    const ask = () => window.prompt(prompt, url);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, ask);
    else ask();
  }

  return (
    <button className="btn btn--line btn--sm" type="button" data-copy-link="" onClick={onClick}>
      {copied ? done : label}
    </button>
  );
}
