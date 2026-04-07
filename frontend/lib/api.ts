export const ENDPOINTS = {
  leagues: "/leagues",
  seasons: "/seasons",
  teams: (id: number) => `/teams/${id}`,
  // …
}