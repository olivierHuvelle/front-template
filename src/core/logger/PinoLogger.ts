import pino, { type Logger as PinoInstance } from 'pino'
import type { LogLevel } from '@/core/logger/LogLevel'
import type { LogContext, Logger } from '@/core/logger/Logger'

export type PinoLoggerOptions = {
  level?: LogLevel
}

export class PinoLogger implements Logger {
  private readonly logger: PinoInstance

  constructor(options: PinoLoggerOptions = {}) {
    this.logger = pino({
      level: options.level ?? 'info',
      browser: {
        asObject: true,
      },
    })
  }

  public debug(message: string, context?: LogContext): void {
    this.logger.debug(context ?? {}, message)
  }

  public info(message: string, context?: LogContext): void {
    this.logger.info(context ?? {}, message)
  }

  public warn(message: string, context?: LogContext): void {
    this.logger.warn(context ?? {}, message)
  }

  public error(message: string, context?: LogContext): void {
    this.logger.error(context ?? {}, message)
  }
}
