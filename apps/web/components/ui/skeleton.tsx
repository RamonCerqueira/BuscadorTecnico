import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      style={style}
      className={cn(
        'animate-pulse rounded-xl bg-slate-200 dark:bg-white/5',
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#111] overflow-hidden">
      <Skeleton className="h-48 rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${100 - i * 15}%` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <Skeleton
      className="rounded-full shrink-0"
      style={{ width: size, height: size } as React.CSSProperties}
    />
  );
}

export function SkeletonTicketDetail() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center gap-4">
        <SkeletonAvatar size={48} />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-48 w-full" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}
