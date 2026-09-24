export type FormFieldApi<TValue> = {
  name: string
  state: {
    value: TValue
    meta: {
      errors: readonly unknown[]
      isBlurred: boolean
      isDirty: boolean
    }
  }
  handleBlur: () => void
  handleChange: (value: NoInfer<TValue>) => void
}
