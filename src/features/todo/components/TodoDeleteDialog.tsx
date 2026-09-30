import { ConfirmDialog } from '@/components/dialog/ConfirmDialog'
import { todoService } from '@/features/todo/todo.service'

type TodoDeleteDialogProps = {
  todoId: number
  open: boolean
  onClose: () => void
}

export function TodoDeleteDialog({ todoId, open, onClose }: TodoDeleteDialogProps) {
  const deleteTodo = todoService.useDelete()

  const handleConfirm = async () => {
    await deleteTodo.mutateAsync(todoId)
    onClose()
  }

  return (
    <ConfirmDialog
      open={open}
      title="Delete todo?"
      description="This action cannot be undone."
      confirmLabel="Delete"
      isPending={deleteTodo.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  )
}
