"use client";

import { useState, useTransition } from "react";
import { payInvoicePublic } from "./actions";

export default function PayButton({
  token,
  status,
  total,
}: {
  token: string;
  status: string;
  total: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [paid, setPaid] = useState(status === "paid");

  if (paid) {
    return (
      <span className="text-green-700 font-medium text-sm bg-green-100 px-4 py-2 rounded-lg">
        ✓ Paid
      </span>
    );
  }

  return (
    <button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await payInvoicePublic(token);
          setPaid(true);
        });
      }}
      className="bg-black text-white text-sm px-6 py-2.5 rounded-lg disabled:opacity-50"
    >
      {isPending ? "Processing..." : `Pay ${total} (test mode)`}
    </button>
  );
}