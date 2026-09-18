import { z } from 'zod'

import { Resource } from '@/core/resource/Resource'

const todoSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  description: z.string().nullable(),
  completed: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Todo = z.infer<typeof todoSchema>

export const todoResource = new Resource('todo', todoSchema, {
  readOnlyFields: ['id', 'created_at', 'updated_at'],
  create: {
    except: ['completed'],
  },
})
