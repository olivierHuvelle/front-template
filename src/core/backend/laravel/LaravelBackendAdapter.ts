import { z } from 'zod'

import type { BackendAdapter } from '@/core/backend/BackendAdapter'
import type { ValidationError } from '@/core/backend/ValidationError'
import type { ApiError } from '@/core/error/ApiError'

const laravelValidationErrorSchema = z.object({
  message: z.string().optional(),
  errors: z.record(z.string(), z.array(z.string())),
})

export class LaravelBackendAdapter implements BackendAdapter {
  public mapValidationError(error: ApiError): ValidationError | null {
    if (error.status !== 422) {
      return null
    }

    const result = laravelValidationErrorSchema.safeParse(error.data)

    if (!result.success) {
      return null
    }

    return {
      message: result.data.message,
      fields: result.data.errors,
    }
  }
}
