import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmDialog } from '@/components/dialog/ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders the dialog content when open', () => {
    render(
      <ConfirmDialog
        open
        title="Delete todo?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Delete todo?' })).toBeInTheDocument()

    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn()

    render(<ConfirmDialog open title="Delete todo?" onConfirm={vi.fn()} onCancel={onCancel} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onConfirm when confirm is clicked', () => {
    const onConfirm = vi.fn()

    render(
      <ConfirmDialog
        open
        title="Delete todo?"
        confirmLabel="Delete"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('disables actions and displays the pending label while pending', () => {
    render(
      <ConfirmDialog
        open
        title="Delete todo?"
        confirmLabel="Delete"
        isPending
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()

    expect(screen.getByRole('button', { name: 'Please wait...' })).toBeDisabled()

    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })
})
