import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { SchemaUtils } from '@/core/schema/SchemaUtils'

const schema = z.object({
  id: z.number(),
  title: z.string().min(1),
  completed: z.boolean(),
})

describe('SchemaUtils', () => {
  describe('pick', () => {
    it('creates a schema containing only selected fields', () => {
      const pickedSchema = SchemaUtils.pick(schema, ['title', 'completed'])

      expect(
        pickedSchema.parse({
          title: 'Test',
          completed: true,
        }),
      ).toEqual({
        title: 'Test',
        completed: true,
      })
    })

    it('preserves field validation', () => {
      const pickedSchema = SchemaUtils.pick(schema, ['title'])

      expect(() =>
        pickedSchema.parse({
          title: '',
        }),
      ).toThrow()
    })

    it('does not require fields that were not selected', () => {
      const pickedSchema = SchemaUtils.pick(schema, ['title'])

      expect(
        pickedSchema.parse({
          title: 'Test',
        }),
      ).toEqual({
        title: 'Test',
      })
    })
  })
})
