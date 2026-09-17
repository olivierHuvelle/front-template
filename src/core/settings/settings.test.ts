import { beforeEach, describe, expect, it } from 'vitest'

import { getSettings, initializeSettings } from '@/core/settings/settings'

describe('settings', () => {
  beforeEach(() => {
    initializeSettings()
  })

  it('uses default settings', () => {
    const settings = getSettings()

    expect(settings.date).toEqual({
      format: 'dd/MM/yyyy',
      dateTimeFormat: 'dd/MM/yyyy HH:mm',
    })
  })

  it('allows overriding a setting', () => {
    initializeSettings({
      date: {
        format: 'yyyy-MM-dd',
      },
    })

    expect(getSettings().date.format).toBe('yyyy-MM-dd')
  })

  it('keeps default values when partially overriding settings', () => {
    initializeSettings({
      date: {
        format: 'yyyy-MM-dd',
      },
    })

    expect(getSettings().date).toEqual({
      format: 'yyyy-MM-dd',
      dateTimeFormat: 'dd/MM/yyyy HH:mm',
    })
  })

  it('throws when settings contain an unknown property', () => {
    expect(() =>
      initializeSettings({
        // @ts-expect-error testing runtime validation
        unknown: true,
      }),
    ).toThrow()
  })

  it('throws when a setting is invalid', () => {
    expect(() =>
      initializeSettings({
        date: {
          format: '',
        },
      }),
    ).toThrow()
  })
})
