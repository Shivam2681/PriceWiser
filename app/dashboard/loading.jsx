export default function DashboardLoading() {
  return (
    <div>
      {/* Header Skeleton */}
      <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
      <div className="h-5 w-72 bg-gray-200 rounded-lg animate-pulse mb-8" />

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 w-28 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-9 w-16 bg-gray-200 rounded-lg animate-pulse mt-2" />
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse mb-4" />
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <div className="h-12 w-40 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-12 w-36 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
