import { expectTypeOf, test } from 'vitest'

import type { AppErrorKind } from '@/core/error/AppError'
import { ConfigurationError } from '@/core/error/ConfigurationError'

test('preserves the concrete error kind', () => {
  const error = new ConfigurationError('Invalid configuration')

  expectTypeOf(error.kind).toEqualTypeOf<'configuration'>()
  expectTypeOf(error).toMatchTypeOf<{
    kind: AppErrorKind
  }>()
})
