import { TodoCreateDialog } from '@/features/todo/components/TodoCreateDialog.tsx'
import { TodoList } from '@/features/todo/components/TodoList'

export function App() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Todos</h1>
        <TodoCreateDialog />
      </div>
      <TodoList />
    </main>
  )
}
