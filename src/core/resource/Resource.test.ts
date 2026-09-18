import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { Resource } from '@/core/resource/Resource'

const schema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

describe('Resource', () => {
  describe('readOnlyFields', () => {
    it('has no read-only fields by default', () => {
      const resource = new Resource('test', schema)

      expect(resource.readOnlyFields).toEqual([])
    })

    it('stores read-only fields', () => {
      const resource = new Resource('test', schema, {
        readOnlyFields: ['id', 'createdAt', 'updatedAt'],
      })

      expect(resource.readOnlyFields).toEqual(['id', 'createdAt', 'updatedAt'])
    })
  })

  describe('createFields', () => {
    it('uses all schema fields by default', () => {
      const resource = new Resource('test', schema)

      expect(resource.createFields).toEqual([
        'id',
        'name',
        'description',
        'active',
        'createdAt',
        'updatedAt',
      ])
    })

    it('excludes read-only fields by default', () => {
      const resource = new Resource('test', schema, {
        readOnlyFields: ['id', 'createdAt', 'updatedAt'],
      })

      expect(resource.createFields).toEqual(['name', 'description', 'active'])
    })

    it('keeps only selected writable fields', () => {
      const resource = new Resource('test', schema, {
        readOnlyFields: ['id', 'createdAt', 'updatedAt'],
        create: {
          only: ['name', 'description'],
        },
      })

      expect(resource.createFields).toEqual(['name', 'description'])
    })

    it('excludes selected writable fields', () => {
      const resource = new Resource('test', schema, {
        readOnlyFields: ['id', 'createdAt', 'updatedAt'],
        create: {
          except: ['active'],
        },
      })

      expect(resource.createFields).toEqual(['name', 'description'])
    })

    it('throws when only contains a read-only field', () => {
      expect(
        () =>
          new Resource('test', schema, {
            readOnlyFields: ['id'],
            create: {
              only: ['name', 'id'],
            },
          }),
      ).toThrow('Field "id" is not writable')
    })

    it('throws when except contains a read-only field', () => {
      expect(
        () =>
          new Resource('test', schema, {
            readOnlyFields: ['id'],
            create: {
              except: ['id'],
            },
          }),
      ).toThrow('Field "id" is not writable')
    })
  })

  describe('updateFields', () => {
    it('excludes read-only fields by default', () => {
      const resource = new Resource('test', schema, {
        readOnlyFields: ['id', 'createdAt', 'updatedAt'],
      })

      expect(resource.updateFields).toEqual(['name', 'description', 'active'])
    })

    it('keeps only selected writable fields', () => {
      const resource = new Resource('test', schema, {
        readOnlyFields: ['id', 'createdAt', 'updatedAt'],
        update: {
          only: ['name', 'active'],
        },
      })

      expect(resource.updateFields).toEqual(['name', 'active'])
    })

    it('excludes selected writable fields', () => {
      const resource = new Resource('test', schema, {
        readOnlyFields: ['id', 'createdAt', 'updatedAt'],
        update: {
          except: ['description'],
        },
      })

      expect(resource.updateFields).toEqual(['name', 'active'])
    })

    it('throws when only contains a read-only field', () => {
      expect(
        () =>
          new Resource('test', schema, {
            readOnlyFields: ['id'],
            update: {
              only: ['id'],
            },
          }),
      ).toThrow('Field "id" is not writable')
    })

    it('throws when except contains a read-only field', () => {
      expect(
        () =>
          new Resource('test', schema, {
            readOnlyFields: ['id'],
            update: {
              except: ['id'],
            },
          }),
      ).toThrow('Field "id" is not writable')
    })
  })
})
