"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function FollowLine({ text, link }) {
  const [email, setEmail] = useState("");
  useEffect(() => {
    try {
      setEmail(sessionStorage.getItem("twm-last-email") || "");
    } catch {}
  }, []);
  const href = email ? `/signup?email=${encodeURIComponent(email)}` : "/signup";
  return (
    <p style={{ marginBottom: 24 }}>
      {text}{" "}
      <Link className="link" href={href}>
        {link}
      </Link>
    </p>
  );
}
