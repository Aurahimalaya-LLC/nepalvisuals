export type TourRegionRow = { id?: string; region: string | null }

export function computeRegionCounts(rows: TourRegionRow[]) {
  const map = new Map<string, number>()
  rows.forEach((row) => {
    const key = (row.region || '').trim()
    if (!key) return
    map.set(key, (map.get(key) || 0) + 1)
  })
  return map
}

export function formatCount(n: number) {
  return n.toLocaleString()
}

