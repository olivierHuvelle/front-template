import { z } from 'zod'

export const configSchema = z
  .object({
    API_URL: z.url(),
  })
  .strict()

export type Config = z.infer<typeof configSchema>
