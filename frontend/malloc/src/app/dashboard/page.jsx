"use client"

import { useEffect, useState } from "react"

function SessionCard({ session }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-md transition hover:border-[var(--color-primary)]/50 hover:shadow-lg">
      <div className="text-sm text-[var(--color-muted)]">
        Login: {new Date(session.login_time).toLocaleString()}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-lg font-semibold">
          {session.logout_time ? "Completed Session" : "Active Session"}
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            session.logout_time
              ? "bg-[var(--color-border)] text-[var(--color-muted)]"
              : "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
          }`}
        >
          {session.logout_time ? "Offline" : "Online"}
        </div>
      </div>

      {session.logout_time && (
        <div className="mt-3 text-sm text-[var(--color-muted)]">
          Logout: {new Date(session.logout_time).toLocaleString()}
        </div>
      )}
    </div>
  )
}

export default function SessionsPage() {
  const [expanded, setExpanded] = useState(false)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
  const fetchSessions = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:6969/sessions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`)
      }

      const data = await response.json()
      setSessions(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  fetchSessions()
  }, [])


  const sortedSessions = [...sessions].sort(
    (a, b) =>
      new Date(b.login_time).getTime() - new Date(a.login_time).getTime()
  )

  const latestSession = sortedSessions[0]
  const olderSessions = sortedSessions.slice(1)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-6 py-12">
      <div className="w-full max-w-3xl text-center">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 shadow-xl">
          <h1 className="text-4xl font-bold text-[var(--color-primary)]">
            Sessions
          </h1>
          <p className="mt-3 text-base text-[var(--color-muted)]">
            Your latest activity is shown below.
          </p>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-[var(--color-primary)]/40" />
        </div>

        <div className="mt-10 flex flex-col gap-6 text-left">
          {loading && (
            <div className="text-center text-[var(--color-muted)]">
              Loading sessions...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500">{error}</div>
          )}

          {!loading && latestSession && (
            <div className="rounded-2xl ring-2 ring-[var(--color-primary)]/40">
              <SessionCard session={latestSession} />
            </div>
          )}

          {!loading &&
            expanded &&
            olderSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
        </div>

        {!loading && olderSessions.length > 0 && (
          <div className="mt-10">
            <button
              onClick={() => setExpanded(!expanded)}
              className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-primary-hover)] cursor-pointer"
            >
              {expanded ? "Hide previous sessions" : "Show previous sessions"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
