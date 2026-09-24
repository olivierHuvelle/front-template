import { describe, expect, it, expectTypeOf } from 'vitest'

import type { FieldAdapter } from '@/components/form/adapters/FieldAdapter'
import { nullableStringAdapter } from '@/components/form/adapters/nullableStringAdapter'

describe('nullableStringAdapter', () => {
  it('formats null as an empty string', () => {
    expect(nullableStringAdapter.format(null)).toBe('')
  })

  it('keeps strings when formatting', () => {
    expect(nullableStringAdapter.format('Hello')).toBe('Hello')
  })

  it('parses an empty string as null', () => {
    expect(nullableStringAdapter.parse('')).toBeNull()
  })

  it('keeps non-empty strings when parsing', () => {
    expect(nullableStringAdapter.parse('Hello')).toBe('Hello')
  })

  it('types nullableStringAdapter correctly', () => {
    expectTypeOf(nullableStringAdapter).toEqualTypeOf<FieldAdapter<string | null, string>>()
  })

  it('rejects an incompatible adapter', () => {
    const numberAdapter: FieldAdapter<number, string> = {
      format: (value) => String(value),
      parse: (value) => Number(value),
    }

    // @ts-expect-error number adapter cannot adapt a nullable string
    const adapter: FieldAdapter<string | null, string> = numberAdapter

    expectTypeOf(adapter).toEqualTypeOf<FieldAdapter<string | null, string>>()
  })
})
