import { createFormHook } from '@tanstack/react-form'

import { fieldContext, formContext } from '@/components/form/form-context'
import { SubmitButton } from '@/components/form/SubmitButton'

export const { useAppForm } = createFormHook({
  fieldComponents: {},
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
})
