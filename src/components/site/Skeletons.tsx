import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function CardGridSkeleton({ count = 6, className = "grid md:grid-cols-2 lg:grid-cols-3 gap-5" }) {
  return (
    <div className={className} aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="space-y-3 p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </Card>
      ))}
    </div>
  );
}

export function GalleryGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-2xl" />
      ))}
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="container-x space-y-6 py-20" aria-busy="true">
      <Skeleton className="mx-auto h-4 w-32" />
      <Skeleton className="mx-auto h-9 w-72" />
      <CardGridSkeleton />
    </div>
  );
}
