import { AppError } from '@/core/error/AppError'

export class SettingsError extends AppError {
  public readonly kind = 'settings' as const

  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
  }
}
