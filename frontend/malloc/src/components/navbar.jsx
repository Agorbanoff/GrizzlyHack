"use client"

import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname() 

  return (
    <nav className="flex items-center justify-between px-10 py-6 bg-(--color-surface) border-b border-(--color-border)">
      <div className="flex items-center gap-4">
        <img src="/icon.png" alt="Logo" className="h-12 w-12 invert" />
        <h1 className="text-4xl font-bold text-(--color-primary)">
          Malloc
        </h1>
      </div>

      <div className="flex items-center gap-8">
        <a
          href="/dashboard"
          className={`font-semibold px-4 py-2 rounded transition ${
            pathname === "/dashboard"
              ? "bg-[var(--color-primary)] text-white"
              : "hover:bg-[var(--color-primary)]"
          }`}
        >
          Sessions
        </a>
        <a
          href="/statistics"
          className={`font-semibold px-4 py-2 rounded transition ${
            pathname === "/statistics"
              ? "bg-[var(--color-primary)] text-white"
              : "hover:bg-[var(--color-primary)]"
          }`}
        >
          Statistics
        </a>
      </div>
    </nav>
  )
}
