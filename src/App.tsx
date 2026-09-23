import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ResourceApi } from '@/core/api/ResourceApi'
import { ResourceQuery } from '@/core/query/ResourceQuery'
import { todoResource } from '@/features/todo/todo.resource'

const todoApi = new ResourceApi(todoResource)
const todoQuery = new ResourceQuery(todoApi)

function App() {
  const queryClient = useQueryClient()

  const todos = useQuery(todoQuery.getAll())

  const createTodo = useMutation(todoQuery.create(queryClient))
  const deleteTodo = useMutation(todoQuery.delete(queryClient))
  const updateTodo = useMutation(todoQuery.update(queryClient))

  if (todos.isPending) {
    return <div>Loading...</div>
  }

  if (todos.isError) {
    return <div>{todos.error.message}</div>
  }

  return (
    <div>
      <button
        onClick={() =>
          createTodo.mutate({
            title: 'Created with TanStack Query',
            description: 'ResourceQuery create test',
          })
        }
        disabled={createTodo.isPending}
      >
        {createTodo.isPending ? 'Creating...' : 'Create Todo'}
      </button>

      {createTodo.isError && <p>Create failed: {createTodo.error.message}</p>}

      <hr />

      {todos.data.map((todo) => (
        <div key={todo.id}>
          #{todo.id} — {todo.title}
          <button onClick={() => deleteTodo.mutate(todo.id)} disabled={deleteTodo.isPending}>
            Delete
          </button>
          <button
            onClick={() =>
              updateTodo.mutate({
                id: todo.id,
                data: {
                  title: `Updated ${todo.id}`,
                },
              })
            }
            disabled={updateTodo.isPending}
          >
            Update
          </button>
        </div>
      ))}
    </div>
  )
}

export default App
