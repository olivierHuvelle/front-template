import { describe, expect, it } from 'vitest'

import { parseConfig } from '@/core/config/parseConfig'

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

  it('throws a readable error when a required variable is missing', () => {
    expect(() => parseConfig({})).toThrow(/Application configuration is invalid/)
    expect(() => parseConfig({})).toThrow(/API_URL/)
  })

  it('throws a readable error when API_URL is invalid', () => {
    expect(() =>
      parseConfig({
        VITE_API_URL: 'not-an-url',
      }),
    ).toThrow(/API_URL/)
  })

  it('throws when an unknown VITE variable is provided', () => {
    expect(() =>
      parseConfig({
        VITE_API_URL: validApiUrl,
        VITE_UNKNOWN: 'something',
      }),
    ).toThrow(/UNKNOWN/)
  })
})
