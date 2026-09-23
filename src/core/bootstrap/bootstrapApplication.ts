import { initializeConfig, env } from '@/core/config/config'
import { PinoLogger } from '@/core/logger/PinoLogger'
import { initializeLogger } from '@/core/logger/loggerRegistry'
import { initializeSettings, type AppSettingsOverrides } from '@/core/settings/settings'

export type BootstrapOptions = {
  settings?: AppSettingsOverrides
}

export function bootstrapApplication(options: BootstrapOptions = {}): void {
  initializeConfig()

  initializeLogger(
    new PinoLogger({
      level: env('LOG_LEVEL'),
    }),
  )

  initializeSettings(options.settings)
}
