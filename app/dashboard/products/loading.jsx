export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 bg-gray-200 rounded animate-pulse w-40" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-56 mt-2" />
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mt-2" />
              <div className="h-5 bg-gray-200 rounded animate-pulse w-20 mt-3" />
              <div className="h-9 bg-gray-200 rounded animate-pulse w-full mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
