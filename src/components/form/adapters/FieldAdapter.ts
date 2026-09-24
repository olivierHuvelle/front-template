export type FieldAdapter<TValue, TInputValue> = {
  format: (value: TValue) => TInputValue
  parse: (value: TInputValue) => TValue
}
