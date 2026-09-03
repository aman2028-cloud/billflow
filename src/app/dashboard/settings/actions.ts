"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function updateSettings(formData: FormData) {
  const userId = await requireUserId();

  const businessName = formData.get("businessName") as string;
  const currency = formData.get("currency") as string;
  const invoicePrefix = formData.get("invoicePrefix") as string;
  const logoUrl = formData.get("logoUrl") as string;

  await db
    .update(settings)
    .set({
      businessName: businessName || null,
      currency: currency || "USD",
      invoicePrefix: invoicePrefix || "INV",
      logoUrl: logoUrl || null,
    })
    .where(eq(settings.userId, userId));

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
}