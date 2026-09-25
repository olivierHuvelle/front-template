import { beforeEach, describe, expect, it, vi } from 'vitest'

import { applyFormSubmissionError } from '@/components/form/applyFormSubmissionError'
import { FormErrorMapper } from '@/components/form/FormErrorMapper'

vi.mock('@/components/form/FormErrorMapper', () => ({
  FormErrorMapper: {
    map: vi.fn(),
  },
}))

const mockedMap = vi.mocked(FormErrorMapper.map)

describe('applyFormSubmissionError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('applies field errors without a global form error', () => {
    mockedMap.mockReturnValue({
      message: 'The given data was invalid.',
      fields: {
        title: ['The title field is required.'],
      },
    })

    const setErrorMap = vi.fn()

    applyFormSubmissionError({ setErrorMap }, new Error())

    expect(setErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: undefined,
        fields: {
          title: ['The title field is required.'],
        },
      },
    })
  })

  it('applies a global form error when there are no field errors', () => {
    mockedMap.mockReturnValue({
      message: 'The server encountered an error. Please try again.',
      fields: {},
    })

    const setErrorMap = vi.fn()

    applyFormSubmissionError({ setErrorMap }, new Error())

    expect(setErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: 'The server encountered an error. Please try again.',
        fields: {},
      },
    })
  })

  it('passes the original error to FormErrorMapper', () => {
    const error = new Error('Something happened')

    mockedMap.mockReturnValue({
      message: 'An unexpected error occurred. Please try again.',
      fields: {},
    })

    const setErrorMap = vi.fn()

    applyFormSubmissionError({ setErrorMap }, error)

    expect(mockedMap).toHaveBeenCalledWith(error)
  })
})
