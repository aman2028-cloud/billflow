export function calculateTotals(
  lineItems: { quantity: number; rate: number }[],
  taxPercent: number,
  discountPercent: number
) {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxPercent) / 100;
  const total = afterDiscount + taxAmount;

  return {
    subtotal: round(subtotal),
    discountAmount: round(discountAmount),
    taxAmount: round(taxAmount),
    total: round(total),
  };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

// Computes the *effective* status — treats a "sent" invoice past its due date as overdue,
// without needing a cron job to update the DB.
export function effectiveStatus(
  status: string,
  dueDate: Date | string,
  paidAt: Date | string | null
): "draft" | "sent" | "paid" | "overdue" {
  if (status === "paid" || paidAt) return "paid";
  if (status === "draft") return "draft";
  const due = new Date(dueDate);
  if (due < new Date()) return "overdue";
  return "sent";
}