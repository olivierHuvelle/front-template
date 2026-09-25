import { useAppForm } from '@/components/form/useAppForm'
import { todoResource } from '@/features/todo/todo.resource'
import { todoService } from '@/features/todo/todo.service'

import { nullableStringAdapter } from '@/components/form/adapters/nullableStringAdapter'
import { TextareaField } from '@/components/form/TextareaField'
import { TextField } from '@/components/form/TextField'
import { applyFormSubmissionError } from '@/components/form/applyFormSubmissionError.ts'

type TodoFormProps = {
  onSuccess?: () => void
}

export function TodoForm({ onSuccess }: TodoFormProps) {
  const createTodo = todoService.useCreate()

  const form = useAppForm({
    defaultValues: {
      title: '',
      description: null as string | null,
    },
    validators: {
      onMount: todoResource.createSchema,
      onChange: todoResource.createSchema,
    },

    onSubmit: async ({ value }) => {
      try {
        await createTodo.mutateAsync(value)
        onSuccess?.()
      } catch (error) {
        applyFormSubmissionError(form, error)
      }
    },
  })

  return (
    <form.AppForm>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
        className="space-y-4"
      >
        <form.AppField
          name="title"
          children={(field) => <TextField field={field} label="Title" />}
        />

        <form.AppField
          name="description"
          children={(field) => (
            <TextareaField field={field} label="Description" adapter={nullableStringAdapter} />
          )}
        />
        <form.FormError />
        <form.SubmitButton pendingLabel="Creating...">Create todo</form.SubmitButton>
      </form>
    </form.AppForm>
  )
}
