import { z } from 'zod'
import { LOG_LEVELS } from '@/core/logger/LogLevel'

export const configSchema = z
  .object({
    API_URL: z.url(),
    LOG_LEVEL: z.enum(LOG_LEVELS),
  })
  .strict()

export type Config = z.infer<typeof configSchema>
