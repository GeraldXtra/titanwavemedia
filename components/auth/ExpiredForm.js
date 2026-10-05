"use client";

import { useEffect, useState } from "react";
import Icon from "../Icon";
import SignInForm from "./SignInForm";
import { recallLink } from "@/lib/client";
import copy from "@/content/console/signin";

// "This link has expired", with the email filled in and a button for a new link.
export default function ExpiredForm() {
  const t = copy.expired;
  const [email, setEmail] = useState(null);
  useEffect(() => setEmail(recallLink().email || ""), []);
  return (
    <>
      <div className="auth__icon auth__icon--danger">
        <Icon name="close" />
      </div>
      <h1>{t.title}</h1>
      <p className="lede">{t.lede}</p>
      {email !== null && <SignInForm key={email} email={email} heading={false} button={t.button} />}
    </>
  );
}
