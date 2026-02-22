"use client"

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts"
import Navbar from "../../components/Navbar"

export default function Statistics() {
  const data = [
    { name: "Session A", value: 45 },
    { name: "Session B", value: 30 },
    { name: "Session C", value: 15 },
    { name: "Session D", value: 7 },
    { name: "Session E", value: 3 },
  ]

  const COLORS = [
    "var(--color-primary)",       // blue
    "var(--color-secondary)",     // teal
    "var(--color-highlight)",     // yellow
    "var(--color-accent)",        // red
    "var(--color-muted)",         // gray
  ]

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <main className="p-10">
        <h2 className="text-3xl font-bold mb-2 text-[var(--color-foreground)] text-center">
          Top 5 Most Used Sessions
        </h2>

        <div className="w-24 mx-auto mb-6 border-b border-[var(--color-border)]"></div>

        <div className="w-full max-w-2xl mx-auto h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={180}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ color: "var(--color-foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-10">
          
          <div className="w-16 mx-auto border-b border-[var(--color-border)] mb-6"></div>
        </div>
      </main>
    </div>
  )
}
