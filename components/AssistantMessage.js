"use client";

import { Fragment } from "react";
import Link from "next/link";
import assistant from "@/content/assistant";
import site from "@/content/site";
import { format } from "@/lib/text";
import { waLink } from "@/lib/whatsapp";

function ChatText({ text }) {
  return String(text)
    .split("\n")
    .map((line, i) => (
      <Fragment key={i}>
        {i > 0 && <br />}
        {line.split(/(\[[A-Z ]+\])/).map((part, j) =>
          /^\[[A-Z ]+\]$/.test(part) ? (
            <span className="ph" key={j}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </Fragment>
    ));
}

export default function AssistantMessage({ m }) {
  if (m.role === "user") {
    return (
      <li className="msg msg--in">
        {m.text}
        <small>{assistant.you}</small>
      </li>
    );
  }
  return (
    <li className="msg msg--out">
      <ChatText text={m.text} />
      {m.link && (
        <>
          <br />
          <Link className="link" href={m.link.href}>
            {m.link.label}
          </Link>
        </>
      )}
      {m.whatsapp && (
        <>
          <br />
          <a
            className="link"
            href={waLink(site.whatsappUrl, assistant.whatsappStart + (m.question && m.question.trim() ? format(assistant.whatsappQuestion, { question: m.question.trim() }) : ""))}
            target="_blank"
            rel="noopener"
          >
            {assistant.whatsappLink}
          </a>
        </>
      )}
      <small>{assistant.bot}</small>
    </li>
  );
}
