import React from "react"

export default function CheckpointCard({ checkpoint }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-4">
      <div className="font-semibold text-[var(--color-foreground)]">
        {checkpoint.name || "Checkpoint Name"}
      </div>
      <div className="text-sm text-[var(--color-muted)] mt-1">
        Status: {checkpoint.status || "Unknown"}
      </div>
      <div className="text-xs text-[var(--color-muted)] mt-2">
        {checkpoint.meta || "No metadata"}
      </div>
    </div>
  )
}
