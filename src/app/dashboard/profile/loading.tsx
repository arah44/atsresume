import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container p-6 mx-auto max-w-4xl space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Profile Form Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form fields */}
          {[...Array(8)].map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}

          {/* Work Experience Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-9 w-40" />
            </div>
            {[...Array(2)].map((_, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Education Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-9 w-40" />
            </div>
            {[...Array(2)].map((_, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Skills Section */}
          <div className="space-y-4 pt-4 border-t">
            <Skeleton className="h-6 w-32" />
            <div className="flex flex-wrap gap-2">
              {[...Array(12)].map((_, index) => (
                <Skeleton key={index} className="h-8 w-24" />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

