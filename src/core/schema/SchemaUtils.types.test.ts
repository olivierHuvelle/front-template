import { describe, expectTypeOf, it } from 'vitest'
import { z } from 'zod'

import { SchemaUtils } from '@/core/schema/SchemaUtils'

describe('SchemaUtils types', () => {
  it('infers only selected fields', () => {
    const schema = z.object({
      id: z.number(),
      title: z.string(),
      completed: z.boolean(),
    })

    const pickedSchema = SchemaUtils.pick(schema, ['title', 'completed'])

    const result = pickedSchema.parse({
      title: 'Test',
      completed: true,
    })

    expectTypeOf(result).toEqualTypeOf<{
      title: string
      completed: boolean
    }>()
  })

  it('rejects fields that do not exist in the schema', () => {
    const schema = z.object({
      id: z.number(),
      title: z.string(),
    })

    SchemaUtils.pick(schema, [
      // @ts-expect-error unknown is not a schema field
      'unknown',
    ])
  })
})
