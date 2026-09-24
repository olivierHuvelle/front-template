import { todoService } from '@/features/todo/todo.service'

export function TodoList() {
  const { data: todos, isPending, isError, error } = todoService.useGetAll()

  if (isPending) {
    return <p>Loading todos...</p>
  }

  if (isError) {
    return (
      <div>
        <p>Unable to load todos.</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  if (todos.length === 0) {
    return <p>No todos yet.</p>
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <li key={todo.id} className="rounded-lg border p-4">
          <div className="font-medium">{todo.title}</div>

          {todo.description && (
            <div className="text-sm text-muted-foreground">{todo.description}</div>
          )}
        </li>
      ))}
    </ul>
  )
}
