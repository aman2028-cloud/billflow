"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-md">
        We couldn't load this page. Please try again.
      </p>
      <button
        onClick={reset}
        className="bg-black text-white px-4 py-2 rounded-lg text-sm"
      >
        Try again
      </button>
    </div>
  );
}