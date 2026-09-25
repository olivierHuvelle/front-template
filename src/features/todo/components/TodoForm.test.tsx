import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NetworkError } from '@/core/error/NetworkError'
import { TodoForm } from '@/features/todo/components/TodoForm'
import { todoService } from '@/features/todo/todo.service'
import { ApiError } from '@/core/error/ApiError'
import { initializeConfig } from '@/core/config/config'

vi.mock('@/features/todo/todo.service', () => ({
  todoService: {
    useCreate: vi.fn(),
  },
}))

const mockedUseCreate = vi.mocked(todoService.useCreate)
const mutateAsync = vi.fn()

function createMutationMock(
  mutateAsync: ReturnType<typeof vi.fn>,
): ReturnType<typeof todoService.useCreate> {
  return {
    mutateAsync,
  } as unknown as ReturnType<typeof todoService.useCreate>
}

describe('TodoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    initializeConfig({
      VITE_API_URL: 'http://localhost:3000',
      VITE_LOG_LEVEL: 'debug',
      VITE_API_BACKEND: 'laravel',
    })

    mockedUseCreate.mockReturnValue(createMutationMock(mutateAsync))
  })

  it('creates a todo and calls onSuccess', async () => {
    const onSuccess = vi.fn()

    mutateAsync.mockResolvedValue({
      id: 1,
      title: 'My todo',
      description: null,
      completed: false,
    })

    render(<TodoForm onSuccess={onSuccess} />)

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'My todo' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create todo' }))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        title: 'My todo',
        description: null,
      })
    })

    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('displays a backend validation error on the field', async () => {
    mutateAsync.mockRejectedValue(
      createApiError(422, {
        message: 'The given data was invalid.',
        errors: {
          title: ['The title has already been taken.'],
        },
      }),
    )

    render(<TodoForm />)

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'My todo' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create todo' }))

    expect(await screen.findByText('The title has already been taken.')).toBeInTheDocument()

    expect(screen.queryByText('The given data was invalid.')).not.toBeInTheDocument()
  })

  it('displays a global error when the network request fails', async () => {
    mutateAsync.mockRejectedValue(
      new NetworkError('Network request failed', {
        method: 'POST',
        url: '/todos',
      }),
    )

    render(<TodoForm />)

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'My todo' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create todo' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to connect to the server. Please try again.',
    )
  })

  it('clears a backend field error when the field changes', async () => {
    mutateAsync.mockRejectedValue(
      createApiError(422, {
        message: 'The given data was invalid.',
        errors: {
          title: ['The title has already been taken.'],
        },
      }),
    )

    render(<TodoForm />)

    const title = screen.getByLabelText('Title')

    fireEvent.change(title, {
      target: { value: 'My todo' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create todo' }))

    expect(await screen.findByText('The title has already been taken.')).toBeInTheDocument()

    fireEvent.change(title, {
      target: { value: 'Another todo' },
    })

    await waitFor(() => {
      expect(screen.queryByText('The title has already been taken.')).not.toBeInTheDocument()
    })
  })
})

function createApiError(status: number, data: unknown): ApiError {
  return new ApiError('API request failed', {
    status,
    statusText: 'Unprocessable Content',
    method: 'POST',
    url: '/todos',
    data,
  })
}
