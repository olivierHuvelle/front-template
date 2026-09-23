import { deepmerge } from 'deepmerge-ts'
import { z, ZodError } from 'zod'

import { SettingsError } from '@/core/error/SettingsError'

const dateFormatSchema = z.string().min(1) // TODO : refactor me later on

const settingsSchema = z
  .object({
    date: z
      .object({
        format: dateFormatSchema,
        dateTimeFormat: dateFormatSchema,
      })
      .strict(),
  })
  .strict()

export type AppSettings = z.infer<typeof settingsSchema>

const defaultSettings: AppSettings = {
  date: {
    format: 'dd/MM/yyyy',
    dateTimeFormat: 'dd/MM/yyyy HH:mm',
  },
}

const settingsOverridesSchema = z
  .object({
    date: settingsSchema.shape.date.partial().optional(),
  })
  .strict()

export type AppSettingsOverrides = z.infer<typeof settingsOverridesSchema>

let settings: AppSettings = defaultSettings

export function initializeSettings(overrides: AppSettingsOverrides = {}): void {
  try {
    const validatedOverrides = settingsOverridesSchema.parse(overrides)

    settings = settingsSchema.parse(deepmerge(defaultSettings, validatedOverrides))
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues
        .map((issue) => {
          const path = issue.path.join('.') || 'settings'

          return `- ${path}: ${issue.message}`
        })
        .join('\n')

      throw new SettingsError(`Application settings are invalid:\n${details}`, {
        cause: error,
      })
    }

    throw error
  }
}

export function getSettings(): Readonly<AppSettings> {
  return settings
}
