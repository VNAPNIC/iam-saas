'use client';

export default function TenantLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          {/* Header skeleton */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="ml-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
            </div>
          </div>

          {/* Form skeleton */}
          <div className="space-y-4">
            <div>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-16"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-20"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Footer skeleton */}
          <div className="mt-6 text-center">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}