import { Fragment } from "react";
import { linkParts } from "@/lib/assist/links";

// One message's words, always as text. Line breaks are kept, and only the business's own
// websites, WhatsApp, phone and email become links (lib/assist/links.js).
export default function AssistText({ text, settings, links = true, newTab }) {
  return String(text ?? "")
    .split("\n")
    .map((line, i) => (
      <Fragment key={i}>
        {i > 0 && <br />}
        {links
          ? linkParts(line, settings).map((p, j) =>
              p.href ? (
                <a key={j} href={p.href} {...(p.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  {p.text}
                  {p.external && <span className="sr-only"> {newTab}</span>}
                </a>
              ) : (
                <Fragment key={j}>{p.text}</Fragment>
              )
            )
          : line}
      </Fragment>
    ));
}
