import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { updateClient } from "../../actions";
import { redirect, notFound } from "next/navigation";

// simple UUID v4-ish check — good enough to gate against garbage input
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const session = await auth();
  const userId = session!.user!.id;

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1);

  if (!client || client.userId !== userId) notFound();

  async function action(formData: FormData) {
    "use server";
    await updateClient(id, formData);
    redirect("/dashboard/clients");
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Edit client</h1>
      <form action={action} className="space-y-4 bg-white p-6 rounded-xl border border-gray-100">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input name="name" required defaultValue={client.name} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input name="email" type="email" required defaultValue={client.email} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Company</label>
          <input name="company" defaultValue={client.company ?? ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input name="phone" defaultValue={client.phone ?? ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <textarea name="address" rows={2} defaultValue={client.address ?? ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-black text-white text-sm px-4 py-2 rounded-lg">
          Save changes
        </button>
      </form>
    </div>
  );
}