import type { BackendAdapter } from '@/core/backend/BackendAdapter'
import { GenericBackendAdapter } from '@/core/backend/generic/GenericBackendAdapter'
import { LaravelBackendAdapter } from '@/core/backend/laravel/LaravelBackendAdapter'
import { env } from '@/core/config/config'
import type { ApiBackend } from '@/core/config/config.schema'

const adapters = {
  generic: new GenericBackendAdapter(),
  laravel: new LaravelBackendAdapter(),
} satisfies Record<ApiBackend, BackendAdapter>

export function backend(): BackendAdapter {
  return adapters[env('API_BACKEND')]
}
