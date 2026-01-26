import React from 'react'
import { useRegionTripStats } from '../../lib/hooks/useRegionTripStats'
import { Link } from 'react-router-dom'

const slugify = (name: string) =>
  (name || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .trim()

const RegionTripStatsSection: React.FC = () => {
  const {
    stats,
    loading,
    error,
    refresh,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    maxCount,
  } = useRegionTripStats()

  return (
    <section className="mb-24">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Trip Stats by Region</h2>
          <p className="text-text-secondary">Total trips per region. Filter and drill down to explore.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="px-3 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold transition-colors">
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-surface-dark border border-white/5 rounded-2xl p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="text-sm text-text-secondary">Start Date</label>
            <input
              id="start-date"
              type="date"
              value={startDate ?? ''}
              onChange={(e) => setStartDate(e.target.value || null)}
              className="bg-surface-darker border border-white/10 rounded-md text-white text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="text-sm text-text-secondary">End Date</label>
            <input
              id="end-date"
              type="date"
              value={endDate ?? ''}
              onChange={(e) => setEndDate(e.target.value || null)}
              className="bg-surface-darker border border-white/10 rounded-md text-white text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="text-sm text-text-secondary">
            Data updates in real-time when trips change.
          </div>
        </div>

        {loading && (
          <div className="animate-pulse grid grid-cols-1 gap-3">
            <div className="h-10 bg-white/5 rounded" />
            <div className="h-10 bg-white/5 rounded" />
            <div className="h-10 bg-white/5 rounded" />
          </div>
        )}

        {error && !loading && (
          <div role="alert" className="p-3 rounded-md bg-red-600/20 border border-red-600/40 text-white">
            Failed to load trip stats. Please try again.
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-text-secondary uppercase bg-white/5">
                  <tr>
                    <th className="px-4 py-3 font-medium text-left">Region Name</th>
                    <th className="px-4 py-3 font-medium text-left">Total Trips</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {stats.map((row) => (
                    <tr key={row.region} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white font-semibold">
                        <Link to={`/region/${slugify(row.region)}`} className="hover:text-primary transition-colors">
                          {row.region}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-white">
                        <span className="font-bold">Total Trips: {row.count.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                  {stats.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-text-secondary">
                        No trips found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Simple bar visualization */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Distribution</h3>
              <div className="space-y-3">
                {stats.map((row) => {
                  const widthPercent = maxCount > 0 ? Math.round((row.count / maxCount) * 100) : 0
                  return (
                    <div key={row.region}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{row.region}</span>
                        <span className="text-text-secondary text-sm">{row.count.toLocaleString()}</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-3 bg-primary rounded-full transition-all"
                          style={{ width: `${widthPercent}%` }}
                          aria-label={`${row.region} trip share`}
                        />
                      </div>
                      {/* Drill-down: expandable list of tours */}
                      <details className="mt-2 group">
                        <summary className="text-xs text-text-secondary cursor-pointer list-none flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">list_alt</span>
                          View tours
                        </summary>
                        <ul className="mt-2 space-y-1">
                          {(row.tours || []).map(t => (
                            <li key={t.id} className="text-sm text-white/90">{t.name}</li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  )
                })}
                {stats.length === 0 && (
                  <p className="text-sm text-text-secondary">No data to visualize.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default RegionTripStatsSection

