import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { Resource } from '@/core/resource/Resource'

describe('Resource', () => {
  const schema = z.object({
    id: z.number(),
    name: z.string(),
  })

  const resource = new Resource('test', schema)

  it('stores the resource name', () => {
    expect(resource.name).toBe('test')
  })

  it('stores the Zod schema', () => {
    expect(resource.schema).toBe(schema)
  })

  it('keeps Zod validation available through the schema', () => {
    const result = resource.schema.safeParse({
      id: 1,
      name: 'Test',
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid data through the schema', () => {
    const result = resource.schema.safeParse({
      id: 'invalid',
      name: 'Test',
    })

    expect(result.success).toBe(false)
  })
})
