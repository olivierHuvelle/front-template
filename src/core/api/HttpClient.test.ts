import { afterEach, describe, expect, it, vi } from 'vitest'

import { HttpClient } from '@/core/api/HttpClient'
import { initializeConfig } from '@/core/config/config'
import { HTTP_METHOD } from '@/core/route/HttpMethod'

const BASE_URL = 'http://localhost:3000'

const client = new HttpClient({
  baseUrl: BASE_URL,
})

const url = (path: string): string => `${BASE_URL}${path}`

describe('HttpClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
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

  it('throws when the response is not successful', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Not found' }), {
        status: 404,
        statusText: 'Not Found',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    await expect(client.get('/todos/999')).rejects.toThrow('HTTP 404: Not Found')
  })

  it('does not require config during construction', () => {
    expect(() => new HttpClient()).not.toThrow()
  })

  it('resolves the configured base URL when making a request', async () => {
    initializeConfig({
      VITE_API_URL: 'http://localhost:8000/api',
    })

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    )

    const configuredClient = new HttpClient()

    await configuredClient.get('/todos')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/todos',
      expect.objectContaining({
        method: HTTP_METHOD.GET,
      }),
    )
  })
})
