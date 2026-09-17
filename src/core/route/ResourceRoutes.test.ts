import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { Resource } from '@/core/resource/Resource'
import { HTTP_METHOD } from '@/core/route/HttpMethod'
import { RESOURCE_ROUTE } from '@/core/route/ResourceRouteName'
import { ResourceRoutes } from '@/core/route/ResourceRoute.ts'

describe('ResourceRoutes', () => {
  const schema = z.object({
    id: z.number(),
    title: z.string(),
  })

  const resource = new Resource('todo', schema)
  const routes = new ResourceRoutes(resource)

  it('generates the five CRUD routes', () => {
    expect(routes.getRoutes()).toHaveLength(5)
  })

  it('generates the getAll route', () => {
    expect(routes.getRoute(RESOURCE_ROUTE.GET_ALL)).toMatchObject({
      name: RESOURCE_ROUTE.GET_ALL,
      method: HTTP_METHOD.GET,
      url: '/todos',
    })
  })

  it('generates the get route', () => {
    expect(routes.getRoute(RESOURCE_ROUTE.GET)).toMatchObject({
      name: RESOURCE_ROUTE.GET,
      method: HTTP_METHOD.GET,
      url: '/todos/:id',
    })
  })

  it('generates the create route', () => {
    expect(routes.getRoute(RESOURCE_ROUTE.CREATE)).toMatchObject({
      name: RESOURCE_ROUTE.CREATE,
      method: HTTP_METHOD.POST,
      url: '/todos',
    })
  })

  it('generates the update route', () => {
    expect(routes.getRoute(RESOURCE_ROUTE.UPDATE)).toMatchObject({
      name: RESOURCE_ROUTE.UPDATE,
      method: HTTP_METHOD.PATCH,
      url: '/todos/:id',
    })
  })

  it('generates the delete route', () => {
    expect(routes.getRoute(RESOURCE_ROUTE.DELETE)).toMatchObject({
      name: RESOURCE_ROUTE.DELETE,
      method: HTTP_METHOD.DELETE,
      url: '/todos/:id',
    })
  })

  it('uses a custom base URL', () => {
    const customRoutes = new ResourceRoutes(resource, '/api/tasks')

    expect(customRoutes.getRoute(RESOURCE_ROUTE.GET_ALL).url).toBe('/api/tasks')
    expect(customRoutes.getRoute(RESOURCE_ROUTE.GET).url).toBe('/api/tasks/:id')
  })

  it('keeps the resource schema on response routes', () => {
    expect(routes.getRoute(RESOURCE_ROUTE.GET).responseSchema).toBe(schema)
    expect(routes.getRoute(RESOURCE_ROUTE.CREATE).responseSchema).toBe(schema)
    expect(routes.getRoute(RESOURCE_ROUTE.UPDATE).responseSchema).toBe(schema)
  })

  it('throws when the route does not exist', () => {
    // @ts-expect-error invalid known by ts
    expect(() => routes.getRoute('unknown')).toThrow()
  })
})
