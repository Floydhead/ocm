import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import LeagueSelect from "../components/LeagueSelect"
import SeasonSelect from "../components/SeasonSelect"
import SquadTable from "../components/SquadTable"
import { useApi } from "../hooks/useApi"
import { useLeagueSeasonDefaults } from "../hooks/useLeagueSeasonDefaults"
import { useAuth } from "../hooks/useAuth"

interface Team {
  id: number
  name: string
  league_id: number
  season_id: number
}

interface League {
  id: number
  name: string
}

export default function TeamsPage() {
  const { currentUser } = useAuth()
  const isAdmin = currentUser?.role === "admin"
  const canEditSquad = currentUser?.role === "admin" || currentUser?.role === "manager"
  const {
    selectedLeague,
    selectedSeason,
    setSelectedLeague,
    setSelectedSeason,
  } = useLeagueSeasonDefaults()
  const queryClient = useQueryClient()
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [editName, setEditName] = useState("")
  const [editLeagueId, setEditLeagueId] = useState<number | null>(null)
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null)

  const leaguesQuery = useQuery<League[]>({
    queryKey: ["leagues"],
    queryFn: () => useApi.get("/leagues"),
  })

  const teamsQuery = useQuery<Team[]>({
    queryKey: ["teams", selectedLeague, selectedSeason],
    queryFn: () => {
      const params = new URLSearchParams()
      if (selectedLeague !== null) params.append("league_id", selectedLeague.toString())
      if (selectedSeason !== null) params.append("season_id", selectedSeason.toString())
      return useApi.get(`/teams/?${params.toString()}`)
    },
    enabled: selectedLeague !== null && selectedSeason !== null,
  })

  const leagueMap = useMemo(
    () => new Map(leaguesQuery.data?.map((league) => [league.id, league.name]) || []),
    [leaguesQuery.data]
  )

  const updateTeamMutation = useMutation({
    mutationFn: async (payload: { name: string; league_id: number }) => {
      if (!editingTeam) throw new Error("No team selected")
      return useApi.patch(`/teams/${editingTeam.id}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", selectedLeague, selectedSeason] })
      setEditingTeam(null)
    },
  })

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team)
    setEditName(team.name)
    setEditLeagueId(team.league_id)
  }

  const handleSaveTeam = async () => {
    if (!editingTeam || editLeagueId === null) return
    await updateTeamMutation.mutateAsync({ name: editName, league_id: editLeagueId })
  }

  const handleToggleSquad = (teamId: number) => {
    setExpandedTeamId((current) => (current === teamId ? null : teamId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Teams & Squads</h1>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LeagueSelect selectedId={selectedLeague} onLeagueSelect={setSelectedLeague} />
            <SeasonSelect selectedId={selectedSeason} onSeasonSelect={setSelectedSeason} />
          </div>
        </div>

        {editingTeam && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">League</label>
                  <select
                    value={editLeagueId ?? ""}
                    onChange={(event) => setEditLeagueId(Number(event.target.value))}
                    className="mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select league</option>
                    {leaguesQuery.data?.map((league) => (
                      <option key={league.id} value={league.id}>
                        {league.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 items-end">
                  <button
                    type="button"
                    onClick={handleSaveTeam}
                    disabled={updateTeamMutation.status === "pending"}
                    className="inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Save team
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTeam(null)}
                    className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedLeague || !selectedSeason ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">Please select both a league and season to view teams</p>
          </div>
        ) : teamsQuery.isLoading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500 text-center py-8">Loading teams...</p>
          </div>
        ) : teamsQuery.error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">Error loading teams. Please try again.</p>
          </div>
        ) : !teamsQuery.data || teamsQuery.data.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800">No teams available for this league and season</p>
          </div>
        ) : (
          <div className="space-y-6">
            {teamsQuery.data.map((team: Team) => (
              <div key={team.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Team ID: {team.id}</p>
                    <p className="text-sm text-gray-600">League: {leagueMap.get(team.league_id) ?? `#${team.league_id}`}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleEditTeam(team)}
                        className="rounded-lg border border-indigo-600 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                      >
                        Edit team
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleSquad(team.id)}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      {expandedTeamId === team.id ? "Hide Squad" : "View Squad"}
                    </button>
                  </div>
                </div>

                {expandedTeamId === team.id && (
                  <div className="mt-6">
                    <SquadTable teamId={team.id} canEdit={canEditSquad} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
