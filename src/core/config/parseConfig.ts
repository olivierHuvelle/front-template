import { ZodError } from 'zod'

import { configSchema, type Config } from '@/core/config/config.schema'

const VITE_PREFIX = 'VITE_'

export function parseConfig(rawEnv: Record<string, unknown>): Config {
  const applicationEnv = Object.fromEntries(
    Object.entries(rawEnv)
      .filter(([key]) => key.startsWith(VITE_PREFIX))
      .map(([key, value]) => [key.slice(VITE_PREFIX.length), value]),
  )

  try {
    return configSchema.parse(applicationEnv)
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues
        .map((issue) => {
          const path = issue.path.join('.') || 'config'
          return `- ${path}: ${issue.message}`
        })
        .join('\n')

      throw new Error(
        `Application configuration is invalid:\n${details}\n\nCheck your VITE_* environment variables.`,
        { cause: error },
      )
    }

    throw error
  }
}
