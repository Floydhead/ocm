import LeagueSelect from "../components/LeagueSelect"
import SeasonSelect from "../components/SeasonSelect"
import { useState } from "react"

export default function Home() {
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900">Online Competition Manager</h1>
          <p className="text-gray-600 mt-2">Manage leagues, seasons, teams, and matches</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Get Started</h2>

          <LeagueSelect onLeagueSelect={setSelectedLeague} />
          <SeasonSelect onSeasonSelect={setSelectedSeason} />

          {selectedLeague && selectedSeason && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                ✓ League {selectedLeague} and Season {selectedSeason} selected
              </p>
              <button onClick={() => alert(`Viewing teams for league ${selectedLeague}, season ${selectedSeason}`)} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                View Teams & Standings
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">📊 Standings</h3>
            <p className="text-gray-600">View league standings and team rankings</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">👥 Teams & Squads</h3>
            <p className="text-gray-600">Manage team rosters and player assignments</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">🏃 Matches</h3>
            <p className="text-gray-600">Schedule and track match results</p>
          </div>
        </div>
      </main>
    </div>
  )
}