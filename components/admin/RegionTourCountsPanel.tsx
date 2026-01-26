import React from 'react'
import { useRegionTourCounts } from '../../lib/hooks/useRegionTourCounts'

const RegionTourCountsPanel: React.FC = () => {
  const { counts, loading, error, refresh, sortBy, setSort } = useRegionTourCounts('name')

  return (
    <div className="bg-admin-surface rounded-xl border border-admin-border shadow-sm mb-8">
      <div className="p-4 border-b border-admin-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-admin-text-primary">Tours per Region</h2>
          <p className="text-sm text-admin-text-secondary">Live counts of tours grouped by region</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-admin-text-secondary">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSort(e.target.value as any)}
            className="px-2 py-1 border border-admin-border rounded-md text-sm"
            aria-label="Sort tour counts"
          >
            <option value="name">Region Name (A–Z)</option>
            <option value="count">Tour Count (High → Low)</option>
          </select>
          <button
            onClick={refresh}
            className="px-3 py-1 rounded-md bg-admin-primary text-white font-semibold hover:bg-admin-primary-hover transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading && (
          <div className="p-4">
            <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="h-10 bg-admin-background rounded" />
              <div className="h-10 bg-admin-background rounded" />
              <div className="h-10 bg-admin-background rounded" />
            </div>
          </div>
        )}
        {error && !loading && (
          <div role="alert" className="p-4 text-red-600">
            Failed to load tour counts. Please try again.
          </div>
        )}
        {!loading && !error && (
          <table className="w-full text-sm">
            <thead className="text-xs text-admin-text-secondary uppercase bg-admin-background">
              <tr>
                <th className="px-6 py-3 font-medium text-left">Region Name</th>
                <th className="px-6 py-3 font-medium text-left">Total Tours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {counts.map((row) => (
                <tr key={row.region} className="hover:bg-admin-background">
                  <td className="px-6 py-3 text-admin-text-primary font-semibold">{row.region}</td>
                  <td className="px-6 py-3 text-admin-text-primary">{row.count}</td>
                </tr>
              ))}
              {counts.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-6 text-center text-admin-text-secondary">
                    No tours found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default RegionTourCountsPanel

