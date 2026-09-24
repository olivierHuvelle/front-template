import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { nullableStringAdapter } from '@/components/form/adapters/nullableStringAdapter'
import type { FormFieldApi } from '@/components/form/FormFieldApi'
import { TextareaField } from '@/components/form/TextareaField'

function createField(
  overrides: Partial<FormFieldApi<string | null>> = {},
): FormFieldApi<string | null> {
  return {
    name: 'description',
    state: {
      value: null,
      meta: {
        errors: [],
        isBlurred: false,
        isDirty: false,
      },
    },
    handleBlur: vi.fn(),
    handleChange: vi.fn(),
    ...overrides,
  }
}

describe('TextareaField', () => {
  it('formats null as an empty string', () => {
    const field = createField()

    render(<TextareaField field={field} label="Description" adapter={nullableStringAdapter} />)

    expect(screen.getByLabelText('Description')).toHaveValue('')
  })

  it('renders a string value', () => {
    const field = createField({
      state: {
        value: 'Hello',
        meta: {
          errors: [],
          isBlurred: false,
          isDirty: false,
        },
      },
    })

    render(<TextareaField field={field} label="Description" adapter={nullableStringAdapter} />)

    expect(screen.getByLabelText('Description')).toHaveValue('Hello')
  })

  it('parses a non-empty string', () => {
    const field = createField()

    render(<TextareaField field={field} label="Description" adapter={nullableStringAdapter} />)

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Hello' },
    })

    expect(field.handleChange).toHaveBeenCalledWith('Hello')
  })

  it('parses an empty string as null', () => {
    const field = createField({
      state: {
        value: 'Hello',
        meta: {
          errors: [],
          isBlurred: false,
          isDirty: false,
        },
      },
    })

    render(<TextareaField field={field} label="Description" adapter={nullableStringAdapter} />)

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: '' },
    })

    expect(field.handleChange).toHaveBeenCalledWith(null)
  })

  it('calls handleBlur on blur', () => {
    const field = createField()

    render(<TextareaField field={field} label="Description" adapter={nullableStringAdapter} />)

    fireEvent.blur(screen.getByLabelText('Description'))

    expect(field.handleBlur).toHaveBeenCalledOnce()
  })

  it('hides errors for an untouched field', () => {
    const field = createField({
      state: {
        value: null,
        meta: {
          errors: ['Description is invalid'],
          isBlurred: false,
          isDirty: false,
        },
      },
    })

    render(<TextareaField field={field} label="Description" adapter={nullableStringAdapter} />)

    expect(screen.queryByText('Description is invalid')).not.toBeInTheDocument()
  })

  it('shows errors for a dirty field', () => {
    const field = createField({
      state: {
        value: null,
        meta: {
          errors: ['Description is invalid'],
          isBlurred: false,
          isDirty: true,
        },
      },
    })

    render(<TextareaField field={field} label="Description" adapter={nullableStringAdapter} />)

    expect(screen.getByText('Description is invalid')).toBeInTheDocument()
  })

  it('shows errors for a blurred field', () => {
    const field = createField({
      state: {
        value: null,
        meta: {
          errors: ['Description is invalid'],
          isBlurred: true,
          isDirty: false,
        },
      },
    })

    render(<TextareaField field={field} label="Description" adapter={nullableStringAdapter} />)

    expect(screen.getByText('Description is invalid')).toBeInTheDocument()
  })
})
