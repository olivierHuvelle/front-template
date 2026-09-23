import { describe, expect, expectTypeOf, it } from 'vitest'
import { z } from 'zod'

import { Resource } from '@/core/resource/Resource'
import type { CreateData, UpdateData } from '@/core/resource/ResourceData'

const schema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  isCompleted: z.boolean(),
  createdAt: z.coerce.date(),
})

const resource = new Resource('todo', schema, {
  readOnlyFields: ['id', 'createdAt'],
  create: {
    except: ['isCompleted'],
  },
})

type Options = typeof resource.$options
type Create = CreateData<typeof resource>
type Update = UpdateData<typeof resource>

describe('Resource type inference', () => {
  it('creates the test resource', () => {
    expect(resource.name).toBe('todo')
  })

  it('preserves read-only field literals', () => {
    expectTypeOf<Options['readOnlyFields']>().toEqualTypeOf<readonly ['id', 'createdAt']>()
  })

  it('preserves create except field literals', () => {
    expectTypeOf<Options['create']['except']>().toEqualTypeOf<readonly ['isCompleted']>()
  })

  it('preserves read-only field literals', () => {
    expectTypeOf<Options['readOnlyFields']>().toEqualTypeOf<readonly ['id', 'createdAt']>()
  })

  it('derives create data', () => {
    expectTypeOf<Create>().toEqualTypeOf<{
      title: string
      description?: string
    }>()
  })

  it('derives update data', () => {
    expectTypeOf<Update>().toEqualTypeOf<{
      title?: string
      description?: string
      isCompleted?: boolean
    }>()
  })

  it('derives create schema data', () => {
    const data = resource.createSchema.parse({
      title: 'Test',
    })

    expectTypeOf(data).toEqualTypeOf<Create>()
  })

  it('create schema accepts valid create data', () => {
    expect(
      resource.createSchema.parse({
        title: 'Test',
      }),
    ).toEqual({
      title: 'Test',
    })
  })

  it('create schema excludes non-create fields', () => {
    const result = resource.createSchema.parse({
      title: 'Test',
      isCompleted: true,
      id: 42,
    })

    expect(result).toEqual({
      title: 'Test',
    })
  })

  it('create schema preserves field validation', () => {
    const validatedSchema = z.object({
      id: z.number(),
      title: z.string().min(1),
    })

    const validatedResource = new Resource('test', validatedSchema, {
      readOnlyFields: ['id'],
    })

    expect(() =>
      validatedResource.createSchema.parse({
        title: '',
      }),
    ).toThrow()
  })
  it('derives update schema data', () => {
    const data = resource.updateSchema.parse({
      isCompleted: true,
    })

    expectTypeOf(data).toEqualTypeOf<Update>()
  })

  it('update schema accepts partial update data', () => {
    expect(
      resource.updateSchema.parse({
        isCompleted: true,
      }),
    ).toEqual({
      isCompleted: true,
    })
  })

  it('update schema accepts empty update data', () => {
    expect(resource.updateSchema.parse({})).toEqual({})
  })

  it('update schema excludes read-only fields', () => {
    const result = resource.updateSchema.parse({
      title: 'Updated',
      id: 42,
      createdAt: new Date(),
    })

    expect(result).toEqual({
      title: 'Updated',
    })
  })

  it('update schema preserves field validation', () => {
    const validatedSchema = z.object({
      id: z.number(),
      title: z.string().min(1),
    })

    const validatedResource = new Resource('test', validatedSchema, {
      readOnlyFields: ['id'],
    })

    expect(() =>
      validatedResource.updateSchema.parse({
        title: '',
      }),
    ).toThrow()
  })
})

describe('Resource data type constraints', () => {
  it('accepts valid create data', () => {
    const data: Create = {
      title: 'Test',
    }

    expectTypeOf(data).toMatchTypeOf<Create>()
  })

  it('accepts valid update data', () => {
    const data: Update = {
      isCompleted: true,
    }

    expectTypeOf(data).toMatchTypeOf<Update>()
  })

  it('rejects read-only fields on create', () => {
    const data: Create = {
      title: 'Test',

      // @ts-expect-error id is read-only
      id: 42,
    }

    expectTypeOf(data).toMatchTypeOf<Create>()
  })

  it('rejects excluded fields on create', () => {
    const data: Create = {
      title: 'Test',

      // @ts-expect-error isCompleted is excluded from create
      isCompleted: true,
    }

    expectTypeOf(data).toMatchTypeOf<Create>()
  })

  it('rejects read-only fields on update', () => {
    const data: Update = {
      // @ts-expect-error createdAt is read-only
      createdAt: new Date(),
    }

    expectTypeOf(data).toMatchTypeOf<Update>()
  })
})
