"use client"

import { useState, useEffect } from "react"
import Navbar from "../../../components/Navbar"


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
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <Navbar />

      <div className="flex items-center justify-center px-6 py-12">
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
    </div>
  )
}
