# BillFlow

BillFlow is a simple invoicing app for freelancers. You can sign up, add clients, create invoices with line items, send a shareable link to your client, and track who has paid.

**Live app:** https://billflow-hazel-kappa.vercel.app/

## Demo login

Use this account to log in and see everything already set up (a client and one invoice):

- **Email:** demo@billflow.com
- **Password:** (put the password you used here)

There is already one invoice created for this account. Open it from the Invoices page and click "Copy share link" to see the public invoice page a client would see.

## What I built

- **Landing page** – explains the product, with sign up buttons.
- **Accounts** – sign up, log in, log out. Passwords are hashed with bcrypt. Each user only sees their own data.
- **Clients** – add, edit, delete, and list clients.
- **Invoices** – create an invoice for a client with any number of line items (description, quantity, rate). Tax, discount, and totals are calculated automatically. Each invoice has a status: draft, sent, paid, or overdue.
- **Invoice list** – search by invoice number, filter by status and client, sort by date. All of this filtering happens on the server, not in the browser.
- **Invoice page** – a clean invoice view that can be printed or saved as a PDF using the browser's print option.
- **Sharing** – every invoice gets a private link. Anyone with the link can view (and "pay" in test mode) the invoice without logging in.
- **Public invoice page** – the page a client opens from the link. No account needed. Has a "Pay (test mode)" button that marks the invoice as paid.
- **Dashboard** – shows total earned, total outstanding, total overdue, a chart of income over the last 6 months, and a table of recent invoices.
- **Settings** – business name, logo, currency, and invoice number prefix. All of this shows up on your invoices.
- **Overdue invoices** – if an invoice's due date has passed and it hasn't been paid, it automatically shows as "Overdue" without anyone needing to mark it.
- **Loading, empty, and error states** – every page has something better to show than a blank screen while loading, when there's no data yet, or if something goes wrong.
- **Mobile friendly** – the app works on a phone, with the sidebar turning into a top bar on small screens.

## Tech stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js Server Actions and API routes
- **Database:** PostgreSQL (hosted on Neon)
- **ORM:** Drizzle ORM
- **Auth:** NextAuth (Credentials provider) with bcrypt for password hashing
- **Charts:** Recharts
- **Hosting:** Vercel

## How to run this locally

1. Clone the repo:
   ```bash
   git clone https://github.com/aman2028-cloud/billflow.git
   cd billflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root folder with these values (see the section below for what each one means):
   ```
   DATABASE_URL="your-postgres-connection-string"
   AUTH_SECRET="a-random-secret-string"
   NEXTAUTH_SECRET="same-value-as-AUTH_SECRET"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   You can generate a random secret by running:
   ```bash
   openssl rand -base64 32
   ```

4. Create the database tables:
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

5. (Optional) Add demo data. See "Seed data" below.

6. Start the app:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment variables

| Variable | What it's for |
|---|---|
| `DATABASE_URL` | Connection string for your PostgreSQL database. If you don't have one, [neon.tech](https://neon.tech) has a free tier — sign up, create a project, and copy the connection string. |
| `AUTH_SECRET` | A random string used to encrypt login sessions. Generate one with `openssl rand -base64 32`. |
| `NEXTAUTH_SECRET` | Same value as `AUTH_SECRET` (older versions of the auth library look for this name). |
| `NEXTAUTH_URL` | The URL your app runs on. Use `http://localhost:3000` when running locally, or your live URL when deployed. |

No real keys or secrets are committed in this repo — you need to create your own `.env` file using the steps above.

## Seed data

To quickly get a demo account with a client and invoice already set up:

1. Sign up normally through the app at `/signup`.
2. Add one client from `/dashboard/clients/new`.
3. Create one invoice for that client from `/dashboard/invoices/new`, and mark it as "Sent" from the invoice page.

(This is what was done to set up the demo login above.)

## Database structure

- **users** – account info, hashed passwords
- **settings** – one row per user: business name, logo, currency, invoice number prefix
- **clients** – belongs to a user
- **invoices** – belongs to a user and a client, has a status, dates, tax/discount, and a unique share link token
- **line_items** – belongs to an invoice, has description, quantity, and rate

Migration files that build these tables from an empty database are in the `drizzle/migrations` folder.

## Notes on a few design choices

- **Overdue status** isn't stored directly — it's calculated by comparing an invoice's due date to today, so an invoice becomes "Overdue" automatically without any background job.
- **Payments are simulated.** There's no real payment processor connected. Clicking "Pay" on the public invoice page just marks the invoice as paid, which fits the "test mode" requirement.
- **The public invoice link uses a random token**, separate from the invoice's normal ID, so people can't guess other invoice links.
- **Logo upload** stores the image directly as the file's data (no external file storage service needed), so it works out of the box without extra setup.
