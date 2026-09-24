import type { ComponentProps } from 'react'

import { useFormContext } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'

type SubmitButtonProps = Omit<ComponentProps<typeof Button>, 'type' | 'disabled'> & {
  pendingLabel?: string
}

export function SubmitButton({
  children,
  pendingLabel = 'Submitting...',
  ...props
}: SubmitButtonProps) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting] as const}
      children={([canSubmit, isSubmitting]) => (
        <Button {...props} type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? pendingLabel : children}
        </Button>
      )}
    />
  )
}
