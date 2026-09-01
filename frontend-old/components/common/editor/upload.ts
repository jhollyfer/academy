const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('files', file)

  const res = await fetch(`${API_BASE}/storage`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`)
  }

  const data: Array<{ url: string }> = await res.json()
  return data[0].url
}
