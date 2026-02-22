"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Navbar from "../../../../components/Navbar"

export default function CheckpointDetailsPage() {
    const { id, checkpointId } = useParams()
    const [checkpoint, setCheckpoint] = useState(null)
    const [screenshotIds, setScreenshotIds] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true)
                setError(null)

                const cpRes = await fetch(
                    `http://localhost:6969/checkpoints/${id}?page=0`,
                    { cache: "no-store", credentials: "include" }
                )
                if (!cpRes.ok) throw new Error("Failed to fetch checkpoints")

                const cpData = await cpRes.json()
                const found = (cpData.content ?? []).find(
                    (cp) => String(cp.id) === String(checkpointId)
                )
                if (!found) throw new Error("Checkpoint not found")
                setCheckpoint(found)

                const ssRes = await fetch(
                    `http://localhost:6969/screenshots/all/${checkpointId}`,
                    { cache: "no-store", credentials: "include" }
                )
                if (!ssRes.ok) throw new Error("Failed to fetch screenshots list")

                const ssData = await ssRes.json()
                setScreenshotIds((ssData ?? []).map((x) => x.id).filter(Boolean))
            } catch (err) {
                setError(err?.message ?? "Unknown error")
            } finally {
                setLoading(false)
            }
        }

        if (id && checkpointId) run()
    }, [id, checkpointId])

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
                    href={`/dashboard/${id}`}
                    className="text-(--color-primary) mb-4 inline-block"
                >
                    ← Back to checkpoints
                </Link>

                {loading && <div>Loading checkpoint...</div>}
                {error && <div className="text-red-500">{error}</div>}

                {!loading && !error && checkpoint && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-xl border border-(--color-border)">
                            <div className="text-xl font-semibold mb-2">
                                {formatDateTime(checkpoint.timestamp)}
                            </div>
                            <div className="text-sm">{checkpoint.description}</div>

                            {!!checkpoint.webActivities?.length && (
                                <div className="mt-4 space-y-2">
                                    {checkpoint.webActivities.map((a, idx) => (
                                        <div
                                            key={idx}
                                            className="text-sm text-(--color-muted-foreground)"
                                        >
                                            • {a.host} —{" "}
                                            <a
                                                href={a.url}
                                                target="_blank"
                                                className="text-(--color-primary)"
                                            >
                                                {a.title}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="text-lg font-semibold mb-3">Screenshots</div>

                            {screenshotIds.length === 0 ? (
                                <div className="text-sm text-(--color-muted-foreground)">
                                    No screenshots for this checkpoint.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {screenshotIds.map((sid) => (
                                        <a
                                            key={sid}
                                            href={`http://localhost:6969/screenshots/${sid}`}
                                            target="_blank"
                                            className="block rounded-xl overflow-hidden border border-(--color-border) hover:bg-(--color-muted) transition"
                                        >
                                            <img
                                                src={`http://localhost:6969/screenshots/${sid}`}
                                                alt={`Screenshot ${sid}`}
                                                className="w-full h-48 object-cover"
                                                loading="lazy"
                                            />
                                            <div className="p-3 text-sm">Screenshot #{sid}</div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}