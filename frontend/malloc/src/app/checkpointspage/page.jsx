function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--color-border)]/60 ${className}`}
    />
  )
}

function CheckpointCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <div className="h-44 w-full bg-[var(--color-border)]/50 animate-pulse" />
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-3 w-20" />
      </div>
    </div>
  )
}

export default function SessionDetailsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)]">
        <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
        <span>Back to sessions</span>
      </div>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold text-[var(--color-foreground)]">
            Session details
          </div>
          <div className="mt-1 text-sm text-[var(--color-muted)]">
            Checkpoints will appear here.
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-primary-soft)] px-3 py-1 text-xs text-[var(--color-foreground)]">
              Status
            </span>
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-muted)]">
              Meta
            </span>
          </div>
        </div>

      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CheckpointCardSkeleton />
        <CheckpointCardSkeleton />
        <CheckpointCardSkeleton />
        <CheckpointCardSkeleton />
        <CheckpointCardSkeleton />
        <CheckpointCardSkeleton />
        <CheckpointCardSkeleton />
        <CheckpointCardSkeleton />
        <CheckpointCardSkeleton />
      </div>
    </div>
  )
}