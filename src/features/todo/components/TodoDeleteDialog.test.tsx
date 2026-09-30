import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TodoDeleteDialog } from '@/features/todo/components/TodoDeleteDialog'
import { todoService } from '@/features/todo/todo.service'

vi.mock('@/features/todo/todo.service', () => ({
  todoService: {
    useDelete: vi.fn(),
  },
}))

const mockedUseDelete = vi.mocked(todoService.useDelete)
const mutateAsync = vi.fn()

function createMutationMock(
  mutateAsyncMock: ReturnType<typeof vi.fn>,
  isPending = false,
): ReturnType<typeof todoService.useDelete> {
  return {
    mutateAsync: mutateAsyncMock,
    isPending,
  } as unknown as ReturnType<typeof todoService.useDelete>
}

describe('TodoDeleteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockedUseDelete.mockReturnValue(createMutationMock(mutateAsync))
  })

  it('deletes the todo using its id', async () => {
    mutateAsync.mockResolvedValue(undefined)

    render(<TodoDeleteDialog todoId={42} open onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(42)
    })
  })

  it('closes the dialog after a successful deletion', async () => {
    const onClose = vi.fn()

    mutateAsync.mockResolvedValue(undefined)

    render(<TodoDeleteDialog todoId={42} open onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  it('does not close before the deletion completes', async () => {
    const onClose = vi.fn()

    let resolveDelete!: () => void

    mutateAsync.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve
        }),
    )

    render(<TodoDeleteDialog todoId={42} open onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(42)
    })

    expect(onClose).not.toHaveBeenCalled()

    resolveDelete()

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce()
    })
  })
})
