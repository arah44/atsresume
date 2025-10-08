import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container p-6 mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-5 w-64" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Resume Preview */}
      <div className="bg-muted/30 p-8 rounded-lg">
        <div className="max-w-[8.5in] mx-auto bg-white shadow-lg">
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
              {[...Array(3)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>

            {/* Skills Section */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <div className="flex flex-wrap gap-2">
                {[...Array(12)].map((_, index) => (
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

            {/* Certifications Section */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              {[...Array(2)].map((_, index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 space-y-4 border rounded-lg">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <div className="p-6 space-y-4 border rounded-lg">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

