import { describe, it, expect } from 'vitest'
import { computeRegionCounts, formatCount } from '../lib/utils/regionCounts'

describe('computeRegionCounts', () => {
  it('aggregates counts per region and ignores null/empty', () => {
    const rows = [
      { id: '1', region: 'Everest Region' },
      { id: '2', region: 'Everest Region' },
      { id: '3', region: 'Annapurna Region' },
      { id: '4', region: null },
      { id: '5', region: '   ' },
      { id: '6', region: 'Everest Region' },
    ]
    const map = computeRegionCounts(rows)
    expect(map.get('Everest Region')).toBe(3)
    expect(map.get('Annapurna Region')).toBe(1)
    expect(map.has('')).toBe(false)
  })

  it('trims whitespace in region names', () => {
    const rows = [
      { region: '  Langtang Region ' },
      { region: 'Langtang Region' },
    ]
    const map = computeRegionCounts(rows)
    expect(map.get('Langtang Region')).toBe(2)
  })
})

describe('formatCount', () => {
  it('formats numbers with thousands separators', () => {
    expect(formatCount(0)).toBe('0')
    expect(formatCount(1234)).toMatch(/1,234|1 234|1 234/) // locale-dependent grouping
  })
})

