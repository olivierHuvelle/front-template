import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import type { ResourceApi } from '@/core/api/ResourceApi'
import { ResourceQuery } from '@/core/query/ResourceQuery'
import { Resource } from '@/core/resource/Resource'
import { createResourceService } from '@/core/service/ResourceService'

const schema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
})

const resource = new Resource('test', schema, {
  readOnlyFields: ['id'],
  create: {
    except: ['completed'],
  },
})

type TestApi = ResourceApi<typeof schema.shape, typeof resource.$options>

function createApiMock() {
  const getAll = vi.fn()
  const get = vi.fn()
  const create = vi.fn()
  const update = vi.fn()
  const deleteResource = vi.fn()

  const api = {
    resource,
    getAll,
    get,
    create,
    update,
    delete: deleteResource,
  } as unknown as TestApi

  return {
    api,
    getAll,
    get,
    create,
    update,
    deleteResource,
  }
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

describe('ResourceService', () => {
  it('gets all resources', async () => {
    const { api, getAll } = createApiMock()

    getAll.mockResolvedValue([
      {
        id: 1,
        title: 'Test',
        completed: false,
      },
    ])

    const query = new ResourceQuery(api)
    const service = createResourceService(query)
    const queryClient = createQueryClient()

    const { result } = renderHook(() => service.useGetAll(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(getAll).toHaveBeenCalledOnce()

    expect(result.current.data).toEqual([
      {
        id: 1,
        title: 'Test',
        completed: false,
      },
    ])
  })

  it('gets one resource', async () => {
    const { api, get } = createApiMock()

    get.mockResolvedValue({
      id: 42,
      title: 'Test',
      completed: false,
    })

    const query = new ResourceQuery(api)
    const service = createResourceService(query)
    const queryClient = createQueryClient()

    const { result } = renderHook(() => service.useGet(42), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(get).toHaveBeenCalledOnce()
    expect(get).toHaveBeenCalledWith(42, expect.any(Object))

    expect(result.current.data).toEqual({
      id: 42,
      title: 'Test',
      completed: false,
    })
  })

  it('creates a resource', async () => {
    const { api, create } = createApiMock()

    create.mockResolvedValue({
      id: 42,
      title: 'Created',
      completed: false,
    })

    const query = new ResourceQuery(api)
    const service = createResourceService(query)
    const queryClient = createQueryClient()

    const { result } = renderHook(() => service.useCreate(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync({
        title: 'Created',
      })
    })

    expect(create).toHaveBeenCalledOnce()
    expect(create).toHaveBeenCalledWith({
      title: 'Created',
    })
  })

  it('updates a resource', async () => {
    const { api, update } = createApiMock()

    update.mockResolvedValue({
      id: 42,
      title: 'Updated',
      completed: true,
    })

    const query = new ResourceQuery(api)
    const service = createResourceService(query)
    const queryClient = createQueryClient()

    const { result } = renderHook(() => service.useUpdate(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync({
        id: 42,
        data: {
          completed: true,
        },
      })
    })

    expect(update).toHaveBeenCalledOnce()
    expect(update).toHaveBeenCalledWith(42, {
      completed: true,
    })
  })

  it('deletes a resource', async () => {
    const { api, deleteResource } = createApiMock()

    deleteResource.mockResolvedValue(undefined)

    const query = new ResourceQuery(api)
    const service = createResourceService(query)
    const queryClient = createQueryClient()

    const { result } = renderHook(() => service.useDelete(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync(42)
    })

    expect(deleteResource).toHaveBeenCalledOnce()
    expect(deleteResource).toHaveBeenCalledWith(42)
  })
})
