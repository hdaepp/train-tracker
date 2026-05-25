import { describe, it, expect } from 'vitest'
import { formatTime, parseTime } from './mbta'

describe('parseTime', () => {
  it('returns null for null input', () => {
    expect(parseTime(null)).toBeNull()
  })

  it('returns a Date for a valid ISO string', () => {
    const result = parseTime('2024-01-01T09:05:00-05:00')
    expect(result).toBeInstanceOf(Date)
    expect(isNaN(result.getTime())).toBe(false)
  })
})

describe('formatTime', () => {
  it('returns — for null input', () => {
    expect(formatTime(null)).toBe('—')
  })

  it('returns a non-empty time string for a valid date', () => {
    const result = formatTime(new Date('2024-01-01T14:05:00'))
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
    expect(result).toMatch(/\d+:\d{2}/)
  })
})
