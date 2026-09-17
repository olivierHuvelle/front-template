import { env } from '@/core/config/config'
import { HTTP_METHOD, type HttpMethod } from '@/core/route/HttpMethod'

export type HttpClientOptions = {
  baseUrl?: string
}

export type HttpRequestOptions = {
  headers?: HeadersInit
  signal?: AbortSignal
}

export class HttpClient {
  private readonly baseUrl: string

  constructor(options: HttpClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? env('API_URL')
  }

  public get(url: string, options?: HttpRequestOptions): Promise<unknown> {
    return this.request(HTTP_METHOD.GET, url, options)
  }

  public post(url: string, body?: unknown, options?: HttpRequestOptions): Promise<unknown> {
    return this.request(HTTP_METHOD.POST, url, options, body)
  }

  public put(url: string, body?: unknown, options?: HttpRequestOptions): Promise<unknown> {
    return this.request(HTTP_METHOD.PUT, url, options, body)
  }

  public patch(url: string, body?: unknown, options?: HttpRequestOptions): Promise<unknown> {
    return this.request(HTTP_METHOD.PATCH, url, options, body)
  }

  public delete(url: string, options?: HttpRequestOptions): Promise<unknown> {
    return this.request(HTTP_METHOD.DELETE, url, options)
  }

  private async request(
    method: HttpMethod,
    url: string,
    options: HttpRequestOptions = {},
    body?: unknown,
  ): Promise<unknown> {
    const response = await fetch(this.buildUrl(url), {
      method,
      headers: {
        ...(body !== undefined && {
          'Content-Type': 'application/json',
        }),
        ...options.headers,
      },
      signal: options.signal,
      ...(body !== undefined && {
        body: JSON.stringify(body),
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    if (response.status === 204) {
      // TODO implement later on
      return undefined
    }

    const contentType = response.headers.get('content-type')

    if (!contentType?.includes('application/json')) {
      // TODO implement later on
      return undefined
    }

    return response.json()
  }

  private buildUrl(url: string): string {
    return `${this.baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
  }
}
