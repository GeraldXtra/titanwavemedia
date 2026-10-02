import { Fragment } from "react";
import Link from "next/link";
import LagosClock from "./LagosClock";
import { fill, isExternal } from "@/lib/text";

// Renders copy from the content folder.
// - [Square brackets] become grey placeholders, like the design.
// - {email}, {rc} and the other values in content/site.js are filled in.
// - {clock} shows the time in Lagos. Other {tokens} can be passed in with `tokens`.
// - Text can also be a list of parts, where { link: "Words", href: "/page" } is a link.

const PARTS = /(\{\w+\}|\[[^\]]+\])/;

function renderText(text, tokens, prefix) {
  return fill(text)
    .split(PARTS)
    .map((part, i) => {
      if (!part) return null;
      const key = `${prefix}.${i}`;
      const token = /^\{(\w+)\}$/.exec(part);
      if (token) {
        const name = token[1];
        if (tokens && name in tokens) return <Fragment key={key}>{tokens[name]}</Fragment>;
        if (name === "clock") return <LagosClock key={key} />;
        return <Fragment key={key}>{part}</Fragment>;
      }
      if (part.startsWith("[") && part.endsWith("]")) {
        return (
          <span key={key} className="ph">
            {part}
          </span>
        );
      }
      return <Fragment key={key}>{part}</Fragment>;
    });
}

export default function Rich({ text, tokens, linkClass }) {
  if (text == null || text === "") return null;
  const parts = Array.isArray(text) ? text : [text];
  return parts.map((part, i) => {
    if (typeof part === "string") return <Fragment key={i}>{renderText(part, tokens, i)}</Fragment>;
    if (part && part.link) {
      const inner = renderText(part.link, tokens, i);
      if (isExternal(part.href)) {
        const web = /^https?:/i.test(part.href);
        return (
          <a key={i} className={linkClass} href={part.href} {...(web ? { target: "_blank", rel: "noopener" } : {})}>
            {inner}
          </a>
        );
      }
      return (
        <Link key={i} className={linkClass} href={part.href}>
          {inner}
        </Link>
      );
    }
    return null;
  });
}
