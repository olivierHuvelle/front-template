import { describe, expect, it } from 'vitest'

import { FormErrorUtils } from '@/core/utils/FormErrorUtils'

describe('FormErrorUtils', () => {
  it('returns a string error', () => {
    expect(FormErrorUtils.getMessage('Required')).toBe('Required')
  })

  it('extracts a message from an object error', () => {
    expect(
      FormErrorUtils.getMessage({
        message: 'Title is required',
      }),
    ).toBe('Title is required')
  })

  it('returns undefined for an unsupported error', () => {
    expect(FormErrorUtils.getMessage({ code: 'invalid' })).toBeUndefined()
  })

  it('returns unique messages', () => {
    expect(
      FormErrorUtils.getMessages([
        { message: 'Title is required' },
        { message: 'Title is required' },
        'Another error',
      ]),
    ).toEqual(['Title is required', 'Another error'])
  })
})
