import { createFormHook } from '@tanstack/react-form'

import { fieldContext, formContext } from '@/components/form/form-context'
import { FormError } from '@/components/form/FormError.tsx'
import { SubmitButton } from '@/components/form/SubmitButton'

export const { useAppForm } = createFormHook({
  fieldComponents: {},
  formComponents: {
    FormError,
    SubmitButton,
  },
  fieldContext,
  formContext,
})
