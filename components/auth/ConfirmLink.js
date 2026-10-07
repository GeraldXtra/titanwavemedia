"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SignInMark } from "./Parts";
import { postJson, rememberLink } from "@/lib/client";
import copy from "@/content/console/signin";

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
      <SignInMark />
      <div className="spin" aria-hidden="true" />
      <h1>{copy.verify.title}</h1>
      <p className="si__sub" role="status">
        {failed ? copy.errors.failed : copy.verify.link}
      </p>
    </>
  );
}
