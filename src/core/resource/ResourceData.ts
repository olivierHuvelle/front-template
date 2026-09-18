import { z } from 'zod'

import type { Resource } from '@/core/resource/Resource'

// Any generic Resource specialization is accepted here.
// Concrete types are preserved through TResource.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResource = Resource<any, any>

type ResourceData<TResource extends AnyResource> = z.infer<TResource['schema']>

type ResourceOptionsOf<TResource extends AnyResource> = TResource['$options']

type ReadOnlyFields<TResource extends AnyResource> =
  ResourceOptionsOf<TResource> extends {
    readonly readOnlyFields: readonly (infer TField)[]
  }
    ? TField
    : never

type WritableFields<TResource extends AnyResource> = Exclude<
  keyof ResourceData<TResource>,
  ReadOnlyFields<TResource>
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

type CreateFields<TResource extends AnyResource> = SelectedFields<
  WritableFields<TResource>,
  ResourceOptionsOf<TResource> extends {
    readonly create: infer TCreate
  }
    ? TCreate
    : undefined
>

type UpdateFields<TResource extends AnyResource> = SelectedFields<
  WritableFields<TResource>,
  ResourceOptionsOf<TResource> extends {
    readonly update: infer TUpdate
  }
    ? TUpdate
    : undefined
>

export type CreateData<TResource extends AnyResource> = Pick<
  ResourceData<TResource>,
  Extract<CreateFields<TResource>, keyof ResourceData<TResource>>
>

export type UpdateData<TResource extends AnyResource> = Partial<
  Pick<ResourceData<TResource>, Extract<UpdateFields<TResource>, keyof ResourceData<TResource>>>
>
