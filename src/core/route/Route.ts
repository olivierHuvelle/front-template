import type { ZodType } from 'zod'

import type { HttpMethod } from '@/core/route/HttpMethod'
import type { ResourceRouteName } from '@/core/route/ResourceRouteName.ts'

export type Route = {
  name: ResourceRouteName
  method: HttpMethod
  url: string
  responseSchema?: ZodType // TODO dont forget to make it mandatory later on
}
