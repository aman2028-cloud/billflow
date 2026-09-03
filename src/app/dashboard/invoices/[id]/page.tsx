import { db } from "@/db";
import { invoices, lineItems, clients, settings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { effectiveStatus, calculateTotals } from "@/lib/invoice-utils";
import InvoiceActions from "./InvoiceActions";

// simple UUID v4-ish check — good enough to gate against garbage input
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_RE.test(id)) notFound();

  const session = await auth();
  const userId = session!.user!.id;

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
    .limit(1);

  if (!invoice) notFound();

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, invoice.clientId))
    .limit(1);

  const items = await db
    .select()
    .from(lineItems)
    .where(eq(lineItems.invoiceId, id))
    .orderBy(lineItems.sortOrder);

  const [userSettings] = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, userId))
    .limit(1);

  const status = effectiveStatus(invoice.status, invoice.dueDate, invoice.paidAt);
  const totals = calculateTotals(
    items.map((i) => ({ quantity: Number(i.quantity), rate: Number(i.rate) })),
    Number(invoice.taxPercent),
    Number(invoice.discountPercent)
  );

  const currency = userSettings?.currency || "USD";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h1 className="text-2xl font-semibold">Invoice {invoice.invoiceNumber}</h1>
        <InvoiceActions
          invoiceId={invoice.id}
          shareToken={invoice.shareToken}
          currentStatus={invoice.status}
        />
      </div>

      <div
        id="invoice-print-area"
        className="bg-white p-10 rounded-xl border border-gray-100 max-w-3xl mx-auto print:border-0 print:shadow-none print:rounded-none"
      >
        <div className="flex justify-between items-start mb-10">
          <div>
            {userSettings?.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userSettings.logoUrl} alt="Logo" className="h-12 mb-3 object-contain" />
            )}
            <h2 className="text-xl font-semibold">
              {userSettings?.businessName || "Your Business"}
            </h2>
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold uppercase text-gray-800">Invoice</h3>
            <p className="text-sm text-gray-500">#{invoice.invoiceNumber}</p>
            <span
              className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[status]}`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Billed to</p>
            <p className="font-medium">{client?.name}</p>
            {client?.company && <p>{client.company}</p>}
            <p>{client?.email}</p>
            {client?.address && <p className="whitespace-pre-line">{client.address}</p>}
          </div>
          <div className="text-right">
            <p>
              <span className="text-gray-500">Issue date: </span>
              {new Date(invoice.issueDate).toLocaleDateString()}
            </p>
            <p>
              <span className="text-gray-500">Due date: </span>
              {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right">Rate</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{Number(item.quantity)}</td>
                <td className="py-2 text-right">{fmt(Number(item.rate))}</td>
                <td className="py-2 text-right">
                  {fmt(Number(item.quantity) * Number(item.rate))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-64 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{fmt(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">
                Discount ({Number(invoice.discountPercent)}%)
              </span>
              <span>-{fmt(totals.discountAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tax ({Number(invoice.taxPercent)}%)</span>
              <span>+{fmt(totals.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{fmt(totals.total)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="text-sm border-t border-gray-100 pt-4">
            <p className="text-gray-500 mb-1">Notes</p>
            <p className="whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}