import React from "react"

export default function SessionCard({ session }) {
  return (
    <div className="cursor-pointer rounded-xl border border-[var(--color-border)] p-4 hover:shadow-md transition">
      <div className="font-bold text-[var(--color-foreground)]">
        {session.user || "Unknown User"}
      </div>
      <div className="text-sm text-[var(--color-muted)] mt-1">
        {session.login_time
          ? new Date(session.login_time).toLocaleString()
          : "No login time"}
      </div>
    </div>
  )
}
