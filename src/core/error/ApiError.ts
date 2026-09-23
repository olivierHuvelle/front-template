import { AppError } from '@/core/error/AppError'
import type { HttpMethod } from '@/core/route/HttpMethod'

export type ApiErrorOptions = {
  status: number
  statusText: string
  method: HttpMethod
  url: string
  data?: unknown
  cause?: unknown
}

export class ApiError extends AppError {
  public readonly kind = 'api' as const

  public readonly status: number
  public readonly statusText: string
  public readonly method: HttpMethod
  public readonly url: string
  public readonly data?: unknown

  constructor(message: string, options: ApiErrorOptions) {
    super(message, {
      cause: options.cause,
    })

    this.status = options.status
    this.statusText = options.statusText
    this.method = options.method
    this.url = options.url
    this.data = options.data
  }
}
