import type { FieldAdapter } from '@/components/form/adapters/FieldAdapter'

export const nullableStringAdapter: FieldAdapter<string | null, string> = {
  format: (value) => value ?? '',
  parse: (value) => (value === '' ? null : value),
}
