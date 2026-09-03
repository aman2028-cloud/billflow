"use client";

import { useState, useTransition } from "react";
import { createInvoice } from "../actions";

type Client = { id: string; name: string; company: string | null };

type LineItem = { description: string; quantity: number; rate: number };

export default function NewInvoiceForm({ clients }: { clients: Client[] }) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [taxPercent, setTaxPercent] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, rate: 0 },
  ]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, rate: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxPercent) / 100;
  const total = afterDiscount + taxAmount;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!clientId) return setError("Select a client");
    if (!dueDate) return setError("Set a due date");
    if (items.some((i) => !i.description.trim())) {
      return setError("Every line item needs a description");
    }

    startTransition(async () => {
      try {
        await createInvoice({
          clientId,
          dueDate,
          notes,
          taxPercent,
          discountPercent,
          lineItems: items,
        });
      } catch {
        setError("Something went wrong. Try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Client *</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `(${c.company})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Due date *</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h2 className="font-medium mb-4">Line items</h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
                className="col-span-6 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
                className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Rate"
                value={item.rate}
                onChange={(e) => updateItem(i, "rate", parseFloat(e.target.value) || 0)}
                className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <div className="col-span-1 text-sm text-gray-500 text-right">
                {(item.quantity * item.rate).toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="col-span-1 text-red-600 text-sm"
                disabled={items.length === 1}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-4 text-sm text-black underline"
        >
          + Add line item
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tax (%)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={taxPercent}
            onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Discount (%)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-1 text-sm max-w-sm ml-auto">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Discount</span>
          <span>-{discountAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Tax</span>
          <span>+{taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-100">
          <span>Total</span>
          <span>{total.toFixed(2)}</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="bg-black text-white text-sm px-6 py-2.5 rounded-lg disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create invoice"}
      </button>
    </form>
  );
}