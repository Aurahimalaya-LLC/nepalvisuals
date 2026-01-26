import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export type RegionTourCount = {
  region: string
  count: number
}

export type RegionTourCountSort = 'name' | 'count'

export function useRegionTourCounts(defaultSort: RegionTourCountSort = 'name') {
  const [counts, setCounts] = useState<RegionTourCount[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<RegionTourCountSort>(defaultSort)

  const sortCounts = useCallback((arr: RegionTourCount[], sort: RegionTourCountSort) => {
    if (sort === 'name') {
      return [...arr].sort((a, b) => a.region.localeCompare(b.region, undefined, { sensitivity: 'base' }))
    }
    return [...arr].sort((a, b) => b.count - a.count)
  }, [])

  const fetchCounts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch region field for all tours; group on client
      const { data, error } = await supabase
        .from('tours')
        .select('id, region')

      if (error) throw error

      const map = new Map<string, number>()
      ;(data || []).forEach((row: { id: string; region: string | null }) => {
        const key = (row.region || '').trim()
        if (!key) return
        map.set(key, (map.get(key) || 0) + 1)
      })

      const result: RegionTourCount[] = Array.from(map.entries()).map(([region, count]) => ({ region, count }))
      setCounts(sortCounts(result, sortBy))
    } catch (e: any) {
      setError(e?.message || 'Failed to load tour counts')
    } finally {
      setLoading(false)
    }
  }, [sortBy, sortCounts])

  useEffect(() => {
    fetchCounts()
    const channel = supabase
      .channel('tours-realtime-region-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tours' }, () => {
        fetchCounts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchCounts])

  const setSort = (sort: RegionTourCountSort) => {
    setSortBy(sort)
    setCounts(prev => sortCounts(prev, sort))
  }

  return { counts, loading, error, refresh: fetchCounts, sortBy, setSort }
}

