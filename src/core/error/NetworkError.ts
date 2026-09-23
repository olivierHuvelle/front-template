import { AppError } from '@/core/error/AppError'
import type { HttpMethod } from '@/core/route/HttpMethod'

export type NetworkErrorOptions = {
  method: HttpMethod
  url: string
  cause?: unknown
}

export class NetworkError extends AppError {
  public readonly kind = 'network' as const

  public readonly method: HttpMethod
  public readonly url: string

  constructor(message: string, options: NetworkErrorOptions) {
    super(message, {
      cause: options.cause,
    })

    this.method = options.method
    this.url = options.url
  }
}
