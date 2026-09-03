export default function Loading() {
  return (
    <div className="p-8 space-y-4">
      <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
      <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
      <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  );
}