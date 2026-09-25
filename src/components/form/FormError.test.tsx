import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useAppForm } from '@/components/form/useAppForm'

function TestForm() {
  const form = useAppForm({
    defaultValues: {
      title: '',
    },
  })

  return (
    <form.AppForm>
      <button
        type="button"
        onClick={() => {
          form.setErrorMap({
            onSubmit: {
              form: 'Something went wrong.',
              fields: {},
            },
          })
        }}
      >
        Set error
      </button>

      <form.FormError />
    </form.AppForm>
  )
}

describe('FormError', () => {
  it('does not render an alert when there is no submit error', () => {
    render(<TestForm />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders the global submit error', async () => {
    render(<TestForm />)

    await act(async () => {
      screen.getByRole('button', { name: 'Set error' }).click()
    })

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
  })
})
