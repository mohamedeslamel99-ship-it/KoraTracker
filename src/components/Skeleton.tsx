import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer bg-gradient-to-r from-zinc-800/10 via-zinc-700/20 to-zinc-800/10 bg-[length:200%_100%] rounded-md",
        className
      )}
    />
  );
}