import { describe, expect, it } from 'vitest'

import { todoResource } from '@/features/todo/todo.resource'

const createValidTodo = () => ({
  id: 1,
  title: 'Learn TanStack Query',
  description: 'Learn how to manage server state',
  completed: false,
  created_at: new Date('2026-09-18T08:00:00.000Z'),
  updated_at: new Date('2026-09-18T09:00:00.000Z'),
})

describe('todoResource', () => {
  it('has the expected resource name', () => {
    expect(todoResource.name).toBe('todo')
  })

  it('validates a valid todo', () => {
    const result = todoResource.schema.safeParse(createValidTodo())

    expect(result.success).toBe(true)
  })

  it('accepts a todo with a null description', () => {
    const result = todoResource.schema.safeParse({
      ...createValidTodo(),
      description: null,
    })

    expect(result.success).toBe(true)
  })

  it('rejects a todo without a description', () => {
    const result = todoResource.schema.safeParse({
      ...createValidTodo(),
      description: undefined,
    })

    expect(result.success).toBe(false)
  })

  it('rejects an empty title', () => {
    const result = todoResource.schema.safeParse({
      ...createValidTodo(),
      title: '',
    })

    expect(result.success).toBe(false)
  })

  it('has the expected read-only fields', () => {
    expect(todoResource.readOnlyFields).toEqual(['id', 'created_at', 'updated_at'])
  })

  it('has the expected create fields', () => {
    expect(todoResource.createFields).toEqual(['title', 'description'])
  })

  it('has the expected update fields', () => {
    expect(todoResource.updateFields).toEqual(['title', 'description', 'completed'])
  })
})
