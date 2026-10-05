"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "../Icon";
import { postJson } from "@/lib/client";
import { ACCEPT, MAX_FILE_BYTES, fileType } from "@/lib/files";
import { format } from "@/lib/text";
import { toast } from "@/lib/toast";
import copy from "@/content/console/project";

// The Files card on a project: the list with downloads, and "Send us a file". The file goes
// straight from the browser to the private bucket with a one time link from our server.
export default function ProjectFiles({ projectId, files, words = copy.files }) {
  const router = useRouter();
  const input = useRef(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function upload(file) {
    setError("");
    if (!fileType(file.name)) return setError(format(words.wrongType, { name: file.name }));
    if (file.size > MAX_FILE_BYTES) return setError(format(words.tooBig, { name: file.name }));
    setBusy(file.name);
    const failed = () => {
      setBusy("");
      setError(format(words.failed, { name: file.name }));
    };
    const start = await postJson("/api/console/files", { action: "start", projectId, name: file.name, size: file.size });
    if (!start.data.ok) {
      setBusy("");
      return setError(start.data.message || format(words.failed, { name: file.name }));
    }
    try {
      const put = await fetch(start.data.url, { method: "PUT", headers: { "content-type": start.data.contentType }, body: file });
      if (!put.ok) return failed();
    } catch {
      return failed();
    }
    const done = await postJson("/api/console/files", { action: "done", projectId, fileId: start.data.fileId, name: file.name });
    setBusy("");
    if (!done.data.ok) return setError(done.data.message || format(words.failed, { name: file.name }));
    toast(format(words.sent, { name: file.name }));
    router.refresh();
  }

  return (
    <div className="c-card">
      <div className="c-row">
        <h2>{words.title}</h2>
        <span className="c-upload">
          <label className="btn btn--sm" htmlFor={`up-${projectId}`}>
            <Icon name="upload" />
            {busy ? format(words.sending, { name: busy }) : words.send}
          </label>
          <input
            ref={input}
            id={`up-${projectId}`}
            className="sr-only"
            type="file"
            accept={ACCEPT}
            disabled={Boolean(busy)}
            aria-describedby={`up-${projectId}-rules`}
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              e.target.value = "";
              if (f) upload(f);
            }}
          />
        </span>
      </div>
      <p className="note" id={`up-${projectId}-rules`} style={{ marginTop: 6 }}>
        {words.rules}
      </p>
      <p className="field__err" role="alert">
        {error}
      </p>
      {files.length ? (
        <ul className="c-list c-files" style={{ marginTop: 10 }}>
          {files.map((f) => (
            <li key={f.id}>
              <Icon name="read" />
              <span>
                <b>{f.name}</b>
                <br />
                <span className="note">{f.line}</span>
              </span>
              <a className="btn btn--sm" href={`/api/console/files/${f.id}`} aria-label={`${words.open} ${f.name}`}>
                <Icon name="download" />
                {words.open}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ marginTop: 6 }}>{words.empty}</p>
      )}
    </div>
  );
}
