export type FieldSelection<TField extends PropertyKey> =
  | {
      only: TField[]
      except?: never
    }
  | {
      only?: never
      except: TField[]
    }
  | {
      only?: never
      except?: never
    }
