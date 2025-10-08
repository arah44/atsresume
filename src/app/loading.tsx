import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="container mx-auto px-6 py-20 space-y-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Skeleton className="h-16 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6 mx-auto" />
          <div className="flex justify-center gap-4 pt-6">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </section>

      {/* Content Sections Skeleton */}
      {[...Array(4)].map((_, i) => (
        <section key={i} className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-12 w-2/3 mx-auto" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}

