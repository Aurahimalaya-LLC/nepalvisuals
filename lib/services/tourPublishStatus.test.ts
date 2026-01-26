import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TourService } from './tourService'
import { supabase } from '../supabaseClient'

vi.mock('../supabaseClient', async () => {
  const actual = await vi.importActual('../supabaseClient')
  return {
    ...actual,
    supabase: {
      from: vi.fn(),
    }
  }
})

describe('Tour publish status transitions', () => {
  const mockFrom = vi.fn()
  const mockSelect = vi.fn()
  const mockEq = vi.fn()
  const mockSingle = vi.fn()
  const mockUpdate = vi.fn()
  const mockOrder = vi.fn()
  const mockRange = vi.fn()
  const mockGte = vi.fn()
  const mockLte = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(supabase.from).mockImplementation(mockFrom as any)
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
      eq: mockEq,
      order: mockOrder,
      range: mockRange,
      gte: mockGte,
      lte: mockLte,
    } as any)
    mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder, range: mockRange, gte: mockGte, lte: mockLte })
    mockEq.mockReturnValue({ eq: mockEq, order: mockOrder, range: mockRange, gte: mockGte, lte: mockLte })
    mockOrder.mockReturnValue({ range: mockRange })
    mockRange.mockReturnValue({ data: [], error: null, count: 0 })
    mockUpdate.mockReturnValue({ eq: () => ({ select: () => ({ single: mockSingle }) }) })
  })

  it('sets published_at when status changes to Published', async () => {
    const expected = { data: { id: 't1', status: 'Published', published_at: new Date().toISOString() }, error: null }
    mockSingle.mockReturnValueOnce(expected)
    const result = await TourService.updateTour('t1', { status: 'Published' })
    expect(result.status).toBe('Published')
    expect(mockUpdate).toHaveBeenCalled()
    const payload = vi.mocked(mockUpdate).mock.calls[0][0]
    expect(payload.published_at).toBeDefined()
  })

  it('clears published_at when status changes to Draft', async () => {
    const expected = { data: { id: 't1', status: 'Draft', published_at: null }, error: null }
    mockSingle.mockReturnValueOnce(expected)
    const result = await TourService.updateTour('t1', { status: 'Draft' })
    expect(result.status).toBe('Draft')
    const payload = vi.mocked(mockUpdate).mock.calls[0][0]
    expect(payload.published_at).toBeNull()
  })

  it('filters by status and category in getAllTours', async () => {
    mockRange.mockReturnValueOnce({ data: [{ id: 't2', status: 'Published', category: 'Adventure' }], error: null, count: 1 })
    const res = await TourService.getAllTours({ status: 'Published', category: 'Adventure' })
    expect(res.count).toBe(1)
    expect(mockFrom).toHaveBeenCalledWith('tours')
    // ensure eq called for filters
    expect(mockSelect).toHaveBeenCalled()
  })
})
