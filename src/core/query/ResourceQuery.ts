import { queryOptions, mutationOptions, type QueryClient } from '@tanstack/react-query'
import type { ZodRawShape } from 'zod'

import type { Resource, ResourceOptions } from '@/core/resource/Resource'
import type { CreateData, UpdateData } from '@/core/resource/ResourceData'
import type { ResourceApi } from '@/core/api/ResourceApi'
import type { ResourceId } from '@/core/api/ResourceId'

export class ResourceQuery<
  TShape extends ZodRawShape,
  const TOptions extends ResourceOptions<TShape> = ResourceOptions<TShape>,
> {
  public readonly api: ResourceApi<TShape, TOptions>

  constructor(api: ResourceApi<TShape, TOptions>) {
    this.api = api
  }

  public get rootKey() {
    return [this.api.resource.name] as const
  }

  public get listKey() {
    return [...this.rootKey, 'list'] as const
  }

  public detailKey(id: ResourceId) {
    return [...this.rootKey, 'detail', id] as const
  }

  public getAll() {
    return queryOptions({
      queryKey: this.listKey,
      queryFn: ({ signal }) => this.api.getAll({ signal }),
    })
  }

  public get(id: ResourceId) {
    return queryOptions({
      queryKey: this.detailKey(id),
      queryFn: ({ signal }) => this.api.get(id, { signal }),
    })
  }

  public create(queryClient: QueryClient) {
    return mutationOptions({
      mutationFn: (data: CreateData<Resource<TShape, TOptions>>) => this.api.create(data),

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: this.listKey,
        })
      },
    })
  }

  public update(queryClient: QueryClient) {
    return mutationOptions({
      mutationFn: ({
        id,
        data,
      }: {
        id: ResourceId
        data: UpdateData<Resource<TShape, TOptions>>
      }) => this.api.update(id, data),

      onSuccess: async (_, { id }) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: this.listKey,
          }),
          queryClient.invalidateQueries({
            queryKey: this.detailKey(id),
          }),
        ])
      },
    })
  }

  public delete(queryClient: QueryClient) {
    return mutationOptions({
      mutationFn: (id: ResourceId) => this.api.delete(id),

      onSuccess: async (_, id) => {
        await queryClient.invalidateQueries({
          queryKey: this.listKey,
        })

        queryClient.removeQueries({
          queryKey: this.detailKey(id),
        })
      },
    })
  }
}
