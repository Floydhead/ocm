import { useQuery } from "@tanstack/react-query"
import LeagueSelect from "../components/LeagueSelect"
import SeasonSelect from "../components/SeasonSelect"
import { useApi } from "../hooks/useApi"
import { useLeagueSeasonDefaults } from "../hooks/useLeagueSeasonDefaults"
import Link from "next/link"
import { useRouter } from "next/router"

interface Standing {
  team_id: number
  team_name: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  points: number
}

export default function Home() {
  const router = useRouter()
  const {
    selectedLeague,
    selectedSeason,
    setSelectedLeague,
    setSelectedSeason,
  } = useLeagueSeasonDefaults()

  const { data: standings, isLoading, error } = useQuery({
    queryKey: ["standings", selectedLeague, selectedSeason],
    queryFn: () => useApi.get(`/standings/?league_id=${selectedLeague}&season_id=${selectedSeason}`),
    enabled: selectedLeague !== null && selectedSeason !== null,
  })

  const showStandings = selectedLeague !== null && selectedSeason !== null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900">Online Competition Manager</h1>
          <p className="text-gray-600 mt-2">Premier League and latest season are selected by default, with standings shown immediately.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="bg-white shadow-md rounded-3xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Quick Controls</h2>
              <p className="mt-2 text-sm text-gray-600">Change league or season and the landing page updates automatically.</p>
            </div>

            <div className="space-y-6">
              <LeagueSelect selectedId={selectedLeague} onLeagueSelect={setSelectedLeague} />
              <SeasonSelect selectedId={selectedSeason} onSeasonSelect={setSelectedSeason} />
            </div>

            <div className="mt-6 rounded-3xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-700">Current selection</p>
              <p className="mt-2 text-gray-900">League: <span className="font-semibold">{selectedLeague ?? "Loading..."}</span></p>
              <p className="mt-1 text-gray-900">Season: <span className="font-semibold">{selectedSeason ?? "Loading..."}</span></p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => router.push(`/standings?league_id=${selectedLeague}&season_id=${selectedSeason}`)}
                disabled={!showStandings}
                className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Go to Standings
              </button>
              <button
                type="button"
                onClick={() => router.push(`/teams?league_id=${selectedLeague}&season_id=${selectedSeason}`)}
                disabled={!showStandings}
                className="w-full rounded-2xl border border-indigo-600 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-500"
              >
                Go to Teams & Squads
              </button>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-3xl p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Standings Preview</h2>
                <p className="mt-1 text-sm text-gray-600">Showing the latest default league and season.</p>
              </div>
              <Link href="/standings" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                View full standings →
              </Link>
            </div>

            {!showStandings ? (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
                Loading default league and season...
              </div>
            ) : isLoading ? (
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">Loading standings...</div>
            ) : error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">Unable to load standings right now.</div>
            ) : !standings || standings.length === 0 ? (
              <div className="rounded-3xl border border-blue-200 bg-blue-50 p-8 text-center text-blue-700">No standings data available.</div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Pos</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Team</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Pts</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">W</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">D</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {standings.slice(0, 6).map((standing: Standing, index: number) => (
                      <tr key={standing.team_id}>
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">{index + 1}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{standing.team_name}</td>
                        <td className="px-4 py-4 text-center text-sm font-semibold text-indigo-600">{standing.points}</td>
                        <td className="px-4 py-4 text-center text-sm text-gray-600">{standing.won}</td>
                        <td className="px-4 py-4 text-center text-sm text-gray-600">{standing.drawn}</td>
                        <td className="px-4 py-4 text-center text-sm text-gray-600">{standing.lost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>

  )
}