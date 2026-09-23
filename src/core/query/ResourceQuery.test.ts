import { QueryClient, type MutationFunctionContext } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import type { ResourceApi } from '@/core/api/ResourceApi'
import { ResourceQuery } from '@/core/query/ResourceQuery'
import { Resource } from '@/core/resource/Resource'

const testSchema = z.object({
  id: z.number(),
  title: z.string(),
})

const testResource = new Resource('test', testSchema, {
  readOnlyFields: ['id'],
})

type TestApi = ResourceApi<typeof testSchema.shape, typeof testResource.$options>

function createApiMock() {
  const getAll = vi.fn()
  const get = vi.fn()
  const create = vi.fn()
  const update = vi.fn()
  const deleteResource = vi.fn()

  const api = {
    resource: testResource,
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

function createMutationContext(queryClient: QueryClient): MutationFunctionContext {
  return {
    client: queryClient,
    meta: undefined,
    mutationKey: undefined,
  }
}

describe('ResourceQuery', () => {
  describe('query keys', () => {
    it('generates the root key from the resource name', () => {
      const { api } = createApiMock()
      const query = new ResourceQuery(api)

      expect(query.rootKey).toEqual(['test'])
    })

    it('generates the list key', () => {
      const { api } = createApiMock()
      const query = new ResourceQuery(api)

      expect(query.listKey).toEqual(['test', 'list'])
    })

    it('generates a detail key', () => {
      const { api } = createApiMock()
      const query = new ResourceQuery(api)

      expect(query.detailKey(42)).toEqual(['test', 'detail', 42])
    })
  })

  describe('invalidation', () => {
    it('invalidates the list and detail queries for a resource', async () => {
      const { api } = createApiMock()
      const query = new ResourceQuery(api)

      const queryClient = new QueryClient()
      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

      await query.invalidateResource(queryClient, 42)

      expect(invalidateQueries).toHaveBeenCalledTimes(2)

      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['test', 'list'],
      })

      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['test', 'detail', 42],
      })
    })
  })

  describe('queries', () => {
    it('creates the getAll query options', async () => {
      const { api, getAll } = createApiMock()
      const query = new ResourceQuery(api)

      getAll.mockResolvedValue([])

      const options = query.getAll()
      const signal = new AbortController().signal

      expect(options.queryKey).toEqual(['test', 'list'])

      await options.queryFn?.({
        queryKey: options.queryKey,
        signal,
        meta: undefined,
        client: undefined as never,
      })

      expect(getAll).toHaveBeenCalledOnce()
      expect(getAll).toHaveBeenCalledWith({ signal })
    })

    it('creates the get query options', async () => {
      const { api, get } = createApiMock()
      const query = new ResourceQuery(api)

      get.mockResolvedValue({
        id: 42,
        title: 'Test',
      })

      const options = query.get(42)
      const signal = new AbortController().signal

      expect(options.queryKey).toEqual(['test', 'detail', 42])

      await options.queryFn?.({
        queryKey: options.queryKey,
        signal,
        meta: undefined,
        client: undefined as never,
      })

      expect(get).toHaveBeenCalledOnce()
      expect(get).toHaveBeenCalledWith(42, { signal })
    })
  })

  describe('mutations', () => {
    it('creates a resource and invalidates the list query', async () => {
      const { api, create } = createApiMock()
      const query = new ResourceQuery(api)

      const queryClient = new QueryClient()
      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

      const data = {
        title: 'Created Todo',
      }

      const createdResource = {
        id: 42,
        title: 'Created Todo',
      }

      create.mockResolvedValue(createdResource)

      const options = query.create(queryClient)

      const result = await options.mutationFn?.(data, createMutationContext(queryClient))

      expect(create).toHaveBeenCalledOnce()
      expect(create).toHaveBeenCalledWith(data)
      expect(result).toEqual(createdResource)

      await options.onSuccess?.(
        createdResource,
        data,
        undefined,
        createMutationContext(queryClient),
      )

      expect(invalidateQueries).toHaveBeenCalledOnce()
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['test', 'list'],
      })
    })

    it('does not invalidate the list while executing the create mutation', async () => {
      const { api, create } = createApiMock()
      const query = new ResourceQuery(api)

      const queryClient = new QueryClient()
      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

      const data = {
        title: 'Created Todo',
      }

      create.mockResolvedValue({
        id: 42,
        title: 'Created Todo',
      })

      const options = query.create(queryClient)

      await options.mutationFn?.(data, createMutationContext(queryClient))

      expect(invalidateQueries).not.toHaveBeenCalled()
    })

    it('updates a resource and invalidates its list and detail queries', async () => {
      const { api, update } = createApiMock()
      const query = new ResourceQuery(api)

      const queryClient = new QueryClient()
      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

      const variables = {
        id: 42,
        data: {
          title: 'Updated Todo',
        },
      }

      const updatedResource = {
        id: 42,
        title: 'Updated Todo',
      }

      update.mockResolvedValue(updatedResource)

      const options = query.update(queryClient)

      const result = await options.mutationFn?.(variables, createMutationContext(queryClient))

      expect(update).toHaveBeenCalledOnce()
      expect(update).toHaveBeenCalledWith(42, {
        title: 'Updated Todo',
      })

      expect(result).toEqual(updatedResource)

      await options.onSuccess?.(
        updatedResource,
        variables,
        undefined,
        createMutationContext(queryClient),
      )

      expect(invalidateQueries).toHaveBeenCalledTimes(2)

      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['test', 'list'],
      })

      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['test', 'detail', 42],
      })
    })

    it('does not invalidate queries while executing the update mutation', async () => {
      const { api, update } = createApiMock()
      const query = new ResourceQuery(api)

      const queryClient = new QueryClient()
      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

      const variables = {
        id: 42,
        data: {
          title: 'Updated Todo',
        },
      }

      update.mockResolvedValue({
        id: 42,
        title: 'Updated Todo',
      })

      const options = query.update(queryClient)

      await options.mutationFn?.(variables, createMutationContext(queryClient))

      expect(invalidateQueries).not.toHaveBeenCalled()
    })

    it('deletes a resource, invalidates the list and removes its detail query', async () => {
      const { api, deleteResource } = createApiMock()
      const query = new ResourceQuery(api)

      const queryClient = new QueryClient()
      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
      const removeQueries = vi.spyOn(queryClient, 'removeQueries')

      deleteResource.mockResolvedValue(undefined)

      const options = query.delete(queryClient)
      const id = 42

      const result = await options.mutationFn?.(id, createMutationContext(queryClient))

      expect(deleteResource).toHaveBeenCalledOnce()
      expect(deleteResource).toHaveBeenCalledWith(id)
      expect(result).toBeUndefined()

      await options.onSuccess?.(undefined, id, undefined, createMutationContext(queryClient))

      expect(invalidateQueries).toHaveBeenCalledOnce()
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['test', 'list'],
      })

      expect(removeQueries).toHaveBeenCalledOnce()
      expect(removeQueries).toHaveBeenCalledWith({
        queryKey: ['test', 'detail', id],
      })
    })

    it('does not update the cache while executing the delete mutation', async () => {
      const { api, deleteResource } = createApiMock()
      const query = new ResourceQuery(api)

      const queryClient = new QueryClient()
      const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
      const removeQueries = vi.spyOn(queryClient, 'removeQueries')

      deleteResource.mockResolvedValue(undefined)

      const options = query.delete(queryClient)

      await options.mutationFn?.(42, createMutationContext(queryClient))

      expect(invalidateQueries).not.toHaveBeenCalled()
      expect(removeQueries).not.toHaveBeenCalled()
    })
  })
})
