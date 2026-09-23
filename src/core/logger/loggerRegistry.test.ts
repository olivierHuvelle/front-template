import { describe, expect, it, vi } from 'vitest'

import type { Logger } from '@/core/logger/Logger'

function createLoggerMock(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}

describe('loggerRegistry', () => {
  it('returns the initialized logger', async () => {
    vi.resetModules()

    const { getLogger, initializeLogger } = await import('@/core/logger/loggerRegistry')

    const logger = createLoggerMock()

    initializeLogger(logger)

    expect(getLogger()).toBe(logger)
  })

  it('throws when the logger has not been initialized', async () => {
    vi.resetModules()

    const { getLogger } = await import('@/core/logger/loggerRegistry')

    expect(() => getLogger()).toThrow('Logger has not been initialized')
  })
})
