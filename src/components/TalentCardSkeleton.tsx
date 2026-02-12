import { Skeleton } from '@/components/ui/skeleton';

export const TalentCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-brand border border-navy/5">
      {/* Avatar Skeleton */}
      <div className="relative h-32 bg-gradient-to-br from-navy to-navy/80 flex items-center justify-center">
        <Skeleton className="w-20 h-20 bg-white/10 rounded-full" />
        <div className="absolute bottom-4 left-4 right-4">
          <Skeleton className="h-5 w-3/4 bg-white/20" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-5">
        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Expertise Skeleton */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />

        {/* Achievements Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-3 w-32 mb-2" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-2/3" />
        </div>

        {/* Footer Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
};
