import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FormErrorMapper } from '@/components/form/FormErrorMapper'
import { backend } from '@/core/backend/backend'
import type { BackendAdapter } from '@/core/backend/BackendAdapter'
import { ApiError } from '@/core/error/ApiError'
import { NetworkError } from '@/core/error/NetworkError'
import { ResponseParseError } from '@/core/error/ResponseParseError'

vi.mock('@/core/backend/backend', () => ({
  backend: vi.fn(),
}))

const mockedBackend = vi.mocked(backend)

const backendAdapter: BackendAdapter = {
  mapValidationError: vi.fn(),
}

describe('FormErrorMapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedBackend.mockReturnValue(backendAdapter)
  })

  it('maps a backend validation error', () => {
    vi.mocked(backendAdapter.mapValidationError).mockReturnValue({
      message: 'The given data was invalid.',
      fields: {
        title: ['The title field is required.'],
      },
    })

    const error = createApiError(422)

    expect(FormErrorMapper.map(error)).toEqual({
      message: 'The given data was invalid.',
      fields: {
        title: ['The title field is required.'],
      },
    })
  })

  it('uses a fallback message for a validation error without a message', () => {
    vi.mocked(backendAdapter.mapValidationError).mockReturnValue({
      fields: {
        title: ['The title field is required.'],
      },
    })

    expect(FormErrorMapper.map(createApiError(422))).toEqual({
      message: 'Please check the form fields.',
      fields: {
        title: ['The title field is required.'],
      },
    })
  })

  it.each([
    [401, 'Authentication is required.'],
    [403, 'You are not allowed to perform this action.'],
    [404, 'The requested resource was not found.'],
    [409, 'The request conflicts with the current state of the resource.'],
    [500, 'The server encountered an error. Please try again.'],
  ])('maps API status %i to a user-facing message', (status, message) => {
    vi.mocked(backendAdapter.mapValidationError).mockReturnValue(null)

    expect(FormErrorMapper.map(createApiError(status))).toEqual({
      message,
      fields: {},
    })
  })

  it('maps an unhandled API error to a generic request message', () => {
    vi.mocked(backendAdapter.mapValidationError).mockReturnValue(null)

    expect(FormErrorMapper.map(createApiError(400))).toEqual({
      message: 'The request could not be completed. Please check your data and try again.',
      fields: {},
    })
  })

  it('maps an unknown error to an unexpected error message', () => {
    expect(FormErrorMapper.map(new Error('Technical details'))).toEqual({
      message: 'An unexpected error occurred. Please try again.',
      fields: {},
    })
  })

  it('maps an unknown value to an unexpected error message', () => {
    expect(FormErrorMapper.map('something went wrong')).toEqual({
      message: 'An unexpected error occurred. Please try again.',
      fields: {},
    })
  })

  it('maps a network error to a user-facing message', () => {
    const error = new NetworkError('Network request failed', {
      method: 'POST',
      url: '/todos',
    })

    expect(FormErrorMapper.map(error)).toEqual({
      message: 'Unable to connect to the server. Please try again.',
      fields: {},
    })
  })

  it('maps a response parse error to a user-facing message', () => {
    const error = new ResponseParseError('Failed to parse response', {
      method: 'POST',
      url: '/todos',
    })

    expect(FormErrorMapper.map(error)).toEqual({
      message: 'The server returned an invalid response. Please try again.',
      fields: {},
    })
  })
})

function createApiError(status: number): ApiError {
  return new ApiError('API request failed', {
    status,
    statusText: 'Error',
    method: 'POST',
    url: '/todos',
    data: null,
  })
}
