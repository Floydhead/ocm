import type { AppProps } from "next/app"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAuth } from "../hooks/useAuth"
import Sidebar from "../components/Sidebar"
import "../styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())
  const [menuOpen, setMenuOpen] = useState(false)
  const { currentUser, isLoggedIn, isLoading, logout } = useAuth()
  const router = useRouter()
  const isLoginPage = router.pathname === "/login"

  useEffect(() => {
    if (!isLoading && !isLoggedIn && !isLoginPage) {
      router.push('/login')
    }
  }, [isLoggedIn, isLoading, router, isLoginPage])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold text-gray-900 hover:text-indigo-600">
              OCM Platform
            </Link>

            <div className="flex items-center gap-4">
              {currentUser ? (
                <div
                  className="relative"
                  tabIndex={0}
                  onBlur={(event) => {
                    const relatedTarget = event.relatedTarget as HTMLElement | null
                    if (!event.currentTarget.contains(relatedTarget)) {
                      setMenuOpen(false)
                    }
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setMenuOpen((open) => !open)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <div className="text-sm font-semibold text-gray-900">{currentUser.username}</div>
                    <div className="text-xs text-gray-500">{currentUser.role}</div>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{currentUser.username}</p>
                        <p className="text-xs text-gray-500">{currentUser.role}</p>
                      </div>
                      <div className="flex flex-col">
                        <Link
                          href="/settings"
                          className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">Not signed in</div>
              )}
            </div>
          </div>
        </header>

        <div className={`flex flex-col md:flex-row ${isLoginPage ? "" : "min-h-[calc(100vh-74px)]"}`}>
          {!isLoginPage && <Sidebar />}
          <main className={`flex-1 w-full overflow-x-hidden ${isLoginPage ? "container mx-auto px-6 py-6" : "px-4 py-6 md:px-8"}`}>
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </QueryClientProvider>
  )
}
