import { describe, expect, it } from 'vitest'

import { StringUtils } from '@/core/utils/StringUtils'

describe('StringUtils', () => {
  describe('capitalize', () => {
    it('capitalizes the first character', () => {
      expect(StringUtils.capitalize('hello')).toBe('Hello')
    })

    it('keeps the rest of the string unchanged', () => {
      expect(StringUtils.capitalize('hELLO')).toBe('HELLO')
    })

    it('returns an empty string unchanged', () => {
      expect(StringUtils.capitalize('')).toBe('')
    })
  })

  describe('normalize', () => {
    it('trims and converts a string to lowercase', () => {
      expect(StringUtils.normalize('  HELLO World  ')).toBe('hello world')
    })

    it('capitalizes the normalized string when requested', () => {
      expect(
        StringUtils.normalize('  HELLO World  ', {
          capitalize: true,
        }),
      ).toBe('Hello world')
    })

    it('returns an empty string when the value only contains spaces', () => {
      expect(StringUtils.normalize('   ')).toBe('')
    })

    it('returns an empty string unchanged', () => {
      expect(StringUtils.normalize('')).toBe('')
    })
  })

  describe('toCamelCase', () => {
    it('converts snake case to camel case', () => {
      expect(StringUtils.toCamelCase('first_name')).toBe('firstName')
    })

    it('converts kebab case to camel case', () => {
      expect(StringUtils.toCamelCase('first-name')).toBe('firstName')
    })

    it('converts spaces to camel case', () => {
      expect(StringUtils.toCamelCase('first name')).toBe('firstName')
    })

    it('handles multiple separators', () => {
      expect(StringUtils.toCamelCase('first__name')).toBe('firstName')
      expect(StringUtils.toCamelCase('first--name')).toBe('firstName')
      expect(StringUtils.toCamelCase('first   name')).toBe('firstName')
    })

    it('trims surrounding spaces', () => {
      expect(StringUtils.toCamelCase('  first_name  ')).toBe('firstName')
    })

    it('returns an empty string unchanged', () => {
      expect(StringUtils.toCamelCase('')).toBe('')
    })
  })

  describe('toSnakeCase', () => {
    it('converts camel case to snake case', () => {
      expect(StringUtils.toSnakeCase('firstName')).toBe('first_name')
    })

    it('converts kebab case to snake case', () => {
      expect(StringUtils.toSnakeCase('first-name')).toBe('first_name')
    })

    it('converts spaces to snake case', () => {
      expect(StringUtils.toSnakeCase('first name')).toBe('first_name')
    })

    it('converts uppercase characters to lowercase', () => {
      expect(StringUtils.toSnakeCase('FirstName')).toBe('first_name')
    })

    it('trims surrounding spaces', () => {
      expect(StringUtils.toSnakeCase('  firstName  ')).toBe('first_name')
    })

    it('returns an empty string unchanged', () => {
      expect(StringUtils.toSnakeCase('')).toBe('')
    })
  })
})
