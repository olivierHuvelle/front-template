import { afterEach, describe, expect, it, vi } from 'vitest'

import { bootstrapApplication } from '@/core/bootstrap/bootstrapApplication'
import { getLogger } from '@/core/logger/loggerRegistry'
import { PinoLogger } from '@/core/logger/PinoLogger'
import { getSettings } from '@/core/settings/settings'

describe('bootstrapApplication', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('initializes the application', () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:8000/api')
    vi.stubEnv('VITE_LOG_LEVEL', 'debug')

    bootstrapApplication()

    expect(getLogger()).toBeInstanceOf(PinoLogger)

    expect(getSettings().date).toEqual({
      format: 'dd/MM/yyyy',
      dateTimeFormat: 'dd/MM/yyyy HH:mm',
    })
  })

  it('initializes application settings with overrides', () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:8000/api')
    vi.stubEnv('VITE_LOG_LEVEL', 'debug')

    bootstrapApplication({
      settings: {
        date: {
          format: 'yyyy-MM-dd',
        },
      },
    })

    expect(getSettings().date).toEqual({
      format: 'yyyy-MM-dd',
      dateTimeFormat: 'dd/MM/yyyy HH:mm',
    })
  })
})
