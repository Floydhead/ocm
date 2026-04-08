import { useQuery } from "@tanstack/react-query"
import { useApi } from "../hooks/useApi"
import { useState, useEffect } from "react"

interface LeagueSelectProps {
  selectedId?: number | null
  onLeagueSelect?: (id: number) => void
}

export default function LeagueSelect({ selectedId = null, onLeagueSelect }: LeagueSelectProps) {
  const [currentId, setCurrentId] = useState<number | null>(selectedId)
  const { data: leagues, isLoading, error } = useQuery({
    queryKey: ["leagues"],
    queryFn: () => useApi.get("/leagues"),
  })

  useEffect(() => {
    setCurrentId(selectedId ?? null)
  }, [selectedId])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? parseInt(e.target.value, 10) : null
    setCurrentId(id)
    if (id !== null) {
      onLeagueSelect?.(id)
    }
  }

  if (isLoading) return <div className="p-4 text-gray-500">Loading leagues...</div>
  if (error) return <div className="p-4 text-red-500">Error loading leagues</div>

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">Select League</label>
      <select
        value={currentId ?? ""}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Choose a league...</option>
        {Array.isArray(leagues) && leagues.map((league: any) => (
          <option key={league.id} value={league.id}>
            {league.name}
          </option>
        ))}
      </select>
    </div>
  )
}