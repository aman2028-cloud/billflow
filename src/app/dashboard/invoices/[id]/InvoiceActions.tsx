"use client";

import { useState, useTransition } from "react";
import { updateInvoiceStatus } from "../actions";

export default function InvoiceActions({
  invoiceId,
  shareToken,
  currentStatus,
}: {
  invoiceId: string;
  shareToken: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/invoice/${shareToken}`
      : "";

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentStatus}
        disabled={isPending}
        onChange={(e) =>
          startTransition(() =>
            updateInvoiceStatus(invoiceId, e.target.value as "draft" | "sent" | "paid")
          )
        }
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
      >
        <option value="draft">Draft</option>
        <option value="sent">Sent</option>
        <option value="paid">Paid</option>
      </select>
      <button
        onClick={copyLink}
        className="border border-gray-300 text-sm px-4 py-2 rounded-lg"
      >
        {copied ? "Link copied!" : "Copy share link"}
      </button>
      <button
        onClick={() => window.print()}
        className="bg-black text-white text-sm px-4 py-2 rounded-lg"
      >
        Print / PDF
      </button>
    </div>
  );
}