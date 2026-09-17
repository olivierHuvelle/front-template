import { z } from 'zod'
import { deepmerge } from 'deepmerge-ts'

const settingsSchema = z
  .object({
    date: z
      .object({
        format: z.string().min(1),
        dateTimeFormat: z.string().min(1), // TODO : refactore later on to have a proper validation
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
  const validatedOverrides = settingsOverridesSchema.parse(overrides)

  settings = settingsSchema.parse(deepmerge(defaultSettings, validatedOverrides))
}

export function getSettings(): Readonly<AppSettings> {
  return settings
}
