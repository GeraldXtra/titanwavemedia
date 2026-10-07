"use client";

import { useEffect, useState } from "react";
import SignInForm from "./SignInForm";
import { SignInMark } from "./Parts";
import { recallLink } from "@/lib/client";
import copy from "@/content/console/signin";

export default function ExpiredForm() {
  const t = copy.expired;
  const [email, setEmail] = useState(null);
  useEffect(() => setEmail(recallLink().email || ""), []);
  return (
    <>
      <SignInMark icon="close" />
      <h1>{t.title}</h1>
      <p className="si__sub">{t.lede}</p>
      {email !== null && <SignInForm key={email} email={email} heading={false} button={t.button} />}
    </>
  );
}
