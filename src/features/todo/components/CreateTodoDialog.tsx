import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TodoForm } from '@/features/todo/components/TodoForm'

export function CreateTodoDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>New todo</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create todo</DialogTitle>
          <DialogDescription>Create a new todo item.</DialogDescription>
        </DialogHeader>

        <TodoForm onSuccess={() => setOpen(false)} />

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
