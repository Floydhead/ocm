import { useQuery } from "@tanstack/react-query"
import { useApi } from "../hooks/useApi"

export default function SquadTable({ teamId }) {
  const { data: squad } = useQuery({
    queryKey: ["squad", teamId],
    queryFn: () => useApi.get(`/teams/${teamId}/players`),
  })
  // render table with drag‑drop
  return <div>…</div>
}