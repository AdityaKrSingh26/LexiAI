import { Skeleton } from '@/components/ui/skeleton';

const DocumentCardSkeleton = ({ viewMode = 'grid' }) => (
  <div className={`rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4 ${
    viewMode === 'list' ? 'flex items-center gap-3' : ''
  }`}>
    <Skeleton className="w-8 h-8 rounded-lg bg-zinc-800 shrink-0" />
    <div className={viewMode === 'list' ? 'flex-1 flex items-center gap-4' : 'mt-3 space-y-2'}>
      <Skeleton className={`h-3.5 bg-zinc-800 rounded ${viewMode === 'list' ? 'flex-1 max-w-xs' : 'w-3/4'}`} />
      <Skeleton className={`h-3 bg-zinc-800 rounded ${viewMode === 'list' ? 'w-16' : 'w-1/2'}`} />
    </div>
  </div>
);

const DocumentGridSkeleton = ({ viewMode = 'grid', count = 8 }) => (
  <div className={`grid gap-3 ${
    viewMode === 'grid'
      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      : 'grid-cols-1'
  }`}>
    {Array.from({ length: count }).map((_, i) => (
      <DocumentCardSkeleton key={i} viewMode={viewMode} />
    ))}
  </div>
);

const AnalyticsCardsSkeleton = () => (
  <div className="grid grid-cols-3 gap-4 mb-8">
    {[0, 1, 2].map((i) => (
      <div key={i} className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-5">
        <Skeleton className="h-3 w-20 bg-zinc-800 rounded mb-3" />
        <Skeleton className="h-7 w-16 bg-zinc-800 rounded" />
      </div>
    ))}
  </div>
);

export { DocumentCardSkeleton, DocumentGridSkeleton, AnalyticsCardsSkeleton };
