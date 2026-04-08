import Link from "next/link"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/standings", label: "Standings", icon: "📊" },
  { href: "/teams", label: "Teams & Squads", icon: "👥" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
]

export default function Sidebar() {
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("sidebarCollapsed")
    if (stored !== null) {
      setIsCollapsed(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed))
    }
  }, [isCollapsed, mounted])

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  if (!mounted) return null

  return (
    <aside className={`bg-white border-b border-gray-200 md:border-b-0 md:border-r md:min-h-screen md:sticky md:top-0 transition-all duration-300 ${isCollapsed ? "w-20 md:w-20" : "w-full md:w-64"}`}>
      <div className="flex items-center justify-between px-4 py-4 md:py-6">
        {!isCollapsed && (
          <div className="text-sm uppercase tracking-[0.2em] text-gray-500 flex-1">Quick nav</div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-auto"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      <nav className={`space-y-1 ${isCollapsed ? "px-2" : "px-4"}`}>
        {navItems.map((item) => {
          const active = router.pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-lg px-3 py-3 text-sm font-medium transition ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

