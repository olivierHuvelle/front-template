import type { BackendAdapter } from '@/core/backend/BackendAdapter'

export class GenericBackendAdapter implements BackendAdapter {
  public mapValidationError(): null {
    return null
  }
}
