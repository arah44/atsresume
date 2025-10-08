import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container p-6 mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Resume Cards Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex gap-2 items-start">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-8 w-8 shrink-0" />
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-56" />
              <div className="pt-2 border-t">
                <Skeleton className="h-4 w-40" />
              </div>
            </CardContent>

            <CardFooter className="gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

