import { todoService } from '@/features/todo/todo.service'

function App() {
  const todos = todoService.useGetAll()
  const todo = todoService.useGet(1)

  const createTodo = todoService.useCreate()
  const updateTodo = todoService.useUpdate()
  const deleteTodo = todoService.useDelete()

  if (todos.isPending || todo.isPending) {
    return <div>Loading...</div>
  }

  if (todos.isError) {
    return <div>Failed to load todos: {todos.error.message}</div>
  }

  if (todo.isError) {
    return <div>Failed to load todo #1: {todo.error.message}</div>
  }

  return (
    <main>
      <h1>ResourceService integration</h1>

      <section>
        <h2>GET #1</h2>

        <pre>{JSON.stringify(todo.data, null, 2)}</pre>
      </section>

      <section>
        <h2>CREATE</h2>

        <button
          type="button"
          disabled={createTodo.isPending}
          onClick={() =>
            createTodo.mutate({
              title: 'Created from ResourceService',
              description: 'ResourceService integration test',
            })
          }
        >
          {createTodo.isPending ? 'Creating...' : 'Create Todo'}
        </button>

        {createTodo.isError && <p>Failed to create todo: {createTodo.error.message}</p>}

        {createTodo.isSuccess && <pre>{JSON.stringify(createTodo.data, null, 2)}</pre>}
      </section>

      <section>
        <h2>GET ALL / UPDATE / DELETE</h2>

        {todos.data.map((item) => (
          <div key={item.id}>
            <span>
              #{item.id} — {item.title} — {item.completed ? 'Completed' : 'Pending'}
            </span>

            <button
              type="button"
              disabled={updateTodo.isPending}
              onClick={() =>
                updateTodo.mutate({
                  id: item.id,
                  data: {
                    completed: !item.completed,
                  },
                })
              }
            >
              Toggle
            </button>

            <button
              type="button"
              disabled={deleteTodo.isPending}
              onClick={() => deleteTodo.mutate(item.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </section>
    </main>
  )
}

export default App
