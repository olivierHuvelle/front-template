import { z } from 'zod'

import { Resource } from '@/core/resource/Resource'

export const todoSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  isCompleted: z.boolean().default(false),
  createdAt: z.coerce.date(),
})

export type Todo = z.infer<typeof todoSchema>

export const todoResource = new Resource('todo', todoSchema, {
  readOnlyFields: ['id', 'createdAt'],
  create: {
    except: ['isCompleted'],
  },
})
