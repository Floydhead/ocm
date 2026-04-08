import { useQuery } from "@tanstack/react-query"
import { useApi } from "../hooks/useApi"
import { useState, useEffect } from "react"

interface SeasonSelectProps {
  selectedId?: number | null
  onSeasonSelect?: (id: number) => void
}

export default function SeasonSelect({ selectedId = null, onSeasonSelect }: SeasonSelectProps) {
  const [currentId, setCurrentId] = useState<number | null>(selectedId)
  const { data: seasons, isLoading, error } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => useApi.get("/seasons"),
  })

  useEffect(() => {
    setCurrentId(selectedId ?? null)
  }, [selectedId])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? parseInt(e.target.value, 10) : null
    setCurrentId(id)
    if (id !== null) {
      onSeasonSelect?.(id)
    }
  }

  if (isLoading) return <div className="p-4 text-gray-500">Loading seasons...</div>
  if (error) return <div className="p-4 text-red-500">Error loading seasons</div>

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">Select Season</label>
      <select
        value={currentId ?? ""}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Choose a season...</option>
        {Array.isArray(seasons) && seasons.map((season: any) => (
          <option key={season.id} value={season.id}>
            {season.year_start} - {season.year_end}
          </option>
        ))}
      </select>
    </div>
  )
}