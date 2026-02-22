"use client"

import { useEffect, useMemo, useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import Navbar from "../../components/Navbar"

const COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-highlight)",
  "var(--color-accent)",
  "var(--color-muted)",
]

function msToMinutes(ms) {
  return Math.round((ms / 60000) * 10) / 10
}

async function fetchJson(url) {
  const res = await fetch(url, {
    cache: "no-store",
    credentials: "include",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status} ${text}`)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export default function Statistics() {
  const [longestSessions, setLongestSessions] = useState([])
  const [webActivities, setWebActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const page = 0
  const from = useMemo(() => "2026-01-22T12:04:03.871121Z", [])
  const to = useMemo(() => "2026-03-22T12:09:03.871121Z", [])

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError("")

        const longestUrl =
          `http://localhost:6969/analysis/sessions/longest` +
          `?page=${page}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`

        const webUrl =
          `http://localhost:6969/analysis/web-activities/most-time-spent` +
          `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`

        const [longestData, webData] = await Promise.all([
          fetchJson(longestUrl),
          fetchJson(webUrl),
        ])

        setLongestSessions(
          (longestData?.content ?? []).map((s) => ({
            name: `Session ${s.id}`,
            value: msToMinutes(s.totalTime ?? 0),
          }))
        )

        setWebActivities(
          (webData ?? []).map((w) => ({
            name: w.host,
            value: msToMinutes(w.totalTime ?? 0),
          }))
        )
      } catch (e) {
        setError(e.message || "Failed to load statistics")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [from, to])

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <main className="p-10 space-y-20">
        {loading && (
          <div className="text-center text-[var(--color-foreground)]">
            Loading...
          </div>
        )}

        {!loading && error && (
          <div className="text-red-500 text-center">{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* ===== BAR CHART ===== */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-[var(--color-foreground)] text-center">
                Longest Sessions (minutes)
              </h2>

              <div className="w-full max-w-3xl mx-auto h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={longestSessions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="name"
                      stroke="var(--color-foreground)"
                    />
                    <YAxis stroke="var(--color-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-background)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-foreground)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="var(--color-primary)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* ===== PIE CHART ===== */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-[var(--color-foreground)] text-center">
                Most Time Spent by Website (minutes)
              </h2>

              <div className="w-full max-w-2xl mx-auto h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={webActivities}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={160}
                      label
                    >
                      {webActivities.map((_, index) => (
                        <Cell
                          key={`web-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{
                        color: "var(--color-foreground)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}