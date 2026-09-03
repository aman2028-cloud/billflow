import { db } from "@/db";
import { clients } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import NewInvoiceForm from "./NewInvoiceForm";

export default async function NewInvoicePage() {
  const session = await auth();
  const userId = session!.user!.id;

  const userClients = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, userId))
    .orderBy(clients.name);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">New invoice</h1>
      {userClients.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-gray-100 text-gray-500">
          You need at least one client before creating an invoice.{" "}
          <a href="/dashboard/clients/new" className="text-black underline">
            Add a client
          </a>
        </div>
      ) : (
        <NewInvoiceForm clients={userClients} />
      )}
    </div>
  );
}