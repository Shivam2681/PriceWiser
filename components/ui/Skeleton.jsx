export function ProductCardSkeleton() {
  return (
    <div className="sm:w-[292px] sm:max-w-[292px] w-full flex-1 flex flex-col gap-4 rounded-md animate-pulse">
      <div className="flex-1 relative flex flex-col gap-5 p-4 rounded-md bg-gray-200">
        <div className="h-[250px] bg-gray-300 rounded-md"></div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="product-container animate-pulse">
      <div className="flex gap-28 xl:flex-row flex-col">
        <div className="product-image bg-gray-200">
          <div className="h-[400px] bg-gray-300 rounded"></div>
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="flex gap-4 mt-4">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchbarSkeleton() {
  return (
    <div className="flex flex-wrap gap-4 mt-12 animate-pulse">
      <div className="flex-1 min-w-[200px] w-full h-12 bg-gray-200 rounded-lg"></div>
      <div className="h-12 w-24 bg-gray-200 rounded-lg"></div>
    </div>
  );
}
