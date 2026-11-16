"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";

export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked (permissions or an insecure origin): fall back to the mail client.
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button className="copy-email" type="button" onClick={copy} data-copied={copied || undefined}>
      <span className="copy-email-address">{email}</span>
      <span className="copy-email-action">
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
      </span>
    </button>
  );
}
