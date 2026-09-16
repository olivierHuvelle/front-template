import { describe, expect, it } from 'vitest'

import { todoResource } from '@/features/todo/todo.resource'

describe('todoResource', () => {
  it('has the expected resource name', () => {
    expect(todoResource.name).toBe('todo')
  })

  it('validates a valid todo', () => {
    const result = todoResource.schema.safeParse({
      id: 1,
      title: 'Learn TanStack Query',
      isCompleted: false,
    })

    expect(result.success).toBe(true)
  })

  it('applies the default value for isCompleted', () => {
    const todo = todoResource.schema.parse({
      id: 1,
      title: 'Learn TanStack Query',
    })

    expect(todo.isCompleted).toBe(false)
  })

  it('accepts a todo without a description', () => {
    const result = todoResource.schema.safeParse({
      id: 1,
      title: 'Learn TanStack Query',
    })

    expect(result.success).toBe(true)
  })

  it('rejects an empty title', () => {
    const result = todoResource.schema.safeParse({
      id: 1,
      title: '',
    })

    expect(result.success).toBe(false)
  })
})
