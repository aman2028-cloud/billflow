"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createClient(formData: FormData) {
  const userId = await requireUserId();

  await db.insert(clients).values({
    userId,
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    company: (formData.get("company") as string) || null,
    address: (formData.get("address") as string) || null,
    phone: (formData.get("phone") as string) || null,
  });

  revalidatePath("/dashboard/clients");
}

export async function updateClient(id: string, formData: FormData) {
  const userId = await requireUserId();

  await db
    .update(clients)
    .set({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: (formData.get("company") as string) || null,
      address: (formData.get("address") as string) || null,
      phone: (formData.get("phone") as string) || null,
    })
    .where(and(eq(clients.id, id), eq(clients.userId, userId)));

  revalidatePath("/dashboard/clients");
}

export async function deleteClient(id: string) {
  const userId = await requireUserId();

  await db
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, userId)));

  revalidatePath("/dashboard/clients");
}