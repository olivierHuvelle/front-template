import { describe, expectTypeOf, it } from 'vitest'

import type { FieldAdapter } from '@/components/form/adapters/FieldAdapter'
import type { FormFieldApi } from '@/components/form/FormFieldApi'
import type { TextareaFieldProps } from '@/components/form/TextareaField'
import type { TextFieldProps } from '@/components/form/TextField'

describe('FormFieldApi types', () => {
  it('preserves a string value type', () => {
    expectTypeOf<FormFieldApi<string>['state']['value']>().toEqualTypeOf<string>()
  })

  it('preserves a nullable string value type', () => {
    expectTypeOf<FormFieldApi<string | null>['state']['value']>().toEqualTypeOf<string | null>()
  })
})

describe('TextField props', () => {
  it('makes the adapter optional for string values', () => {
    expectTypeOf<TextFieldProps<string>['adapter']>().toEqualTypeOf<
      FieldAdapter<string, string> | undefined
    >()
  })

  it('requires a nullable string adapter for nullable string values', () => {
    expectTypeOf<TextFieldProps<string | null>['adapter']>().toEqualTypeOf<
      FieldAdapter<string | null, string>
    >()
  })
})

describe('TextareaField props', () => {
  it('makes the adapter optional for string values', () => {
    expectTypeOf<TextareaFieldProps<string>['adapter']>().toEqualTypeOf<
      FieldAdapter<string, string> | undefined
    >()
  })

  it('requires a nullable string adapter for nullable string values', () => {
    expectTypeOf<TextareaFieldProps<string | null>['adapter']>().toEqualTypeOf<
      FieldAdapter<string | null, string>
    >()
  })
})

describe('Field adapter constraints', () => {
  it('rejects an incompatible adapter for nullable strings', () => {
    const numberAdapter: FieldAdapter<number, string> = {
      format: (value) => String(value),
      parse: (value) => Number(value),
    }

    const validAdapter: TextareaFieldProps<string | null>['adapter'] = {
      format: (value) => value ?? '',
      parse: (value) => (value === '' ? null : value),
    }

    expectTypeOf(validAdapter).toEqualTypeOf<FieldAdapter<string | null, string>>()

    // @ts-expect-error number adapter is incompatible with string | null
    const invalidAdapter: TextareaFieldProps<string | null>['adapter'] = numberAdapter

    expectTypeOf(invalidAdapter).toEqualTypeOf<FieldAdapter<string | null, string>>()
  })
})
