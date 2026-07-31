import componentsData from '@/data/componentsData.json'

export interface CatalogPart {
  id: string
  name: string
  type: string
  price: number
  socket?: string
  power?: number
  ramType?: string
  size?: string
  wattage?: number
  desc?: string
}

export const PART_TYPES = ['CPU', 'GPU', 'RAM', 'Mainboard', 'Storage', 'PSU', 'Cooler', 'Case', 'Monitor']

export function getCatalogByType(type: string): CatalogPart[] {
  return (componentsData as CatalogPart[]).filter((c) => c.type === type)
}

export function getCatalogCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const p of componentsData as CatalogPart[]) {
    counts[p.type] = (counts[p.type] || 0) + 1
  }
  return counts
}

export function daySeed(date: Date = new Date()): number {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return y * 10000 + m * 100 + d
}

export function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function formatDayVN(date: Date = new Date()): string {
  return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function pickDaily<T>(items: T[], seed: number, key: string): T {
  if (items.length === 0) throw new Error('empty pool')
  return items[hashString(`${seed}:${key}`) % items.length]
}

export interface RotatedPart extends CatalogPart {
  rotationKey: string
}

export function rotateBuildItem(
  part: { name: string; type: string; price: number },
  seed: number,
  poolSize = 6
): RotatedPart | null {
  const pool = getCatalogByType(part.type)
  if (pool.length === 0) return null

  const candidates = pool
    .filter((c) => c.price >= part.price * 0.7 && c.price <= part.price * 1.35)
    .slice()
  if (candidates.length === 0) candidates.push(...pool.slice(0, 50))

  const picked: RotatedPart[] = []
  const used = new Set<string>()
  for (let i = 0; i < Math.min(poolSize, candidates.length); i++) {
    let attempts = 0
    let item = candidates[hashString(`${seed}:${part.type}:${i}:${attempts}`) % candidates.length]
    while (used.has(item.id) && attempts < 8) {
      attempts++
      item = candidates[hashString(`${seed}:${part.type}:${i}:${attempts}`) % candidates.length]
    }
    used.add(item.id)
    picked.push({ ...item, rotationKey: item.id })
  }

  const winner = picked[0]
  const alt = picked[1]
  return {
    ...winner,
    rotationKey: alt ? alt.id : winner.id,
  }
}
