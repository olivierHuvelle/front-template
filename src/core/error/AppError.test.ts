import { describe, expect, it } from 'vitest'

import { AppError } from '@/core/error/AppError'
import { ConfigurationError } from '@/core/error/ConfigurationError'

describe('AppError', () => {
  it('provides a common base for known application errors', () => {
    const error = new ConfigurationError('Invalid configuration')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)

    expect(error.name).toBe('ConfigurationError')
    expect(error.kind).toBe('configuration')
    expect(error.message).toBe('Invalid configuration')
  })

  it('preserves the original error as cause', () => {
    const cause = new Error('Original error')

    const error = new ConfigurationError('Invalid configuration', {
      cause,
    })

    expect(error.cause).toBe(cause)
  })
})
