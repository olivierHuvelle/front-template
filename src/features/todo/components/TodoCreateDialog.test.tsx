import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

import { TodoCreateDialog } from '@/features/todo/components/TodoCreateDialog'

vi.mock('@/features/todo/components/TodoForm', () => ({
  TodoForm: ({
    onSuccess,
    renderActions,
  }: {
    onSuccess?: () => void
    renderActions?: (submitButton: ReactNode) => ReactNode
  }) => {
    const submitButton = (
      <button type="button" onClick={onSuccess}>
        Submit successful
      </button>
    )

    return (
      <>
        Mock todo form
        {renderActions ? renderActions(submitButton) : submitButton}
      </>
    )
  },
}))

describe('TodoCreateDialog', () => {
  it('opens the dialog', () => {
    render(<TodoCreateDialog />)

    fireEvent.click(screen.getByRole('button', { name: 'New todo' }))

    expect(screen.getByRole('heading', { name: 'Create todo' })).toBeInTheDocument()

    expect(screen.getByText('Create a new todo item.')).toBeInTheDocument()
  })

  it('closes the dialog when creation succeeds', () => {
    render(<TodoCreateDialog />)

    fireEvent.click(screen.getByRole('button', { name: 'New todo' }))

    expect(screen.getByRole('heading', { name: 'Create todo' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Submit successful' }))

    expect(screen.queryByRole('heading', { name: 'Create todo' })).not.toBeInTheDocument()
  })

  it('closes the dialog when cancel is clicked', () => {
    render(<TodoCreateDialog />)

    fireEvent.click(screen.getByRole('button', { name: 'New todo' }))

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('heading', { name: 'Create todo' })).not.toBeInTheDocument()
  })
})
