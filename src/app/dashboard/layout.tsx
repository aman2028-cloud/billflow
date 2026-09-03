import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-gray-200 bg-white p-4 flex md:flex-col items-center md:items-stretch justify-between md:justify-start">
        <div className="font-semibold text-lg md:mb-8">BillFlow</div>
        <nav className="flex md:flex-col gap-1 text-sm">
          <Link href="/dashboard" className="px-3 py-2 rounded-lg hover:bg-gray-100">
            Dashboard
          </Link>
          <Link href="/dashboard/clients" className="px-3 py-2 rounded-lg hover:bg-gray-100">
            Clients
          </Link>
          <Link href="/dashboard/invoices" className="px-3 py-2 rounded-lg hover:bg-gray-100">
            Invoices
          </Link>
          <Link href="/dashboard/settings" className="px-3 py-2 rounded-lg hover:bg-gray-100">
            Settings
          </Link>
        </nav>
        <div className="hidden md:block mt-auto pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 truncate">{session.user?.email}</p>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-x-auto">{children}</main>
    </div>
  );
}