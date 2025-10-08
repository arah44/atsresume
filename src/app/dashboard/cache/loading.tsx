import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container p-6 mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cache Items Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-2 border-b">
              <Skeleton className="h-4 w-24 col-span-3" />
              <Skeleton className="h-4 w-20 col-span-2" />
              <Skeleton className="h-4 w-20 col-span-2" />
              <Skeleton className="h-4 w-20 col-span-2" />
              <Skeleton className="h-4 w-16 col-span-2" />
              <Skeleton className="h-4 w-16 col-span-1" />
            </div>

            {/* Table Rows */}
            {[...Array(10)].map((_, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center py-3 border-b">
                <Skeleton className="h-4 w-full col-span-3" />
                <Skeleton className="h-4 w-16 col-span-2" />
                <Skeleton className="h-4 w-20 col-span-2" />
                <Skeleton className="h-4 w-24 col-span-2" />
                <Skeleton className="h-4 w-12 col-span-2" />
                <Skeleton className="h-8 w-8 col-span-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

