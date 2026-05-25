import { describe, it, expect } from 'vitest'
import { deltaLabel } from './format'

const t = new Date('2024-01-01T09:00:00')
const tPlus3 = new Date('2024-01-01T09:03:00')
const tMinus2 = new Date('2024-01-01T08:58:00')

describe('deltaLabel', () => {
  it('returns neutral dash when no predicted time', () => {
    const result = deltaLabel(t, null)
    expect(result.text).toBe('—')
    expect(result.cls).toBe('neutral')
  })

  it('returns On time when delta is exactly 0', () => {
    const result = deltaLabel(t, t)
    expect(result.text).toBe('On time')
    expect(result.cls).toBe('ontime')
  })

  it('returns negative minutes in early class when train is ahead of schedule', () => {
    const result = deltaLabel(t, tMinus2)
    expect(result.text).toBe('-2 min')
    expect(result.cls).toBe('early')
  })

  it('returns positive minutes in late class when train is behind schedule', () => {
    const result = deltaLabel(t, tPlus3)
    expect(result.text).toBe('+3 min')
    expect(result.cls).toBe('late')
  })
})
