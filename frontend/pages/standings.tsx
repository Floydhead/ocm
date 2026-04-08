import { useQuery } from "@tanstack/react-query"
import LeagueSelect from "../components/LeagueSelect"
import SeasonSelect from "../components/SeasonSelect"
import { useApi } from "../hooks/useApi"
import { useLeagueSeasonDefaults } from "../hooks/useLeagueSeasonDefaults"

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

export default function StandingsPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">League Standings</h1>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LeagueSelect selectedId={selectedLeague} onLeagueSelect={setSelectedLeague} />
            <SeasonSelect selectedId={selectedSeason} onSeasonSelect={setSelectedSeason} />
          </div>
        </div>

        {!selectedLeague || !selectedSeason ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">Please select both a league and season to view standings</p>
          </div>
        ) : isLoading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500 text-center py-8">Loading standings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">Error loading standings. Please try again.</p>
          </div>
        ) : !standings || standings.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800">No standings data available for this league and season</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Pos</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Team</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">P</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">W</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">D</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">L</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">GF</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">GA</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">GD</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing: Standing, index: number) => (
                  <tr key={standing.team_id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{standing.team_name}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{standing.played}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{standing.won}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{standing.drawn}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{standing.lost}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{standing.gf}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{standing.ga}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{standing.gd > 0 ? `+${standing.gd}` : standing.gd}</td>
                    <td className="px-4 py-3 text-center text-sm font-bold text-indigo-600">{standing.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
