"use client";

// Jumps past the header to the page's heading. Without scripts it still jumps to the content.
export default function SkipLink({ label }) {
  function onClick(e) {
    const h1 = document.querySelector("#content main h1");
    if (h1) {
      e.preventDefault();
      h1.focus();
    }
  }
  return (
    <a className="skip" href="#content" onClick={onClick}>
      {label}
    </a>
  );
}
