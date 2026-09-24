import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { FormFieldApi } from '@/components/form/FormFieldApi'
import { TextField } from '@/components/form/TextField'

function createField(overrides: Partial<FormFieldApi<string>> = {}): FormFieldApi<string> {
  return {
    name: 'title',
    state: {
      value: '',
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

describe('TextField', () => {
  it('renders the field value', () => {
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

    render(<TextField field={field} label="Title" />)

    expect(screen.getByLabelText('Title')).toHaveValue('Hello')
  })

  it('updates the field on change', () => {
    const field = createField()

    render(<TextField field={field} label="Title" />)

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Hello' },
    })

    expect(field.handleChange).toHaveBeenCalledWith('Hello')
  })

  it('calls handleBlur on blur', () => {
    const field = createField()

    render(<TextField field={field} label="Title" />)

    fireEvent.blur(screen.getByLabelText('Title'))

    expect(field.handleBlur).toHaveBeenCalledOnce()
  })

  it('hides errors for an untouched field', () => {
    const field = createField({
      state: {
        value: '',
        meta: {
          errors: ['Title is required'],
          isBlurred: false,
          isDirty: false,
        },
      },
    })

    render(<TextField field={field} label="Title" />)

    expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
  })

  it('shows errors for a dirty field', () => {
    const field = createField({
      state: {
        value: '',
        meta: {
          errors: ['Title is required'],
          isBlurred: false,
          isDirty: true,
        },
      },
    })

    render(<TextField field={field} label="Title" />)

    expect(screen.getByText('Title is required')).toBeInTheDocument()
  })

  it('shows errors for a blurred field', () => {
    const field = createField({
      state: {
        value: '',
        meta: {
          errors: ['Title is required'],
          isBlurred: true,
          isDirty: false,
        },
      },
    })

    render(<TextField field={field} label="Title" />)

    expect(screen.getByText('Title is required')).toBeInTheDocument()
  })
})
