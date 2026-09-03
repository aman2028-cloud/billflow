import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-semibold text-lg">BillFlow</span>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-gray-600 hover:text-black">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Invoicing that doesn't feel like a spreadsheet.
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          Create professional invoices, send them with a link, and know
          instantly who's paid and who's overdue. Built for freelancers and
          small studios who are done with Word docs.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-black text-white px-6 py-3 rounded-lg font-medium"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="border border-gray-300 px-6 py-3 rounded-lg font-medium"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-3 gap-6">
          <FeatureCard
            title="Line-item invoices"
            desc="Add any number of line items, apply tax and discounts, and totals calculate themselves."
          />
          <FeatureCard
            title="Client-friendly links"
            desc="Clients view and pay invoices from a link — no account, no login, no friction."
          />
          <FeatureCard
            title="Always know your status"
            desc="See what's paid, outstanding, and overdue at a glance, with income tracked over time."
          />
          <FeatureCard
            title="Your brand, not ours"
            desc="Add your business name, logo, currency, and invoice numbering — it shows on every invoice."
          />
          <FeatureCard
            title="Search and filter"
            desc="Find any invoice instantly by client, status, or invoice number."
          />
          <FeatureCard
            title="Print or download"
            desc="Every invoice can be printed or saved as a PDF in one click."
          />
        </div>
      </section>

      {/* CTA footer */}
      <section className="border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold mb-3">
            Send your first invoice in under 5 minutes.
          </h2>
          <Link
            href="/signup"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium mt-4"
          >
            Create your free account
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        BillFlow — built as a technical assessment project.
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 rounded-xl border border-gray-100">
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}