export interface FaceLandmark {
  x: number
  y: number
  z: number
}

export const FACE_THRESHOLD = 0.14

export function buildFaceDescriptor(landmarks: FaceLandmark[]): number[] {
  if (!landmarks || landmarks.length < 468) return []
  const le = landmarks[33]
  const re = landmarks[263]
  if (!le || !re) return []

  const cx = (le.x + re.x) / 2
  const cy = (le.y + re.y) / 2
  const cz = (le.z + re.z) / 2
  const scale = Math.max(
    Math.hypot(re.x - le.x, re.y - le.y, re.z - le.z),
    1e-5
  )

  const desc: number[] = new Array(landmarks.length * 3)
  for (let i = 0; i < landmarks.length; i++) {
    const p = landmarks[i]
    desc[i * 3] = (p.x - cx) / scale
    desc[i * 3 + 1] = (p.y - cy) / scale
    desc[i * 3 + 2] = (p.z - cz) / scale
  }
  return desc
}

export function faceDistance(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  if (n < 3) return Infinity
  let sum = 0
  for (let i = 0; i < n; i += 3) {
    const dx = a[i] - b[i]
    const dy = a[i + 1] - b[i + 1]
    const dz = a[i + 2] - b[i + 2]
    sum += Math.sqrt(dx * dx + dy * dy + dz * dz)
  }
  return sum / (n / 3)
}

export function faceBox(landmarks: FaceLandmark[]): { x: number; y: number; w: number; h: number } | null {
  if (!landmarks || landmarks.length === 0) return null
  let minX = 1
  let maxX = 0
  let minY = 1
  let maxY = 0
  for (const p of landmarks) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  const pad = 0.04
  return {
    x: Math.max(0, minX - pad),
    y: Math.max(0, minY - pad),
    w: Math.min(1, maxX - minX + 2 * pad),
    h: Math.min(1, maxY - minY + 2 * pad),
  }
}
