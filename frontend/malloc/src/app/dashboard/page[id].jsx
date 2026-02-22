"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import CheckpointCard from "../components/CheckpointCard"

export default function SessionDetailsPage() {
  const { id } = useParams() // session ID from URL
  const [checkpoints, setCheckpoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCheckpoints = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`http://localhost:6969/checkpoints/${id}?page=0`)
        if (!res.ok) throw new Error(`Failed to fetch checkpoints: ${res.status}`)
        const data = await res.json()
        setCheckpoints(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCheckpoints()
  }, [id])

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link to="/dashboard" className="text-[var(--color-primary)] mb-4 inline-block">
          ← Back to sessions
        </Link>

        <h1 className="text-3xl font-semibold mb-6">Session {id} Details</h1>

        {loading && <div>Loading checkpoints...</div>}
        {error && <div className="text-red-500">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading &&
            !error &&
            checkpoints.map((checkpoint) => (
              <CheckpointCard key={checkpoint.id} checkpoint={checkpoint} />
            ))}
        </div>
      </div>
    </div>
  )
}
