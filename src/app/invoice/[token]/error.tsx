"use client";

export default function Error() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-xl font-semibold mb-2">Invoice not available</h2>
      <p className="text-gray-500 text-sm">
        This invoice link may be invalid or no longer exists.
      </p>
    </div>
  );
}