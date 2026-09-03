"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { invoices, lineItems, settings } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

type LineItemInput = {
  description: string;
  quantity: number;
  rate: number;
};

export async function createInvoice(data: {
  clientId: string;
  dueDate: string;
  notes: string;
  taxPercent: number;
  discountPercent: number;
  lineItems: LineItemInput[];
}) {
  const userId = await requireUserId();

  // Get user settings for invoice number prefix
  const [userSettings] = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, userId))
    .limit(1);

  const prefix = userSettings?.invoicePrefix || "INV";
  const nextNumber = userSettings?.nextInvoiceNumber || 1;
  const invoiceNumber = `${prefix}-${String(nextNumber).padStart(4, "0")}`;

  const [invoice] = await db
    .insert(invoices)
    .values({
      userId,
      clientId: data.clientId,
      invoiceNumber,
      dueDate: new Date(data.dueDate),
      notes: data.notes,
      taxPercent: String(data.taxPercent),
      discountPercent: String(data.discountPercent),
      status: "draft",
    })
    .returning();

  if (data.lineItems.length > 0) {
    await db.insert(lineItems).values(
      data.lineItems.map((item, i) => ({
        invoiceId: invoice.id,
        description: item.description,
        quantity: String(item.quantity),
        rate: String(item.rate),
        sortOrder: i,
      }))
    );
  }

  // bump the next invoice number for this user
  await db
    .update(settings)
    .set({ nextInvoiceNumber: sql`${settings.nextInvoiceNumber} + 1` })
    .where(eq(settings.userId, userId));

  revalidatePath("/dashboard/invoices");
  redirect(`/dashboard/invoices/${invoice.id}`);
}

export async function updateInvoiceStatus(id: string, status: "draft" | "sent" | "paid") {
  const userId = await requireUserId();

  await db
    .update(invoices)
    .set({
      status,
      paidAt: status === "paid" ? new Date() : null,
    })
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${id}`);
}

export async function deleteInvoice(id: string) {
  const userId = await requireUserId();

  await db
    .delete(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

  revalidatePath("/dashboard/invoices");
}