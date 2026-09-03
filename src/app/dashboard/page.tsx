import { db } from "@/db";
import { invoices, clients, lineItems } from "@/db/schema";
import { auth } from "@/auth";
// import { eq } from "drizzle-orm";
import Link from "next/link";
import { effectiveStatus, calculateTotals } from "@/lib/invoice-utils";
import IncomeChart from "./IncomeChart";
import { eq, inArray } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const allInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.userId, userId));

  const allClients = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, userId));

  const clientMap = new Map(allClients.map((c) => [c.id, c.name]));

  // Fetch all line items for all invoices in one go, group by invoiceId
  const invoiceIds = allInvoices.map((i) => i.id);
const allLineItems = invoiceIds.length
  ? await db.select().from(lineItems).where(inArray(lineItems.invoiceId, invoiceIds))
  : [];
  const itemsByInvoice = new Map<string, typeof allLineItems>();
  for (const item of allLineItems) {
    if (!itemsByInvoice.has(item.invoiceId)) itemsByInvoice.set(item.invoiceId, []);
    itemsByInvoice.get(item.invoiceId)!.push(item);
  }

  let totalEarned = 0;
  let totalOutstanding = 0;
  let totalOverdue = 0;

  const monthlyIncome = new Map<string, number>(); // "2026-01" -> amount

  const enriched = allInvoices.map((inv) => {
    const items = itemsByInvoice.get(inv.id) || [];
    const totals = calculateTotals(
      items.map((i) => ({ quantity: Number(i.quantity), rate: Number(i.rate) })),
      Number(inv.taxPercent),
      Number(inv.discountPercent)
    );
    const status = effectiveStatus(inv.status, inv.dueDate, inv.paidAt);

    if (status === "paid") {
      totalEarned += totals.total;
      const monthKey = new Date(inv.paidAt || inv.issueDate).toISOString().slice(0, 7);
      monthlyIncome.set(monthKey, (monthlyIncome.get(monthKey) || 0) + totals.total);
    } else if (status === "overdue") {
      totalOverdue += totals.total;
      totalOutstanding += totals.total;
    } else if (status === "sent") {
      totalOutstanding += totals.total;
    }

    return {
      ...inv,
      total: totals.total,
      status,
      clientName: clientMap.get(inv.clientId) || "Unknown",
    };
  });

  const recentInvoices = [...enriched]
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);

  // Build last 6 months of chart data, filling in zero for months with no income
  const chartData: { month: string; income: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    chartData.push({
      month: d.toLocaleDateString("en-US", { month: "short" }),
      income: Math.round((monthlyIncome.get(key) || 0) * 100) / 100,
    });
  }

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total earned</p>
          <p className="text-2xl font-semibold text-green-700">{fmt(totalEarned)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Outstanding</p>
          <p className="text-2xl font-semibold text-blue-700">{fmt(totalOutstanding)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Overdue</p>
          <p className="text-2xl font-semibold text-red-700">{fmt(totalOverdue)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 mb-8">
        <h2 className="font-medium mb-4">Income over time</h2>
        <IncomeChart data={chartData} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-medium">Recent invoices</h2>
          <Link href="/dashboard/invoices" className="text-sm text-black underline">
            View all
          </Link>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No invoices yet.</p>
            <Link href="/dashboard/invoices/new" className="text-black underline text-sm">
              Create your first invoice
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="border-t border-gray-100">
                  <td className="px-6 py-3 font-medium">{inv.invoiceNumber}</td>
                  <td className="px-6 py-3">{inv.clientName}</td>
                  <td className="px-6 py-3">{fmt(inv.total)}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[inv.status]}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/dashboard/invoices/${inv.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}