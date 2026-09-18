import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { HttpClient } from '@/core/api/HttpClient'
import { ResourceApi } from '@/core/api/ResourceApi'
import { Resource } from '@/core/resource/Resource'

const schema = z.object({
  id: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  completed: z.boolean(),
  createdAt: z.coerce.date(),
})

const resource = new Resource('todo', schema, {
  readOnlyFields: ['id', 'createdAt'],
  create: {
    except: ['completed'],
  },
})

const createResponse = () => ({
  id: 1,
  title: 'Test',
  description: 'Description',
  completed: false,
  createdAt: '2026-09-18T08:00:00.000Z',
})

describe('ResourceApi', () => {
  const httpClient = new HttpClient({
    baseUrl: 'http://localhost',
  })

  const api = new ResourceApi(resource, {
    httpClient,
  })

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('gets all resources', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValue([
      createResponse(),
      {
        ...createResponse(),
        id: 2,
        title: 'Test 2',
      },
    ])

    const result = await api.getAll()

    expect(httpClient.get).toHaveBeenCalledWith('/todos', undefined)

    expect(result).toHaveLength(2)
    expect(result[0].createdAt).toBeInstanceOf(Date)
    expect(result[1].createdAt).toBeInstanceOf(Date)
  })

  it('gets and deserializes one resource', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValue(createResponse())

    const result = await api.get(42)

    expect(httpClient.get).toHaveBeenCalledWith('/todos/42', undefined)

    expect(result).toEqual({
      id: 1,
      title: 'Test',
      description: 'Description',
      completed: false,
      createdAt: new Date('2026-09-18T08:00:00.000Z'),
    })
  })

  it('encodes resource ids in URLs', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValue(createResponse())

    await api.get('todo/42')

    expect(httpClient.get).toHaveBeenCalledWith('/todos/todo%2F42', undefined)
  })

  it('creates a resource using create fields', async () => {
    vi.spyOn(httpClient, 'post').mockResolvedValue(createResponse())

    const result = await api.create({
      title: 'Test',
      description: 'Description',
    })

    expect(httpClient.post).toHaveBeenCalledWith(
      '/todos',
      {
        title: 'Test',
        description: 'Description',
      },
      undefined,
    )

    expect(result).toEqual({
      id: 1,
      title: 'Test',
      description: 'Description',
      completed: false,
      createdAt: new Date('2026-09-18T08:00:00.000Z'),
    })
  })

  it('updates only provided fields', async () => {
    vi.spyOn(httpClient, 'patch').mockResolvedValue({
      ...createResponse(),
      completed: true,
    })

    const result = await api.update(42, {
      completed: true,
    })

    expect(httpClient.patch).toHaveBeenCalledWith(
      '/todos/42',
      {
        completed: true,
      },
      undefined,
    )

    expect(result).toEqual({
      id: 1,
      title: 'Test',
      description: 'Description',
      completed: true,
      createdAt: new Date('2026-09-18T08:00:00.000Z'),
    })
  })

  it('deletes a resource', async () => {
    vi.spyOn(httpClient, 'delete').mockResolvedValue(undefined)

    await api.delete(42)

    expect(httpClient.delete).toHaveBeenCalledWith('/todos/42', undefined)
  })

  it('passes request options to the HTTP client', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValue(createResponse())

    const controller = new AbortController()

    await api.get(42, {
      signal: controller.signal,
      headers: {
        Authorization: 'Bearer token',
      },
    })

    expect(httpClient.get).toHaveBeenCalledWith('/todos/42', {
      signal: controller.signal,
      headers: {
        Authorization: 'Bearer token',
      },
    })
  })

  it('validates API responses', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValue({
      ...createResponse(),
      id: 'invalid',
    })

    await expect(api.get(42)).rejects.toThrow()
  })
})
