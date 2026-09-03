import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-bold mb-2">404</h1>
      <p className="text-gray-500 mb-6">This page doesn't exist.</p>
      <Link href="/" className="bg-black text-white px-4 py-2 rounded-lg text-sm">
        Go home
      </Link>
    </div>
  );
}