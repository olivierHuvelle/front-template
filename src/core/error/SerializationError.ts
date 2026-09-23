import { AppError } from '@/core/error/AppError'

export type SerializationOperation = 'serialize' | 'deserialize'

export type SerializationErrorOptions = {
  resource: string
  operation: SerializationOperation
  cause?: unknown
}

export class SerializationError extends AppError {
  public readonly kind = 'serialization' as const

  public readonly resource: string
  public readonly operation: SerializationOperation

  constructor(message: string, options: SerializationErrorOptions) {
    super(message, {
      cause: options.cause,
    })

    this.resource = options.resource
    this.operation = options.operation
  }
}
