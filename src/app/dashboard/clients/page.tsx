import { auth } from "@/auth";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import DeleteClientButton from "./DeleteClientButton";

export default async function ClientsPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const userClients = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, userId))
    .orderBy(clients.name);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Link
          href="/dashboard/clients/new"
          className="bg-black text-white text-sm px-4 py-2 rounded-lg"
        >
          Add client
        </Link>
      </div>

      {userClients.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-100">
          <p>No clients yet.</p>
          <Link href="/dashboard/clients/new" className="text-black underline text-sm">
            Add your first client
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {userClients.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.company || "—"}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={`/dashboard/clients/${c.id}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteClientButton id={c.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}