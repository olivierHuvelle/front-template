export const RESOURCE_ROUTE = {
  GET_ALL: 'getAll',
  GET: 'get',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const

export type ResourceRouteName = (typeof RESOURCE_ROUTE)[keyof typeof RESOURCE_ROUTE]
