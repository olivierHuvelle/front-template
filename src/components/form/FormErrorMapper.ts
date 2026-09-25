import { backend } from '@/core/backend/backend'
import { ApiError } from '@/core/error/ApiError'
import { NetworkError } from '@/core/error/NetworkError'
import { ResponseParseError } from '@/core/error/ResponseParseError'

import type { FormSubmissionError } from '@/components/form/FormSubmissionError'

export class FormErrorMapper {
  public static map(error: unknown): FormSubmissionError {
    if (error instanceof ApiError) {
      const validationError = backend().mapValidationError(error)

      if (validationError) {
        return {
          message: validationError.message ?? 'Please check the form fields.',
          fields: validationError.fields,
        }
      }

      return {
        message: this.mapApiError(error),
        fields: {},
      }
    }

    if (error instanceof NetworkError) {
      return {
        message: 'Unable to connect to the server. Please try again.',
        fields: {},
      }
    }

    if (error instanceof ResponseParseError) {
      return {
        message: 'The server returned an invalid response. Please try again.',
        fields: {},
      }
    }

    return {
      message: 'An unexpected error occurred. Please try again.',
      fields: {},
    }
  }

  private static mapApiError(error: ApiError): string {
    switch (error.status) {
      case 401:
        return 'Authentication is required.'

      case 403:
        return 'You are not allowed to perform this action.'

      case 404:
        return 'The requested resource was not found.'

      case 409:
        return 'The request conflicts with the current state of the resource.'

      default:
        if (error.status >= 500) {
          return 'The server encountered an error. Please try again.'
        }

        return 'The request could not be completed. Please check your data and try again.'
    }
  }
}
