import type { FieldAdapter } from '@/components/form/adapters/FieldAdapter'

export const stringAdapter: FieldAdapter<string, string> = {
  format: (value) => value,
  parse: (value) => value,
}
