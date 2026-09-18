export type FieldSelection<TField extends PropertyKey> =
  | {
      readonly only: readonly TField[]
      readonly except?: never
    }
  | {
      readonly only?: never
      readonly except: readonly TField[]
    }
  | {
      readonly only?: never
      readonly except?: never
    }
