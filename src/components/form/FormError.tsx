import { useFormContext } from '@/components/form/form-context'

export function FormError() {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => state.errorMap.onSubmit}
      children={(error) => {
        if (typeof error !== 'string') {
          return null
        }

        return (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )
      }}
    />
  )
}
