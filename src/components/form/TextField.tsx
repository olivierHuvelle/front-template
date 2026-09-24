import type { FieldAdapter } from '@/components/form/adapters/FieldAdapter'
import { FieldError } from '@/components/form/FieldError'
import type { FormFieldApi } from '@/components/form/FormFieldApi'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type TextFieldProps<TValue> = {
  field: FormFieldApi<TValue>
  label: string
} & ([TValue] extends [string]
  ? {
      adapter?: FieldAdapter<NoInfer<TValue>, string>
    }
  : {
      adapter: FieldAdapter<NoInfer<TValue>, string>
    })

export function TextField<TValue>({ field, label, adapter }: TextFieldProps<TValue>) {
  const value = adapter ? adapter.format(field.state.value) : (field.state.value as string)

  const handleChange = (inputValue: string) => {
    if (adapter) {
      field.handleChange(adapter.parse(inputValue))
      return
    }

    field.handleChange(inputValue as NoInfer<TValue>)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{label}</Label>

      <Input
        id={field.name}
        name={field.name}
        value={value}
        onBlur={field.handleBlur}
        onChange={(event) => handleChange(event.target.value)}
      />

      {(field.state.meta.isBlurred || field.state.meta.isDirty) && (
        <FieldError errors={field.state.meta.errors} />
      )}
    </div>
  )
}
