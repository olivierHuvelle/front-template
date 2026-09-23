import type { ZodRawShape } from 'zod'

import type { ResourceOptions } from '@/core/resource/Resource'

type ResourceField<TShape extends ZodRawShape> = keyof TShape

type ReadOnlyFields<
  TShape extends ZodRawShape,
  TOptions extends ResourceOptions<TShape>,
> = TOptions extends {
  readonly readOnlyFields: readonly (infer TField)[]
}
  ? Extract<TField, ResourceField<TShape>>
  : never

type WritableFields<TShape extends ZodRawShape, TOptions extends ResourceOptions<TShape>> = Exclude<
  ResourceField<TShape>,
  ReadOnlyFields<TShape, TOptions>
>

type SelectedFields<TFields extends PropertyKey, TSelection> = TSelection extends {
  readonly only: readonly (infer TField)[]
}
  ? Extract<TField, TFields>
  : TSelection extends {
        readonly except: readonly (infer TField)[]
      }
    ? Exclude<TFields, TField>
    : TFields

export type CreateFields<
  TShape extends ZodRawShape,
  TOptions extends ResourceOptions<TShape>,
> = SelectedFields<
  WritableFields<TShape, TOptions>,
  TOptions extends {
    readonly create: infer TCreate
  }
    ? TCreate
    : undefined
>

export type UpdateFields<
  TShape extends ZodRawShape,
  TOptions extends ResourceOptions<TShape>,
> = SelectedFields<
  WritableFields<TShape, TOptions>,
  TOptions extends {
    readonly update: infer TUpdate
  }
    ? TUpdate
    : undefined
>
