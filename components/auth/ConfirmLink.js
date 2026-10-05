"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { postJson, rememberLink } from "@/lib/client";
import copy from "@/content/console/signin";

// The page a sign in link opens: "Signing you in". It uses the link from here, not on opening,
// so an email scanner that only looks at the link cannot use it up.
export default function ConfirmLink() {
  const router = useRouter();
  const started = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get("token_hash") || "";
    postJson("/api/auth/confirm", { token_hash }).then(({ status, data }) => {
      if (data.ok && data.next) {
        // A full page load, so the console sees the new sign in cookie.
        window.location.replace(data.next);
        return;
      }
      if (status === 0) {
        setFailed(true);
        return;
      }
      rememberLink(data.email || "", 0);
      router.replace("/signin/expired");
    });
  }, [router]);

  return (
    <>
      <div className="spin" aria-hidden="true" />
      <h1 className="center">{copy.verify.title}</h1>
      <p className="lede center" role="status">
        {failed ? copy.errors.failed : copy.verify.link}
      </p>
    </>
  );
}
