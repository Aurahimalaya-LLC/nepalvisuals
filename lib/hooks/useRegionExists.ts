import { useEffect, useState } from 'react'
import { RegionService } from '../services/regionService'

export function useRegionExists(regionName: string | null | undefined) {
  const [exists, setExists] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!regionName || regionName.trim() === '') {
        setExists(null)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const ok = await RegionService.existsByName(regionName)
        if (!cancelled) setExists(ok)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to verify region')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [regionName])

  return { exists, loading, error }
}

