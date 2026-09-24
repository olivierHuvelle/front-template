import { z } from 'zod'
import { LOG_LEVELS } from '@/core/logger/LogLevel'

export const API_BACKENDS = ['generic', 'laravel'] as const
export type ApiBackend = (typeof API_BACKENDS)[number]

export const configSchema = z
  .object({
    API_URL: z.url(),
    API_BACKEND: z.enum(API_BACKENDS).default('generic'),
    LOG_LEVEL: z.enum(LOG_LEVELS),
  })
  .strict()

export type Config = z.infer<typeof configSchema>
