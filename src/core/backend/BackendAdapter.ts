import type { ApiError } from '@/core/error/ApiError'
import type { ValidationError } from '@/core/backend/ValidationError'

export interface BackendAdapter {
  mapValidationError(error: ApiError): ValidationError | null
}
