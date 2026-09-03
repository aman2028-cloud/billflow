"use server";

import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// No auth check here — access is gated by knowing the unguessable shareToken instead.
export async function payInvoicePublic(token: string) {
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.shareToken, token))
    .limit(1);

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "paid") return;

  await db
    .update(invoices)
    .set({ status: "paid", paidAt: new Date() })
    .where(eq(invoices.shareToken, token));

  revalidatePath(`/invoice/${token}`);
}