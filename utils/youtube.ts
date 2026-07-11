const YOUTUBE_REGEX = /(?:youtube(?:-nocookie)?\.com\/(?:[^/\n]+\/[^/\n]+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&](?:t=(\d+)))?/

export function getYouTubeId(url: string): string | null {
  if (!url) return null
  const match = url.match(YOUTUBE_REGEX)
  return match?.[1] || null
}

export function getYouTubeTimestamp(url: string): number | null {
  if (!url) return null
  const match = url.match(YOUTUBE_REGEX)
  if (match?.[2]) return parseInt(match[2], 10)
  const t = url.match(/[?&]t=(\d+)/)?.[1]
  return t ? parseInt(t, 10) : null
}

export function getYouTubeEmbed(url: string, nocookie = false): string {
  const id = getYouTubeId(url)
  if (!id) return ''
  const ts = getYouTubeTimestamp(url)
  const domain = nocookie ? 'youtube-nocookie.com' : 'youtube.com'
  const params = ts ? `?start=${ts}` : ''
  return `https://www.${domain}/embed/${id}${params}`
}

export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

export function isValidYouTubeUrl(url: string): boolean {
  return getYouTubeId(url) !== null
}
