"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "../../components/Navbar"

export default function SessionsPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("http://localhost:6969/sessions?page=0", {
          cache: "no-store",
          credentials: "include",
        })

        if (!res.ok) throw new Error("Failed to fetch sessions")

        const data = await res.json()
        setSessions(data.content)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const formatDateTime = (iso) =>
    new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div className="min-h-screen bg-(--color-background) text-(--color-foreground)">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-(--color-primary) mb-6">
          Sessions
        </h1>

        {loading && <div>Loading sessions...</div>}
        {error && <div className="text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/dashboard/${session.id}`}
                className="block p-6 rounded-xl border border-(--color-border) hover:bg-(--color-muted) transition"
              >
                <div className="text-lg font-semibold">
                  Session #{session.id}
                </div>

                <div className="mt-2 text-sm text-(--color-muted-foreground)">
                  {formatDateTime(session.sessionStart)} <br />
                  to <br />
                  {formatDateTime(session.sessionEnd)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}