export default function ProductDetailLoading() {
  return (
    <div className="product-container">
      <div className="flex gap-12 flex-col xl:flex-row">
        {/* Image Section Skeleton */}
        <div className="product-image">
          <div className="w-full h-[400px] sm:h-[500px] bg-gray-200 rounded-2xl animate-pulse" />
        </div>

        {/* Info Section Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-5 pb-6">
            <div className="flex flex-col gap-3 w-full">
              {/* Title Skeleton */}
              <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2" />
              
              {/* Link Skeleton */}
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mt-2" />
            </div>
          </div>

          {/* Price Section Skeleton */}
          <div className="flex items-center flex-wrap gap-10 py-6 border-y border-gray-200">
            <div className="flex flex-col gap-2">
              <div className="h-10 bg-gray-200 rounded animate-pulse w-40" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
            </div>
            <div className="flex gap-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-28" />
            </div>
          </div>

          {/* Price Info Cards Skeleton */}
          <div className="my-7 flex flex-col gap-5">
            <div className="flex gap-5 flex-wrap">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 min-w-[140px] h-24 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Buttons Skeleton */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-40" />
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-32" />
          </div>
        </div>
      </div>

      {/* Price History Chart Skeleton */}
      <div className="mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="h-7 bg-gray-200 rounded animate-pulse w-40" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mt-2" />
          </div>
          
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-4 bg-gray-50/50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-24 mx-auto mt-2" />
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="px-6 pb-6 pt-4">
            <div className="h-72 sm:h-80 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Similar Products Skeleton */}
      <div className="py-14 flex flex-col gap-2 w-full">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
        <div className="flex flex-wrap gap-10 mt-7 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 min-w-[200px] max-w-[280px] h-[350px] bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
