import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

export type RegionTripStat = {
  region: string
  count: number
  tours?: { id: string; name: string }[]
}

export function useRegionTripStats() {
  const [stats, setStats] = useState<RegionTripStat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase.from('tours').select('id, name, region, created_at')
      if (startDate) query = query.gte('created_at', startDate)
      if (endDate) query = query.lte('created_at', endDate)
      const { data, error } = await query
      if (error) throw error
      const map = new Map<string, { count: number; tours: { id: string; name: string }[] }>()
      ;(data || []).forEach((row: any) => {
        const region = (row.region || '').trim()
        if (!region) return
        const entry = map.get(region) || { count: 0, tours: [] }
        entry.count += 1
        entry.tours.push({ id: row.id, name: row.name })
        map.set(region, entry)
      })
      const result: RegionTripStat[] = Array.from(map.entries()).map(([region, v]) => ({ region, count: v.count, tours: v.tours }))
      // sort alphabetically by default
      result.sort((a, b) => a.region.localeCompare(b.region, undefined, { sensitivity: 'base' }))
      setStats(result)
    } catch (e: any) {
      setError(e?.message || 'Failed to load trip stats')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchStats()
    const channel = supabase
      .channel('tours-realtime-trip-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tours' }, () => {
        fetchStats()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchStats])

  const maxCount = useMemo(() => (stats.length ? Math.max(...stats.map(s => s.count)) : 0), [stats])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    maxCount,
  }
}

