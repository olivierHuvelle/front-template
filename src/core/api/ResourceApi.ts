import type { ZodRawShape } from 'zod'

import { HttpClient, type HttpRequestOptions } from '@/core/api/HttpClient'
import type { ResourceId } from '@/core/api/ResourceId'
import type { Resource, ResourceOptions } from '@/core/resource/Resource'
import type { CreateData, UpdateData } from '@/core/resource/ResourceData'
import { RESOURCE_ROUTE } from '@/core/route/ResourceRouteName'
import { ResourceRoutes } from '@/core/route/ResourceRoute.ts'
import { Serializer } from '@/core/serializer/Serializer'

type ResourceData<TShape extends ZodRawShape> = ReturnType<Serializer<TShape>['deserialize']>

export class ResourceApi<
  TShape extends ZodRawShape,
  const TOptions extends ResourceOptions<TShape> = ResourceOptions<TShape>,
> {
  public readonly resource: Resource<TShape, TOptions>
  public readonly routes: ResourceRoutes<TShape, TOptions>
  public readonly serializer: Serializer<TShape>
  public readonly httpClient: HttpClient

  constructor(
    resource: Resource<TShape, TOptions>,
    options: {
      routes?: ResourceRoutes<TShape, TOptions>
      serializer?: Serializer<TShape>
      httpClient?: HttpClient
    } = {},
  ) {
    this.resource = resource
    this.routes = options.routes ?? new ResourceRoutes(resource)
    this.serializer = options.serializer ?? new Serializer(resource)
    this.httpClient = options.httpClient ?? new HttpClient()
  }

  public async getAll(options?: HttpRequestOptions): Promise<ResourceData<TShape>[]> {
    const route = this.routes.getRoute(RESOURCE_ROUTE.GET_ALL)
    const response = await this.httpClient.get(route.url, options)

    return this.serializer.deserializeMany(response)
  }

  public async get(id: ResourceId, options?: HttpRequestOptions): Promise<ResourceData<TShape>> {
    const route = this.routes.getRoute(RESOURCE_ROUTE.GET)
    const response = await this.httpClient.get(this.resolveUrl(route.url, id), options)

    return this.serializer.deserialize(response)
  }

  public async create(
    data: CreateData<Resource<TShape, TOptions>>,
    options?: HttpRequestOptions,
  ): Promise<ResourceData<TShape>> {
    const route = this.routes.getRoute(RESOURCE_ROUTE.CREATE)

    const payload = this.serializer.serialize(data, {
      only: this.resource.createFields,
    })

    const response = await this.httpClient.post(route.url, payload, options)

    return this.serializer.deserialize(response)
  }

  public async update(
    id: ResourceId,
    data: UpdateData<Resource<TShape, TOptions>>,
    options?: HttpRequestOptions,
  ): Promise<ResourceData<TShape>> {
    const route = this.routes.getRoute(RESOURCE_ROUTE.UPDATE)

    const payload = this.serializer.serialize(data, {
      only: this.resource.updateFields,
      partial: true,
    })

    const response = await this.httpClient.patch(this.resolveUrl(route.url, id), payload, options)

    return this.serializer.deserialize(response)
  }

  public async delete(id: ResourceId, options?: HttpRequestOptions): Promise<void> {
    const route = this.routes.getRoute(RESOURCE_ROUTE.DELETE)

    await this.httpClient.delete(this.resolveUrl(route.url, id), options)
  }

  private resolveUrl(url: string, id: ResourceId): string {
    return url.replace(':id', encodeURIComponent(String(id)))
  }
}
