import type { Config } from '@/core/config/config.schema'
import { parseConfig } from '@/core/config/parseConfig'

let config: Config | undefined

export function initializeConfig(rawEnv: Record<string, unknown> = import.meta.env): void {
  // IMP : dedicated class + default values + if required extensive validation
  config = parseConfig(rawEnv)
}

export function env<TKey extends keyof Config>(key: TKey): Config[TKey] {
  // IDEA : custom errors +- dedicated file
  if (!config) {
    throw new Error('Config has not been initialized')
  }

  if (!(key in config)) {
    throw new Error(`Unknown config key: "${String(key)}"`)
  }

  return config[key]
}
