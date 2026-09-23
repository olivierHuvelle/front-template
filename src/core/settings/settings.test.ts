import { beforeEach, describe, expect, it } from 'vitest'
import { ZodError } from 'zod'

import { SettingsError } from '@/core/error/SettingsError'
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

  it('throws a SettingsError when settings contain an unknown property', () => {
    expect.assertions(4)

    try {
      initializeSettings({
        // @ts-expect-error testing runtime validation
        unknown: true,
      })
    } catch (error) {
      expect(error).toBeInstanceOf(SettingsError)

      if (!(error instanceof SettingsError)) {
        throw error
      }

      expect(error.kind).toBe('settings')
      expect(error.message).toContain('Application settings are invalid')
      expect(error.cause).toBeInstanceOf(ZodError)
    }
  })

  it('throws a SettingsError when a setting is invalid', () => {
    expect.assertions(5)

    try {
      initializeSettings({
        date: {
          format: '',
        },
      })
    } catch (error) {
      expect(error).toBeInstanceOf(SettingsError)

      if (!(error instanceof SettingsError)) {
        throw error
      }

      expect(error.kind).toBe('settings')
      expect(error.message).toContain('Application settings are invalid')
      expect(error.message).toContain('date.format')
      expect(error.cause).toBeInstanceOf(ZodError)
    }
  })

  it('throws a SettingsError when dateTimeFormat is invalid', () => {
    expect.assertions(5)

    try {
      initializeSettings({
        date: {
          dateTimeFormat: '',
        },
      })
    } catch (error) {
      expect(error).toBeInstanceOf(SettingsError)

      if (!(error instanceof SettingsError)) {
        throw error
      }

      expect(error.kind).toBe('settings')
      expect(error.message).toContain('Application settings are invalid')
      expect(error.message).toContain('date.dateTimeFormat')
      expect(error.cause).toBeInstanceOf(ZodError)
    }
  })
})
