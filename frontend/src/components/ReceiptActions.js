"use client";

import Link from "next/link";
import { useState } from "react";

export default function ReceiptActions({ orderId }) {
  const [copied, setCopied] = useState(false);
  const [pdfHint, setPdfHint] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(orderId);
    } catch {
      // Fallback for older phones / http pages
      const ta = document.createElement("textarea");
      ta.value = orderId;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="no-print mx-auto mt-5 max-w-xl">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button type="button" onClick={() => window.print()} className="btn-primary btn-sm min-h-11">🖨 Print</button>
        <button
          type="button"
          onClick={() => {
            setPdfHint(true);
            setTimeout(() => window.print(), 50);
          }}
          className="btn-ghost btn-sm min-h-11"
        >
          ⬇ Save PDF
        </button>
        <button type="button" onClick={copy} className={`${copied ? "btn-success" : "btn-ghost"} btn-sm min-h-11`} aria-live="polite">
          {copied ? "✓ Copied" : "⧉ Copy ID"}
        </button>
        <Link href={`/track-order?id=${encodeURIComponent(orderId)}`} className="btn-accent btn-sm min-h-11">
          Order status
        </Link>
      </div>
      {pdfHint && (
        <p className="mt-3 text-center text-sm text-slate-ink">
          In the print window, choose <strong>“Save as PDF”</strong> as the printer/destination.
        </p>
      )}
    </div>
  );
}
