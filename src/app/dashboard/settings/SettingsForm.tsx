"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "./actions";

type Settings = {
  businessName: string | null;
  currency: string;
  invoicePrefix: string;
  logoUrl: string | null;
} | undefined;

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [logoPreview, setLogoPreview] = useState(settings?.logoUrl || "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1_000_000) {
      alert("Please choose an image under 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(formData: FormData) {
    formData.set("logoUrl", logoPreview);
    startTransition(async () => {
      await updateSettings(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-100">
      <div>
        <label className="block text-sm font-medium mb-1">Business name</label>
        <input
          name="businessName"
          defaultValue={settings?.businessName ?? ""}
          placeholder="Acme Studio"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Logo</label>
        <div className="flex items-center gap-4">
          {logoPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoPreview} alt="Logo preview" className="h-12 object-contain border border-gray-100 rounded-lg p-1" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="text-sm"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">PNG or JPG, under 1MB.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Currency</label>
        <select
          name="currency"
          defaultValue={settings?.currency ?? "USD"}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="INR">INR (₹)</option>
          <option value="CAD">CAD ($)</option>
          <option value="AUD">AUD ($)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Invoice number prefix</label>
        <input
          name="invoicePrefix"
          defaultValue={settings?.invoicePrefix ?? "INV"}
          placeholder="INV"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          E.g. "INV" produces invoice numbers like INV-0001.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-black text-white text-sm px-6 py-2.5 rounded-lg disabled:opacity-50"
      >
        {isPending ? "Saving..." : saved ? "Saved ✓" : "Save settings"}
      </button>
    </form>
  );
}