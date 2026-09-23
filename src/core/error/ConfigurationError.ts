import { AppError } from '@/core/error/AppError'

export class ConfigurationError extends AppError {
  public readonly kind = 'configuration' as const

  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
  }
}
