export const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'] as const

export type LogLevel = (typeof LOG_LEVELS)[number]
