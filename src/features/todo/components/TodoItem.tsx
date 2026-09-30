import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { TodoDeleteDialog } from '@/features/todo/components/TodoDeleteDialog'
import type { Todo } from '@/features/todo/todo.resource'

type TodoItemProps = {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <li className="rounded-lg border p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-medium">{todo.title}</div>

            {todo.description && (
              <div className="text-sm text-muted-foreground">{todo.description}</div>
            )}
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </div>
      </li>

      <TodoDeleteDialog
        todoId={todo.id}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  )
}
