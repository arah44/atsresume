export default function JobDetailsLoading() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-muted rounded-md animate-pulse shrink-0" />
        <div className="h-8 bg-muted rounded-md animate-pulse w-48" />
      </div>

      {/* Job Header Card Skeleton */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 bg-muted rounded-lg animate-pulse shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-7 bg-muted rounded-md animate-pulse w-3/4" />
            <div className="h-5 bg-muted rounded-md animate-pulse w-1/2" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-5 bg-muted rounded-md animate-pulse w-32" />
          <div className="h-5 bg-muted rounded-md animate-pulse w-24" />
        </div>
      </div>

      {/* Control Panel Skeleton */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded-md animate-pulse w-32" />
          <div className="h-4 bg-muted rounded-md animate-pulse w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-11 bg-muted rounded-md animate-pulse" />
          <div className="h-11 bg-muted rounded-md animate-pulse" />
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="h-6 bg-muted rounded-md animate-pulse w-40" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded-md animate-pulse w-full" />
          <div className="h-4 bg-muted rounded-md animate-pulse w-full" />
          <div className="h-4 bg-muted rounded-md animate-pulse w-3/4" />
        </div>
      </div>
    </div>
  );
}

