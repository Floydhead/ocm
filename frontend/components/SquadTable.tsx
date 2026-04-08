import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useApi } from "../hooks/useApi"
import DragDropSquad from "./DragDropSquad"

export default function SquadTable({ teamId, canEdit }) {
  const queryClient = useQueryClient()
  const [newPlayerName, setNewPlayerName] = useState("")
  const [editNames, setEditNames] = useState<Record<number, string>>({})

  const { data: squad, isLoading, error } = useQuery({
    queryKey: ["squad", teamId],
    queryFn: () => useApi.get(`/teams/${teamId}/players`),
    enabled: !!teamId,
  })

  const addMutation = useMutation({
    mutationFn: (player_name: string) => useApi.post(`/teams/${teamId}/players`, { player_name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["squad", teamId] })
      setNewPlayerName("")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, player_name }: { id: number; player_name: string }) =>
      useApi.patch(`/teams/${teamId}/players/${id}`, { player_name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["squad", teamId] }),
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => useApi.delete(`/teams/${teamId}/players/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["squad", teamId] }),
  })

  const reorderMutation = useMutation({
    mutationFn: (items: Array<{ id: number; squad_number: number }>) => useApi.patch(`/teams/${teamId}/players/order`, items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["squad", teamId] }),
  })

  const handleAddPlayer = async () => {
    const trimmedName = newPlayerName.trim()
    if (!trimmedName) return
    await addMutation.mutateAsync(trimmedName)
  }

  const handleReplace = async (id: number) => {
    const nextName = editNames[id]?.trim()
    if (!nextName) return
    await updateMutation.mutateAsync({ id, player_name: nextName })
    setEditNames((current) => ({ ...current, [id]: "" }))
  }

  const handleRemove = async (id: number) => {
    await removeMutation.mutateAsync(id)
  }

  const handleReorder = async (items) => {
    if (!items) return
    await reorderMutation.mutateAsync(
      items.map((item, index) => ({ id: item.id, squad_number: index + 1 }))
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-500">Loading squad...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-700">Unable to load squad. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Squad</h3>
          <p className="text-sm text-gray-500">Drag to reorder, add by full name, or replace existing players.</p>
        </div>
        {canEdit && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              value={newPlayerName}
              onChange={(event) => setNewPlayerName(event.target.value)}
              placeholder="New player full name"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:w-80"
            />
            <button
              type="button"
              onClick={handleAddPlayer}
              disabled={addMutation.status === "pending"}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Add player
            </button>
          </div>
        )}
      </div>

      {!squad || squad.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
          No squad players assigned yet.
        </div>
      ) : (
        <DragDropSquad
          squad={squad}
          onChange={canEdit ? handleReorder : undefined}
          renderRow={(player) => (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold text-gray-900">{player.player.name}</div>
                <div className="text-sm text-gray-500">#{player.squad_number} • {player.player.position}</div>
              </div>
              {canEdit && (
                <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={editNames[player.id] ?? ""}
                    onChange={(event) => setEditNames((current) => ({ ...current, [player.id]: event.target.value }))}
                    placeholder="Replace full name"
                    className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleReplace(player.id)}
                    disabled={updateMutation.status === "pending"}
                    className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(player.id)}
                    disabled={removeMutation.status === "pending"}
                    className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        />
      )}
    </div>
  )
}
