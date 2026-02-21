function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--color-border)]/60 ${className}`}
    />
  )
}

function SessionCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <div className="h-40 w-full bg-[var(--color-border)]/50 animate-pulse" />

      <div className="p-4">
        <Skeleton className="h-4 w-44" />

        <div className="mt-3 flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        <Skeleton className="mt-3 h-4 w-28" />
      </div>
    </div>
  )
}

export default function SessionsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold text-[var(--color-foreground)]">
            Sessions
          </div>
          <div className="mt-1 text-sm text-[var(--color-muted)]">
            Your sessions will appear here.
          </div>
        </div>

        <button
          type="button"
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-primary-soft)] px-4 py-2 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-primary-soft)]/80"
        >
          Filter
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SessionCardSkeleton />
        <SessionCardSkeleton />
        <SessionCardSkeleton />
        <SessionCardSkeleton />
        <SessionCardSkeleton />
        <SessionCardSkeleton />
        <SessionCardSkeleton />
        <SessionCardSkeleton />
        <SessionCardSkeleton />
      </div>
    </div>
  )
}