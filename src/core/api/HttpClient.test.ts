import { afterEach, describe, expect, it, vi } from 'vitest'

import { HttpClient } from '@/core/api/HttpClient'
import { initializeConfig } from '@/core/config/config'
import { ApiError } from '@/core/error/ApiError'
import { NetworkError } from '@/core/error/NetworkError'
import { ResponseParseError } from '@/core/error/ResponseParseError'
import type { Logger } from '@/core/logger/Logger'
import { getLogger } from '@/core/logger/loggerRegistry'
import { HTTP_METHOD } from '@/core/route/HttpMethod'

vi.mock('@/core/logger/loggerRegistry', () => ({
  getLogger: vi.fn(),
}))

const BASE_URL = 'http://localhost:3000'

const loggerMock = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
} satisfies Logger

vi.mocked(getLogger).mockReturnValue(loggerMock)

const client = new HttpClient({
  baseUrl: BASE_URL,
})

const url = (path: string): string => `${BASE_URL}${path}`

describe('HttpClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    loggerMock.debug.mockClear()
  })

  it('sends a GET request', async () => {
    const path = '/todos/1'

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    const result = await client.get(path)

    expect(fetchMock).toHaveBeenCalledWith(
      url(path),
      expect.objectContaining({
        method: HTTP_METHOD.GET,
      }),
    )

    expect(result).toEqual({
      id: 1,
    })
  })

  it('sends a POST request with a JSON body', async () => {
    const path = '/todos'

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 1, title: 'Test' }), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    const body = {
      title: 'Test',
    }

    await client.post(path, body)

    expect(fetchMock).toHaveBeenCalledWith(
      url(path),
      expect.objectContaining({
        method: HTTP_METHOD.POST,
        body: JSON.stringify(body),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    )
  })

  it.each([
    [HTTP_METHOD.PUT, 'put'],
    [HTTP_METHOD.PATCH, 'patch'],
  ] as const)('sends a %s request with a JSON body', async (method, clientMethod) => {
    const path = '/todos/1'

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    const body = {
      title: 'Updated',
    }

    await client[clientMethod](path, body)

    expect(fetchMock).toHaveBeenCalledWith(
      url(path),
      expect.objectContaining({
        method,
        body: JSON.stringify(body),
      }),
    )
  })

  it('sends a DELETE request', async () => {
    const path = '/todos/1'

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    )

    const result = await client.delete(path)

    expect(fetchMock).toHaveBeenCalledWith(
      url(path),
      expect.objectContaining({
        method: HTTP_METHOD.DELETE,
      }),
    )

    expect(result).toBeUndefined()
  })

  it('removes duplicate slashes between base URL and request URL', async () => {
    const path = '/todos'

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    )

    await client.get(path)

    expect(fetchMock).toHaveBeenCalledWith(url(path), expect.any(Object))
  })

  it('passes custom headers', async () => {
    const path = '/todos'

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    )

    await client.get(path, {
      headers: {
        Authorization: 'Bearer token',
      },
    })

    expect(fetchMock).toHaveBeenCalledWith(
      url(path),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
        }),
      }),
    )
  })

  it('passes the abort signal to fetch', async () => {
    const path = '/todos'

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    )

    const controller = new AbortController()

    await client.get(path, {
      signal: controller.signal,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      url(path),
      expect.objectContaining({
        signal: controller.signal,
      }),
    )
  })

  it('returns undefined when the response is not JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('OK', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      }),
    )

    const result = await client.get('/health')

    expect(result).toBeUndefined()
  })

  it('throws an ApiError when the response is not successful', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Not found' }), {
        status: 404,
        statusText: 'Not Found',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    expect.assertions(8)

    try {
      await client.get('/todos/999')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)

      if (!(error instanceof ApiError)) {
        throw error
      }

      expect(error.kind).toBe('api')
      expect(error.status).toBe(404)
      expect(error.statusText).toBe('Not Found')
      expect(error.method).toBe(HTTP_METHOD.GET)
      expect(error.url).toBe(`${BASE_URL}/todos/999`)
      expect(error.data).toEqual({
        message: 'Not found',
      })
      expect(error.message).toBe('HTTP 404: Not Found')
    }
  })

  it('preserves the API error response body', async () => {
    const data = {
      message: 'The given data was invalid.',
      errors: {
        title: ['The title field is required.'],
      },
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(data), {
        status: 422,
        statusText: 'Unprocessable Content',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    expect.assertions(3)

    try {
      await client.post('/todos', {})
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)

      if (!(error instanceof ApiError)) {
        throw error
      }

      expect(error.status).toBe(422)
      expect(error.data).toEqual(data)
    }
  })

  it('throws a ResponseParseError when a JSON response is malformed', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{"id": 1', {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    expect.assertions(6)

    try {
      await client.get('/todos/1')
    } catch (error) {
      expect(error).toBeInstanceOf(ResponseParseError)

      if (!(error instanceof ResponseParseError)) {
        throw error
      }

      expect(error.kind).toBe('response-parse')
      expect(error.method).toBe(HTTP_METHOD.GET)
      expect(error.url).toBe(`${BASE_URL}/todos/1`)
      expect(error.message).toBe(`Failed to parse JSON response: GET ${BASE_URL}/todos/1`)
      expect(error.cause).toBeInstanceOf(SyntaxError)
    }
  })

  it('preserves unexpected response parsing errors', async () => {
    const unexpectedError = new Error('Unexpected parsing failure')

    const response = new Response('{}', {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    vi.spyOn(response, 'json').mockRejectedValue(unexpectedError)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)

    await expect(client.get('/todos/1')).rejects.toBe(unexpectedError)
  })

  it('throws a NetworkError when fetch fails with a network error', async () => {
    const cause = new TypeError('Failed to fetch')

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(cause)

    expect.assertions(6)

    try {
      await client.get('/todos')
    } catch (error) {
      expect(error).toBeInstanceOf(NetworkError)

      if (!(error instanceof NetworkError)) {
        throw error
      }

      expect(error.kind).toBe('network')
      expect(error.method).toBe(HTTP_METHOD.GET)
      expect(error.url).toBe(`${BASE_URL}/todos`)
      expect(error.message).toBe(`Network request failed: GET ${BASE_URL}/todos`)
      expect(error.cause).toBe(cause)
    }
  })

  it('preserves AbortError when the request is aborted', async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError')

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(abortError)

    await expect(client.get('/todos')).rejects.toBe(abortError)
  })

  it('preserves unexpected fetch errors', async () => {
    const unexpectedError = new Error('Unexpected internal failure')

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(unexpectedError)

    await expect(client.get('/todos')).rejects.toBe(unexpectedError)
  })

  it('does not require config during construction', () => {
    expect(() => new HttpClient()).not.toThrow()
  })

  it('resolves the configured base URL when making a request', async () => {
    initializeConfig({
      VITE_API_URL: 'http://localhost:8000/api',
      VITE_LOG_LEVEL: 'debug',
    })

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    )

    const configuredClient = new HttpClient({
      logger: loggerMock,
    })

    await configuredClient.get('/todos')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/todos',
      expect.objectContaining({
        method: HTTP_METHOD.GET,
      }),
    )
  })

  it('logs when an HTTP request starts', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    )

    await client.get('/todos')

    expect(loggerMock.debug).toHaveBeenCalledWith('HTTP request started', {
      method: HTTP_METHOD.GET,
      url: `${BASE_URL}/todos`,
    })
  })

  it('logs when an HTTP request completes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    )

    await client.get('/todos')

    expect(loggerMock.debug).toHaveBeenCalledWith('HTTP request completed', {
      method: HTTP_METHOD.GET,
      url: `${BASE_URL}/todos`,
      status: 204,
      durationMs: expect.any(Number),
    })
  })

  it('logs completed requests even when the API response is unsuccessful', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Not found' }), {
        status: 404,
        statusText: 'Not Found',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    await expect(client.get('/todos/999')).rejects.toBeInstanceOf(ApiError)

    expect(loggerMock.debug).toHaveBeenCalledWith('HTTP request completed', {
      method: HTTP_METHOD.GET,
      url: `${BASE_URL}/todos/999`,
      status: 404,
      durationMs: expect.any(Number),
    })
  })
})
