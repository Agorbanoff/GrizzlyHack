"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Navbar from "../../../components/Navbar"

export default function SessionDetailsPage() {
  const { id } = useParams()
  const [checkpoints, setCheckpoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCheckpoints = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(
          `http://localhost:6969/checkpoints/${id}?page=0`,
          {
            cache: "no-store",
            credentials: "include",
          }
        )

        if (!res.ok) throw new Error("Failed to fetch checkpoints")

        const data = await res.json()
        setCheckpoints(data.content ?? [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchCheckpoints()
  }, [id])

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
        <Link
          href="/dashboard"
          className="text-(--color-primary) mb-4 inline-block"
        >
          ← Back to sessions
        </Link>

        <h1 className="text-3xl font-semibold mb-6">
          Session {id} Checkpoints
        </h1>

        {loading && <div>Loading checkpoints...</div>}
        {error && <div className="text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="space-y-6">
            {checkpoints.map((checkpoint) => (
              <Link
                key={checkpoint.id}
                href={`/dashboard/${id}/${checkpoint.id}`}
                className="block p-6 rounded-xl border border-(--color-border) hover:bg-(--color-muted) transition"
              >
                <div className="font-semibold mb-2">
                  {formatDateTime(checkpoint.timestamp)}
                </div>

                <div className="text-sm">
                  {checkpoint.description}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}