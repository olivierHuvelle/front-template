import { z } from 'zod'

import type { Resource } from '@/core/resource/Resource'
import type { CreateFields, UpdateFields } from '@/core/resource/ResourceFields'

// Any generic Resource specialization is accepted here.
// Concrete types are preserved through TResource.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResource = Resource<any, any>

type ResourceData<TResource extends AnyResource> = z.infer<TResource['schema']>

type ResourceShape<TResource extends AnyResource> = TResource['schema']['shape']

type ResourceOptionsOf<TResource extends AnyResource> = TResource['$options']

export type CreateData<TResource extends AnyResource> = Pick<
  ResourceData<TResource>,
  Extract<
    CreateFields<ResourceShape<TResource>, ResourceOptionsOf<TResource>>,
    keyof ResourceData<TResource>
  >
>

export type UpdateData<TResource extends AnyResource> = Partial<
  Pick<
    ResourceData<TResource>,
    Extract<
      UpdateFields<ResourceShape<TResource>, ResourceOptionsOf<TResource>>,
      keyof ResourceData<TResource>
    >
  >
>
