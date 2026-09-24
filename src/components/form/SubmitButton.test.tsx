import { z } from 'zod'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useAppForm } from '@/components/form/useAppForm'

function TestForm({ onSubmit = vi.fn() }: { onSubmit?: () => void | Promise<void> }) {
  const form = useAppForm({
    defaultValues: {
      title: '',
    },
    onSubmit: async () => {
      await onSubmit()
    },
  })

  return (
    <form.AppForm>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.SubmitButton pendingLabel="Saving...">Save</form.SubmitButton>
      </form>
    </form.AppForm>
  )
}

function InvalidTestForm() {
  const schema = z.object({
    title: z.string().min(1),
  })

  const form = useAppForm({
    defaultValues: {
      title: '',
    },
    validators: {
      onMount: schema,
      onChange: schema,
    },
  })

  return (
    <form.AppForm>
      <form>
        <form.SubmitButton>Save</form.SubmitButton>
      </form>
    </form.AppForm>
  )
}

describe('SubmitButton', () => {
  it('renders its label', () => {
    render(<TestForm />)

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('uses the submit button type', () => {
    render(<TestForm />)

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit')
  })

  it('is disabled and displays the pending label while submitting', async () => {
    let resolveSubmit!: () => void

    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve
        }),
    )

    render(<TestForm onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('button', { name: 'Saving...' })).toBeDisabled()

    expect(onSubmit).toHaveBeenCalledOnce()

    await act(async () => {
      resolveSubmit()
    })

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('is disabled when the form cannot be submitted', () => {
    render(<InvalidTestForm />)

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })
})
