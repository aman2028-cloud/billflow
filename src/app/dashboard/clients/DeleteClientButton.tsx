"use client";

import { useTransition } from "react";
import { deleteClient } from "./actions";

export default function DeleteClientButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this client? This cannot be undone.")) {
          startTransition(() => deleteClient(id));
        }
      }}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}