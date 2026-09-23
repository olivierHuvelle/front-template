import { z } from 'zod'

import { Resource } from '@/core/resource/Resource'

export const noteSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  content: z.string().nullable(),
  category: z.enum(['personal', 'work']),
  pinned: z.boolean().default(false),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export const noteResource = new Resource('note', noteSchema, {
  readOnlyFields: ['id', 'created_at', 'updated_at'],

  create: {
    only: ['title', 'content', 'category', 'pinned'],
  },

  update: {
    only: ['title', 'content', 'category', 'pinned'],
  },
})

export type Note = z.infer<typeof noteSchema>
