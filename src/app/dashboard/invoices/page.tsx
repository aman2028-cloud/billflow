import { db } from "@/db";
import { invoices, clients } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, ilike, or, desc, asc, SQL } from "drizzle-orm";
import Link from "next/link";
import { effectiveStatus } from "@/lib/invoice-utils";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    clientId?: string;
    sort?: string;
  }>;
}) {
  const session = await auth();
  const userId = session!.user!.id;
  const { q, status, clientId, sort } = await searchParams;

  const userClients = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, userId))
    .orderBy(clients.name);

  // Build WHERE conditions server-side
  const conditions = [eq(invoices.userId, userId)];

  if (clientId) {
    conditions.push(eq(invoices.clientId, clientId));
  }

  if (q) {
    conditions.push(ilike(invoices.invoiceNumber, `%${q}%`));
  }

  // Note: "overdue" isn't a real stored value change — it's computed — so we
  // filter draft/sent/paid directly in SQL, but overdue needs a post-filter below.
  if (status && status !== "overdue" && status !== "all") {
    conditions.push(eq(invoices.status, status as "draft" | "sent" | "paid"));
  }

  let orderBy;
  switch (sort) {
    case "oldest":
      orderBy = asc(invoices.issueDate);
      break;
    case "amount":
      orderBy = desc(invoices.createdAt); // amount requires joining line items; keep simple for now
      break;
    default:
      orderBy = desc(invoices.issueDate);
  }

  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      dueDate: invoices.dueDate,
      issueDate: invoices.issueDate,
      paidAt: invoices.paidAt,
      clientName: clients.name,
      clientId: clients.id,
    })
    .from(invoices)
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .where(and(...conditions))
    .orderBy(orderBy);

  // Apply computed "overdue" filter after fetch, since it's not a stored column value
  const filtered =
    status === "overdue"
      ? rows.filter((r) => effectiveStatus(r.status, r.dueDate, r.paidAt) === "overdue")
      : rows;

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Link
          href="/dashboard/invoices/new"
          className="bg-black text-white text-sm px-4 py-2 rounded-lg"
        >
          New invoice
        </Link>
      </div>

      {/* Filters — a GET form so filtering happens server-side via searchParams */}
      <form className="bg-white p-4 rounded-xl border border-gray-100 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search invoice #</label>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="INV-0001"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-40"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            name="status"
            defaultValue={status || "all"}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Client</label>
          <select
            name="clientId"
            defaultValue={clientId || ""}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All clients</option>
            {userClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sort</label>
          <select
            name="sort"
            defaultValue={sort || "newest"}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <button
          type="submit"
          className="border border-gray-300 text-sm px-4 py-2 rounded-lg"
        >
          Apply
        </button>
        {(q || status || clientId || sort) && (
          <Link href="/dashboard/invoices" className="text-sm text-gray-500 underline">
            Clear
          </Link>
        )}
      </form>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-100">
          <p>No invoices match your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Issue date</th>
                <th className="px-4 py-3">Due date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const st = effectiveStatus(inv.status, inv.dueDate, inv.paidAt);
                return (
                  <tr key={inv.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">{inv.clientName}</td>
                    <td className="px-4 py-3">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[st]}`}
                      >
                        {st}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/invoices/${inv.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}