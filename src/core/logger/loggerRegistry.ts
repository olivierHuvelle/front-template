import type { Logger } from '@/core/logger/Logger'

let logger: Logger | undefined

export function initializeLogger(instance: Logger): void {
  logger = instance
}

export function getLogger(): Logger {
  if (!logger) {
    throw new Error('Logger has not been initialized')
  }

  return logger
}
