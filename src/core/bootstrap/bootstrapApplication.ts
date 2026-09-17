import { initializeConfig } from '@/core/config/config'
import { initializeSettings, type AppSettingsOverrides } from '@/core/settings/settings'

export type BootstrapOptions = {
  settings?: AppSettingsOverrides
}

export function bootstrapApplication(options: BootstrapOptions = {}): void {
  initializeConfig()
  initializeSettings(options.settings)
}
