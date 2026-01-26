import React from 'react'
import { TourService, Tour } from '../../lib/services/tourService'
import RegionSelect from '../../components/common/RegionSelect'
import { sanitizeHtml } from '../../lib/utils/htmlUtils'

interface ToursByRegionListProps {
  initialRegion?: string
}

function groupByRegion(tours: Tour[]) {
  const map = new Map<string, Tour[]>()
  tours.forEach(t => {
    const key = (t.region || 'Unspecified').trim()
    const arr = map.get(key) || []
    arr.push(t)
    map.set(key, arr)
  })
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: 'base' }))
}

export const ToursByRegionList: React.FC<ToursByRegionListProps> = ({ initialRegion }) => {
  const [regionFilter, setRegionFilter] = React.useState<string>(initialRegion || '')
  const [tours, setTours] = React.useState<Tour[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sortAsc, setSortAsc] = React.useState(true)

  const fetchTours = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await TourService.getAllTours({
        region: regionFilter || undefined,
        limit: 500,
      })
      setTours(data || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load tours')
    } finally {
      setLoading(false)
    }
  }, [regionFilter])

  React.useEffect(() => {
    fetchTours()
  }, [fetchTours])

  const grouped = React.useMemo(() => {
    const groups = groupByRegion(tours)
    return sortAsc ? groups : groups.reverse()
  }, [tours, sortAsc])

  return (
    <section aria-label="Trekking tours by region" className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <RegionSelect
            value={regionFilter}
            onChange={setRegionFilter}
            label="Filter by Region"
            placeholder="All regions"
            className="w-full md:w-80"
          />
          <button
            onClick={() => setSortAsc(s => !s)}
            className="inline-flex items-center gap-2 rounded-md border border-admin-border px-3 py-2 text-sm bg-admin-surface hover:bg-gray-100"
            aria-pressed={!sortAsc}
            aria-label="Toggle sort order by region name"
          >
            <span className="material-symbols-outlined">{sortAsc ? 'south' : 'north'}</span>
            Sort
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-admin-text-secondary">
          <span>Total Tours:</span>
          <span className="font-bold text-admin-text-primary">{tours.length.toLocaleString()}</span>
        </div>
      </div>

      {loading && (
        <div role="status" aria-live="polite" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-admin-border bg-admin-surface animate-pulse h-40" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
          <div className="mt-2">
            <button onClick={fetchTours} className="px-3 py-1 rounded-md bg-primary text-white">Retry</button>
          </div>
        </div>
      )}

      {!loading && !error && tours.length === 0 && (
        <div role="status" aria-live="polite" className="rounded-xl border border-admin-border bg-admin-surface p-6 text-admin-text-secondary">
          No tours found for the selected region.
        </div>
      )}

      {!loading && !error && grouped.map(([regionName, list]) => (
        <div key={regionName} className="space-y-3">
          <h3 className="text-xl font-bold text-admin-text-primary">{regionName}</h3>
          <ul
            role="list"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {list.map(tour => {
              const availability = tour.status === 'Published' ? 'Available' : 'Unavailable'
              return (
                <li key={tour.id} className="rounded-xl border border-admin-border bg-admin-surface p-4">
                  <a
                    href={`#/trip/${tour.url_slug}`}
                    className="group block focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    aria-label={`${tour.name} - ${availability}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-admin-text-primary group-hover:text-primary">{tour.name}</h4>
                        <div className="text-sm text-admin-text-secondary line-clamp-2" dangerouslySetInnerHTML={{ __html: sanitizeHtml(tour.description) }} />
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-admin-text-secondary">Duration:</span>
                            <span className="ml-1 font-medium text-admin-text-primary">{tour.duration || '-'}</span>
                          </div>
                          <div>
                            <span className="text-admin-text-secondary">Difficulty:</span>
                            <span className="ml-1 font-medium text-admin-text-primary">{tour.difficulty || '-'}</span>
                          </div>
                          <div>
                            <span className="text-admin-text-secondary">Price:</span>
                            <span className="ml-1 font-medium text-admin-text-primary">{tour.price?.toLocaleString?.() || tour.price}</span>
                          </div>
                          <div>
                            <span className="text-admin-text-secondary">Availability:</span>
                            <span className="ml-1 font-medium text-admin-text-primary">{availability}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-admin-border flex-shrink-0">
                        {tour.featured_image ? (
                          <img
                            src={tour.featured_image}
                            alt={tour.featured_image_alt || `${tour.name} image`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-sm text-gray-500">No image</div>
                        )}
                      </div>
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}

export default ToursByRegionList

