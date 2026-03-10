export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="h-4 w-28 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-9 w-16 bg-gray-200 rounded-lg animate-pulse mt-2" />
            </div>
          ))}
        </div>

        {/* Products List Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-6 w-28 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          {/* Product Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Image Skeleton */}
                <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                
                {/* Content Skeleton */}
                <div className="p-4">
                  <div className="h-4 w-full bg-gray-200 rounded-lg animate-pulse mb-2" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded-lg animate-pulse mb-3" />
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-6 w-20 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-16 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                  
                  <div className="h-8 w-full bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
