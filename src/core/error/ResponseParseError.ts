import { AppError } from '@/core/error/AppError'
import type { HttpMethod } from '@/core/route/HttpMethod'

export type ResponseParseErrorOptions = {
  method: HttpMethod
  url: string
  cause?: unknown
}

export class ResponseParseError extends AppError {
  public readonly kind = 'response-parse' as const

  public readonly method: HttpMethod
  public readonly url: string

  constructor(message: string, options: ResponseParseErrorOptions) {
    super(message, {
      cause: options.cause,
    })

    this.method = options.method
    this.url = options.url
  }
}
