import { useQuery } from "@tanstack/react-query"
import { useApi } from "../hooks/useApi"

export default function StandingsTable({ teamId }) {
  const { data: standings } = useQuery({
    queryKey: ["standings", teamId],
    queryFn: () => useApi.get(`/teams/${teamId}/standings`),
  })
  // render paginated table
  return <div>…</div>
}