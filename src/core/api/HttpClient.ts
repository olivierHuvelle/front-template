import { env } from '@/core/config/config'
import { ApiError } from '@/core/error/ApiError'
import { NetworkError } from '@/core/error/NetworkError'
import { ResponseParseError } from '@/core/error/ResponseParseError'
import type { Logger } from '@/core/logger/Logger'
import { getLogger } from '@/core/logger/loggerRegistry'
import { HTTP_METHOD, type HttpMethod } from '@/core/route/HttpMethod'

export type HttpClientOptions = {
  baseUrl?: string
  logger?: Logger
}

export type HttpRequestOptions = {
  headers?: HeadersInit
  signal?: AbortSignal
}

export class HttpClient {
  private readonly baseUrl?: string
  private readonly logger?: Logger

  constructor(options: HttpClientOptions = {}) {
    this.baseUrl = options.baseUrl
    this.logger = options.logger
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
    const requestUrl = this.buildUrl(url)
    const logger = this.logger ?? getLogger()
    const startedAt = performance.now()

    logger.debug('HTTP request started', {
      method,
      url: requestUrl,
    })

    let response: Response

    try {
      response = await fetch(requestUrl, {
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
    } catch (error) {
      if (error instanceof TypeError) {
        throw new NetworkError(`Network request failed: ${method} ${requestUrl}`, {
          method,
          url: requestUrl,
          cause: error,
        })
      }

      throw error
    }

    logger.debug('HTTP request completed', {
      method,
      url: requestUrl,
      status: response.status,
      durationMs: performance.now() - startedAt,
    })

    if (!response.ok) {
      const data = await this.readResponse(response, method, requestUrl)

      throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, {
        status: response.status,
        statusText: response.statusText,
        method,
        url: requestUrl,
        data,
      })
    }

    return this.readResponse(response, method, requestUrl)
  }

  private async readResponse(
    response: Response,
    method: HttpMethod,
    url: string,
  ): Promise<unknown> {
    if (response.status === 204) {
      return undefined
    }

    const contentType = response.headers.get('content-type')

    if (!contentType?.includes('application/json')) {
      return undefined
    }

    try {
      return await response.json()
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new ResponseParseError(`Failed to parse JSON response: ${method} ${url}`, {
          method,
          url,
          cause: error,
        })
      }

      throw error
    }
  }

  private buildUrl(url: string): string {
    const baseUrl = this.baseUrl ?? env('API_URL')

    return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
  }
}
