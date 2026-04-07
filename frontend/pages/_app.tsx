import type { AppProps } from "next/app"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAuth } from "../hooks/useAuth"
import "../styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())
  const { currentUser, isLoggedIn, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isLoggedIn && router.pathname !== '/login') {
      router.push('/login')
    }
  }, [isLoggedIn, isLoading, router])

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900">OCM Platform</div>
            {currentUser ? (
              <Link href="/settings" className="text-right text-sm text-gray-700 hover:text-indigo-600">
                <div className="font-medium text-gray-900">{currentUser.username}</div>
                <div className="text-gray-500">{currentUser.role}</div>
              </Link>
            ) : (
              <div className="text-sm text-gray-500">Not signed in</div>
            )}
          </div>
        </header>
        <main className="container mx-auto px-6 py-6">
          <Component {...pageProps} />
        </main>
      </div>
    </QueryClientProvider>
  )
}
