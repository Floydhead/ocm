import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useApi } from "./useApi"

const LEAGUE_STORAGE_KEY = "selectedLeagueId"
const SEASON_STORAGE_KEY = "selectedSeasonId"

const parseStoredId = (value: string | null) => {
  if (!value) return null
  const parsed = parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

export function useLeagueSeasonDefaults() {
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)

  const leaguesQuery = useQuery({
    queryKey: ["leagues"],
    queryFn: () => useApi.get("/leagues"),
  })
  const seasonsQuery = useQuery({
    queryKey: ["seasons"],
    queryFn: () => useApi.get("/seasons"),
  })

  useEffect(() => {
    if (!leaguesQuery.isSuccess || selectedLeague !== null) return

    const storedLeague = parseStoredId(typeof window !== "undefined" ? window.localStorage.getItem(LEAGUE_STORAGE_KEY) : null)
    const leagues = Array.isArray(leaguesQuery.data) ? leaguesQuery.data : []
    const premierLeague = leagues.find((league: any) => league.name === "Premier League")
    const defaultLeague = storedLeague || premierLeague?.id || leagues[0]?.id || null

    if (defaultLeague !== null) {
      setSelectedLeague(defaultLeague)
    }
  }, [leaguesQuery.data, leaguesQuery.isSuccess, selectedLeague])

  useEffect(() => {
    if (!seasonsQuery.isSuccess || selectedSeason !== null) return

    const storedSeason = parseStoredId(typeof window !== "undefined" ? window.localStorage.getItem(SEASON_STORAGE_KEY) : null)
    const seasons = Array.isArray(seasonsQuery.data) ? [...seasonsQuery.data] : []
    const latestSeason = seasons
      .sort((a: any, b: any) => b.year_end - a.year_end || b.year_start - a.year_start)[0]
    const defaultSeason = storedSeason || latestSeason?.id || null

    if (defaultSeason !== null) {
      setSelectedSeason(defaultSeason)
    }
  }, [seasonsQuery.data, seasonsQuery.isSuccess, selectedSeason])

  useEffect(() => {
    if (selectedLeague !== null) {
      window.localStorage.setItem(LEAGUE_STORAGE_KEY, selectedLeague.toString())
    }
  }, [selectedLeague])

  useEffect(() => {
    if (selectedSeason !== null) {
      window.localStorage.setItem(SEASON_STORAGE_KEY, selectedSeason.toString())
    }
  }, [selectedSeason])

  return {
    selectedLeague,
    selectedSeason,
    setSelectedLeague,
    setSelectedSeason,
    leaguesQuery,
    seasonsQuery,
  }
}
