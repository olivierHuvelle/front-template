import type { ZodRawShape } from 'zod'

import type { Resource, ResourceOptions } from '@/core/resource/Resource'
import { HTTP_METHOD } from '@/core/route/HttpMethod'
import { RESOURCE_ROUTE, type ResourceRouteName } from '@/core/route/ResourceRouteName'
import type { Route } from '@/core/route/Route'

export class ResourceRoutes<
  TShape extends ZodRawShape,
  const TOptions extends ResourceOptions<TShape> = ResourceOptions<TShape>,
> {
  public readonly resource: Resource<TShape, TOptions>
  public readonly baseUrl: string

  private readonly routes: Route[]

  constructor(resource: Resource<TShape, TOptions>, baseUrl?: string) {
    this.resource = resource
    this.baseUrl = baseUrl ?? `/${resource.name}s`
    this.routes = this.generateRoutes()
  }

  public getRoutes(): Route[] {
    return this.routes
  }

  public getRoute(name: ResourceRouteName): Route {
    const route = this.routes.find((route) => route.name === name)

    if (!route) {
      throw new Error(`Route "${name}" not found for resource "${this.resource.name}"`)
    }

    return route
  }

  private generateRoutes(): Route[] {
    return [
      {
        name: RESOURCE_ROUTE.GET_ALL,
        method: HTTP_METHOD.GET,
        url: this.baseUrl,
      },
      {
        name: RESOURCE_ROUTE.GET,
        method: HTTP_METHOD.GET,
        url: `${this.baseUrl}/:id`,
        responseSchema: this.resource.schema,
      },
      {
        name: RESOURCE_ROUTE.CREATE,
        method: HTTP_METHOD.POST,
        url: this.baseUrl,
        responseSchema: this.resource.schema,
      },
      {
        name: RESOURCE_ROUTE.UPDATE,
        method: HTTP_METHOD.PATCH,
        url: `${this.baseUrl}/:id`,
        responseSchema: this.resource.schema,
      },
      {
        name: RESOURCE_ROUTE.DELETE,
        method: HTTP_METHOD.DELETE,
        url: `${this.baseUrl}/:id`,
      },
    ]
  }
}
