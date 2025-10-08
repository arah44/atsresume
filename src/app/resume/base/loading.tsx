import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Form Skeleton */}
      <div className="w-1/2 p-6 space-y-6 overflow-y-auto border-r">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-32" />
          ))}
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}

          {/* Repeatable Sections */}
          <div className="space-y-4 pt-6 border-t">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-9 w-32" />
            </div>
            {[...Array(2)].map((_, index) => (
              <div key={index} className="p-4 space-y-4 border rounded-lg">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Right Panel - Preview Skeleton */}
      <div className="w-1/2 bg-muted/30 p-8">
        <div className="max-w-[8.5in] mx-auto bg-white shadow-lg">
          {/* Resume Preview Skeleton */}
          <div className="p-12 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3 pb-4 border-b">
              <Skeleton className="h-10 w-64 mx-auto" />
              <Skeleton className="h-6 w-48 mx-auto" />
              <div className="flex justify-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Summary Section */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Experience Section */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              {[...Array(2)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>

            {/* Skills Section */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <div className="flex flex-wrap gap-2">
                {[...Array(8)].map((_, index) => (
                  <Skeleton key={index} className="h-6 w-24" />
                ))}
              </div>
            </div>

            {/* Education Section */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              {[...Array(2)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

