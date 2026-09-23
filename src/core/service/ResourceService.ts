import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ZodRawShape } from 'zod'

import type { ResourceId } from '@/core/api/ResourceId'
import type { ResourceQuery } from '@/core/query/ResourceQuery'
import type { ResourceOptions } from '@/core/resource/Resource'

export function createResourceService<
  TShape extends ZodRawShape,
  const TOptions extends ResourceOptions<TShape> = ResourceOptions<TShape>,
>(query: ResourceQuery<TShape, TOptions>) {
  function useGetAll() {
    return useQuery(query.getAll())
  }

  function useGet(id: ResourceId) {
    return useQuery(query.get(id))
  }

  function useCreate() {
    const queryClient = useQueryClient()

    return useMutation(query.create(queryClient))
  }

  function useUpdate() {
    const queryClient = useQueryClient()

    return useMutation(query.update(queryClient))
  }

  function useDelete() {
    const queryClient = useQueryClient()

    return useMutation(query.delete(queryClient))
  }

  return {
    useGetAll,
    useGet,
    useCreate,
    useUpdate,
    useDelete,
  }
}
