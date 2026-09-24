import { describe, expect, it } from 'vitest'

import { LaravelBackendAdapter } from '@/core/backend/laravel/LaravelBackendAdapter'
import { ApiError } from '@/core/error/ApiError'

function createApiError(status: number, data: unknown): ApiError {
  return new ApiError('API request failed', {
    status,
    statusText: 'Unprocessable Content',
    method: 'POST',
    url: '/todos',
    data,
  })
}

describe('LaravelBackendAdapter', () => {
  const adapter = new LaravelBackendAdapter()

  it('maps a Laravel 422 validation error', () => {
    const error = createApiError(422, {
      message: 'The given data was invalid.',
      errors: {
        title: ['The title field is required.'],
      },
    })

    expect(adapter.mapValidationError(error)).toEqual({
      message: 'The given data was invalid.',
      fields: {
        title: ['The title field is required.'],
      },
    })
  })

  it('preserves multiple fields and messages', () => {
    const error = createApiError(422, {
      message: 'The given data was invalid.',
      errors: {
        title: ['The title field is required.', 'The title must be at least 3 characters.'],
        description: ['The description must be a string.'],
      },
    })

    expect(adapter.mapValidationError(error)).toEqual({
      message: 'The given data was invalid.',
      fields: {
        title: ['The title field is required.', 'The title must be at least 3 characters.'],
        description: ['The description must be a string.'],
      },
    })
  })

  it('preserves dotted field paths', () => {
    const error = createApiError(422, {
      message: 'The given data was invalid.',
      errors: {
        'medications.0.name': ['The medications.0.name field is required.'],
      },
    })

    expect(adapter.mapValidationError(error)).toEqual({
      message: 'The given data was invalid.',
      fields: {
        'medications.0.name': ['The medications.0.name field is required.'],
      },
    })
  })

  it('ignores non-422 errors', () => {
    const error = createApiError(500, {
      message: 'Server error',
      errors: {
        title: ['Something went wrong.'],
      },
    })

    expect(adapter.mapValidationError(error)).toBeNull()
  })

  it('returns null for an invalid 422 payload', () => {
    const error = createApiError(422, {
      message: 'The given data was invalid.',
      errors: {
        title: 'The title field is required.',
      },
    })

    expect(adapter.mapValidationError(error)).toBeNull()
  })

  it('returns null when the response data is null', () => {
    const error = createApiError(422, null)

    expect(adapter.mapValidationError(error)).toBeNull()
  })
})
