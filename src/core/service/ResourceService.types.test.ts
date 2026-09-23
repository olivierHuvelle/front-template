import { expectTypeOf, test } from 'vitest'
import { z } from 'zod'

import { ResourceApi } from '@/core/api/ResourceApi'
import { Resource } from '@/core/resource/Resource'
import { createResourceService } from '@/core/service/ResourceService'

const schema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean(),
  createdAt: z.coerce.date(),
})

const service = createResourceService(
  new ResourceApi(
    new Resource('test', schema, {
      readOnlyFields: ['id', 'createdAt'],
      create: {
        except: ['completed'],
      },
    }),
  ),
)

test('preserves create mutation variable types', () => {
  expectTypeOf(service.useCreate).returns.toHaveProperty('mutate')

  type CreateMutation = ReturnType<typeof service.useCreate>
  type CreateVariables = Parameters<CreateMutation['mutate']>[0]

  expectTypeOf<CreateVariables>().toEqualTypeOf<{
    title: string
    description?: string
  }>()
})

test('preserves update mutation variable types', () => {
  expectTypeOf(service.useUpdate).returns.toHaveProperty('mutate')

  type UpdateMutation = ReturnType<typeof service.useUpdate>
  type UpdateVariables = Parameters<UpdateMutation['mutate']>[0]

  expectTypeOf<UpdateVariables>().toEqualTypeOf<{
    id: string | number
    data: Partial<{
      title: string
      description?: string
      completed: boolean
    }>
  }>()
})
