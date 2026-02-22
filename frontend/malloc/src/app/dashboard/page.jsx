"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import SessionCard from "../components/SessionCard"

export default function SessionsPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("http://localhost:6969/sessions?page=0")
        if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.status}`)
        const data = await res.json()
        setSessions(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-6">
          Sessions
        </h1>

        {loading && <div>Loading sessions...</div>}
        {error && <div className="text-red-500">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading &&
            !error &&
            sessions.map((session) => (
              <Link key={session.id} to={`/dashboard/${session.id}`}>
                <SessionCard session={session} />
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
