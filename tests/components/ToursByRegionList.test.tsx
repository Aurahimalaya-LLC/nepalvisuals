import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import ToursByRegionList from '../../components/tour/ToursByRegionList'

const mockTours = [
  { id: 't1', name: 'Everest Base Camp', url_slug: 'ebc', destination: null, region: 'Everest Region', country: 'NP', currency: 'USD', category: null, status: 'Published', price: 1200, duration: '14', difficulty: 'Challenging', guide_language: null, tour_type: null, description: 'Classic trek', meta_title: null, meta_description: null, featured_image: null, created_at: '', updated_at: '' },
  { id: 't2', name: 'Annapurna Circuit', url_slug: 'ac', destination: null, region: 'Annapurna Region', country: 'NP', currency: 'USD', category: null, status: 'Published', price: 1450, duration: '18', difficulty: 'Challenging', guide_language: null, tour_type: null, description: 'Diverse landscapes', meta_title: null, meta_description: null, featured_image: null, created_at: '', updated_at: '' },
  { id: 't3', name: 'Poon Hill', url_slug: 'ph', destination: null, region: 'Annapurna Region', country: 'NP', currency: 'USD', category: null, status: 'Draft', price: 800, duration: '5', difficulty: 'Moderate', guide_language: null, tour_type: null, description: 'Short scenic trek', meta_title: null, meta_description: null, featured_image: null, created_at: '', updated_at: '' },
]

vi.mock('../../lib/services/tourService', () => ({
  TourService: {
    getAllTours: vi.fn(async (_opts) => ({ data: mockTours, count: mockTours.length })),
  }
}))

vi.mock('../../components/common/RegionSelect', () => ({
  default: ({ value, onChange }: any) => (
    <button aria-label="RegionSelect" onClick={() => onChange('Annapurna Region')}>{value || 'All regions'}</button>
  )
}))

describe('ToursByRegionList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders grouped tours and filters by region', async () => {
    render(<ToursByRegionList />)
    expect(await screen.findByText('Total Tours:')).toBeInTheDocument()
    // Groups by region headings
    expect(screen.getByText('Everest Region')).toBeInTheDocument()
    expect(screen.getByText('Annapurna Region')).toBeInTheDocument()
    // Filter via RegionSelect mock
    fireEvent.click(screen.getByLabelText('RegionSelect'))
    // After filter, still shows totals; grouping recalculated
    expect(screen.getByText('Annapurna Region')).toBeInTheDocument()
  })

  it('displays key tour details', async () => {
    render(<ToursByRegionList />)
    const annHeading = await screen.findByText('Annapurna Region')
    const annGroup = annHeading.parentElement as HTMLElement
    const list = within(annGroup).getByRole('list')
    const item = within(list).getByText(/Annapurna Circuit/i).closest('li')!
    expect(within(item).getByText(/Duration:/i)).toBeInTheDocument()
    expect(within(item).getByText(/Difficulty:/i)).toBeInTheDocument()
    expect(within(item).getByText(/Price:/i)).toBeInTheDocument()
    expect(within(item).getByText(/Availability:/i)).toBeInTheDocument()
  })

  it('handles empty results state', async () => {
    const { TourService } = await import('../../lib/services/tourService')
    ;(TourService.getAllTours as any).mockResolvedValueOnce({ data: [], count: 0 })
    render(<ToursByRegionList initialRegion="Nonexistent" />)
    expect(await screen.findByText(/No tours found/i)).toBeInTheDocument()
  })

  it('renders large datasets efficiently', async () => {
    const big = Array.from({ length: 500 }).map((_, i) => ({
      ...mockTours[0],
      id: `b${i}`,
      name: `Tour ${i}`,
      region: i % 2 ? 'Everest Region' : 'Annapurna Region',
    }))
    const { TourService } = await import('../../lib/services/tourService')
    ;(TourService.getAllTours as any).mockResolvedValueOnce({ data: big, count: big.length })
    const start = performance.now()
    render(<ToursByRegionList />)
    await screen.findByText('Total Tours:')
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(1500)
    expect(screen.getByText('Total Tours:').nextSibling?.textContent).toBe(String(big.length))
  })
})
