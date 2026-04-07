import { useState } from "react"
import { useApi } from "../hooks/useApi"

export default function CsvUpload({ teamId }) {
  const [file, setFile] = useState<File | null>(null)

  const handleUpload = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    await useApi.post(`/teams/${teamId}/players/upload`, formData)
    // refresh squad list
  }

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  )
}