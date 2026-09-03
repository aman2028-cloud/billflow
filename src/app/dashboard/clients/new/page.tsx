import { createClient } from "../actions";
import { redirect } from "next/navigation";

export default function NewClientPage() {
  async function action(formData: FormData) {
    "use server";
    await createClient(formData);
    redirect("/dashboard/clients");
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Add client</h1>
      <form action={action} className="space-y-4 bg-white p-6 rounded-xl border border-gray-100">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input name="name" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input name="email" type="email" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Company</label>
          <input name="company" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input name="phone" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <textarea name="address" rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-black text-white text-sm px-4 py-2 rounded-lg">
          Save client
        </button>
      </form>
    </div>
  );
}