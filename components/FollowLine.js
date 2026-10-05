"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// "Want to follow your request? Create a free account", with the email from the contact form
// filled in on the sign up page.
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
