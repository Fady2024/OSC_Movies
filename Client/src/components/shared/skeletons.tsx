import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function MovieCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border border-border/60", className)}>
      <Skeleton className="aspect-[2/3] w-full rounded-none" />
      <div className="flex flex-1 flex-col p-4 gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-2 h-8 w-full" />
      </div>
    </div>
  );
}

export function MovieGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}
