import { describe, expect, it } from 'vitest'
import { ZodError } from 'zod'

import { parseConfig } from '@/core/config/parseConfig'
import { ConfigurationError } from '@/core/error/ConfigurationError'

describe('parseConfig', () => {
  const validApiUrl = 'http://localhost:3000'

  it('parses a valid configuration', () => {
    const config = parseConfig({
      VITE_API_URL: validApiUrl,
    })

    expect(config).toEqual({
      API_URL: validApiUrl,
    })
  })

  it('ignores non-VITE environment variables', () => {
    const config = parseConfig({
      MODE: 'development',
      DEV: true,
      PROD: false,
      VITE_API_URL: validApiUrl,
    })

    expect(config).toEqual({
      API_URL: validApiUrl,
    })
  })

  it('throws a ConfigurationError when a required variable is missing', () => {
    expect.assertions(5)

    try {
      parseConfig({})
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError)

      if (!(error instanceof ConfigurationError)) {
        throw error
      }

      expect(error.kind).toBe('configuration')
      expect(error.message).toContain('Application configuration is invalid')
      expect(error.message).toContain('API_URL')
      expect(error.cause).toBeInstanceOf(ZodError)
    }
  })

  it('throws a ConfigurationError when API_URL is invalid', () => {
    expect.assertions(4)

    try {
      parseConfig({
        VITE_API_URL: 'not-an-url',
      })
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError)

      if (!(error instanceof ConfigurationError)) {
        throw error
      }

      expect(error.kind).toBe('configuration')
      expect(error.message).toContain('API_URL')
      expect(error.cause).toBeInstanceOf(ZodError)
    }
  })

  it('throws a ConfigurationError when an unknown VITE variable is provided', () => {
    expect.assertions(4)

    try {
      parseConfig({
        VITE_API_URL: validApiUrl,
        VITE_UNKNOWN: 'something',
      })
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError)

      if (!(error instanceof ConfigurationError)) {
        throw error
      }

      expect(error.kind).toBe('configuration')
      expect(error.message).toContain('UNKNOWN')
      expect(error.cause).toBeInstanceOf(ZodError)
    }
  })
})
