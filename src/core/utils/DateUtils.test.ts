import { beforeEach, describe, expect, it } from 'vitest'

import { initializeSettings } from '@/core/settings/settings'
import { DateUtils } from '@/core/utils/DateUtils'

describe('DateUtils', () => {
  const testSettings = {
    date: {
      format: 'dd/MM/yyyy',
      dateTimeFormat: 'dd/MM/yyyy HH:mm',
    },
  }

  beforeEach(() => {
    initializeSettings(testSettings)
  })

  it('formats a date using the default format', () => {
    const date = new Date(2026, 8, 17)

    expect(DateUtils.format(date)).toBe('17/09/2026')
  })

  it('formats a date using a custom format', () => {
    const date = new Date(2026, 8, 17)

    expect(DateUtils.format(date, 'yyyy-MM-dd')).toBe('2026-09-17')
  })

  it('uses the configured date format', () => {
    initializeSettings({
      date: {
        format: 'yyyy-MM-dd',
      },
    })

    const date = new Date(2026, 8, 17)

    expect(DateUtils.format(date)).toBe('2026-09-17')
  })

  it('formats a date and time using the configured format', () => {
    const date = new Date(2026, 8, 17, 14, 30)

    expect(DateUtils.formatDateTime(date)).toBe('17/09/2026 14:30')
  })

  it('parses a date using the default format', () => {
    const date = DateUtils.parse('17/09/2026')

    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(8)
    expect(date.getDate()).toBe(17)
  })

  it('converts a date to ISO', () => {
    const date = new Date('2026-09-17T12:30:00.000Z')

    expect(DateUtils.toIso(date)).toBe('2026-09-17T12:30:00.000Z')
  })

  it('throws when parsing an invalid date', () => {
    expect(() => DateUtils.parse('invalid-date')).toThrow()
  })

  it('throws when parsing an impossible date', () => {
    expect(() => DateUtils.parse('32/09/2026')).toThrow()
  })
})
