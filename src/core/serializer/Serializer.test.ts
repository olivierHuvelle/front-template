import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { Resource } from '@/core/resource/Resource'
import { Serializer } from '@/core/serializer/Serializer'

const schema = z.object({
  id: z.number(),
  name: z.string().min(1),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  metadata: z.object({
    updatedAt: z.coerce.date(),
  }),
  events: z.array(
    z.object({
      occurredAt: z.coerce.date(),
    }),
  ),
})

const resource = new Resource('test', schema)
const serializer = new Serializer(resource)

const createValidData = () => ({
  id: 1,
  name: 'Test',
  active: true,
  createdAt: new Date('2026-09-17T12:30:00.000Z'),
  metadata: {
    updatedAt: new Date('2026-09-17T13:30:00.000Z'),
  },
  events: [
    {
      occurredAt: new Date('2026-09-17T14:30:00.000Z'),
    },
  ],
})

describe('Serializer', () => {
  describe('deserialize', () => {
    it('deserializes valid data', () => {
      const data = createValidData()

      expect(serializer.deserialize(data)).toEqual(data)
    })

    it('throws when data is invalid', () => {
      expect(() =>
        serializer.deserialize({
          ...createValidData(),
          id: 'invalid',
        }),
      ).toThrow()
    })

    it('deserializes ISO date strings to dates', () => {
      const data = {
        ...createValidData(),
        createdAt: '2026-09-17T12:30:00.000Z',
      }

      const result = serializer.deserialize(data)

      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.createdAt.toISOString()).toBe('2026-09-17T12:30:00.000Z')
    })

    it('deserializes nested ISO date strings to dates', () => {
      const data = {
        ...createValidData(),
        metadata: {
          updatedAt: '2026-09-17T13:30:00.000Z',
        },
      }

      const result = serializer.deserialize(data)

      expect(result.metadata.updatedAt).toBeInstanceOf(Date)
      expect(result.metadata.updatedAt.toISOString()).toBe('2026-09-17T13:30:00.000Z')
    })

    it('deserializes ISO date strings inside arrays', () => {
      const data = {
        ...createValidData(),
        events: [
          {
            occurredAt: '2026-09-17T14:30:00.000Z',
          },
        ],
      }

      const result = serializer.deserialize(data)

      expect(result.events[0].occurredAt).toBeInstanceOf(Date)
      expect(result.events[0].occurredAt.toISOString()).toBe('2026-09-17T14:30:00.000Z')
    })
  })

  describe('serialize', () => {
    it('serializes a complete resource', () => {
      const data = createValidData()

      expect(serializer.serialize(data)).toEqual({
        id: 1,
        name: 'Test',
        active: true,
        createdAt: '2026-09-17T12:30:00.000Z',
        metadata: {
          updatedAt: '2026-09-17T13:30:00.000Z',
        },
        events: [
          {
            occurredAt: '2026-09-17T14:30:00.000Z',
          },
        ],
      })
    })

    it('throws when a complete resource is invalid', () => {
      expect(() =>
        serializer.serialize({
          ...createValidData(),
          // @ts-expect-error testing runtime validation
          active: 'invalid',
        }),
      ).toThrow()
    })

    it('serializes only selected fields', () => {
      expect(
        serializer.serialize(
          {
            name: 'Test',
          },
          {
            fields: ['name'],
          },
        ),
      ).toEqual({
        name: 'Test',
      })
    })

    it('validates selected fields', () => {
      expect(() =>
        serializer.serialize(
          {
            name: '',
          },
          {
            fields: ['name'],
          },
        ),
      ).toThrow()
    })

    it('does not require fields that are not selected', () => {
      expect(
        serializer.serialize(
          {
            name: 'Test',
          },
          {
            fields: ['name'],
          },
        ),
      ).toEqual({
        name: 'Test',
      })
    })

    it('serializes a selected date field to ISO', () => {
      expect(
        serializer.serialize(
          {
            createdAt: new Date('2026-09-17T12:30:00.000Z'),
          },
          {
            fields: ['createdAt'],
          },
        ),
      ).toEqual({
        createdAt: '2026-09-17T12:30:00.000Z',
      })
    })

    it('serializes nested dates to ISO', () => {
      const result = serializer.serialize(createValidData())

      expect(result.metadata?.updatedAt).toBe('2026-09-17T13:30:00.000Z')
    })

    it('serializes dates inside arrays to ISO', () => {
      const result = serializer.serialize(createValidData())

      expect(result.events?.[0].occurredAt).toBe('2026-09-17T14:30:00.000Z')
    })

    it('excludes selected fields', () => {
      const data = {
        name: 'Test',
        active: true,
        createdAt: new Date('2026-09-17T12:30:00.000Z'),
        metadata: {
          updatedAt: new Date('2026-09-17T13:30:00.000Z'),
        },
        events: [],
      }

      expect(
        serializer.serialize(data, {
          exclude: ['id'],
        }),
      ).toEqual({
        name: 'Test',
        active: true,
        createdAt: '2026-09-17T12:30:00.000Z',
        metadata: {
          updatedAt: '2026-09-17T13:30:00.000Z',
        },
        events: [],
      })
    })

    it('still requires non-excluded fields', () => {
      expect(() =>
        serializer.serialize(
          {
            name: 'Test',
          },
          {
            exclude: ['id'],
          },
        ),
      ).toThrow()
    })
  })
})
