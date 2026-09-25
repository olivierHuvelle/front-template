import { FormErrorMapper } from '@/components/form/FormErrorMapper'

type FormErrorApi = {
  setErrorMap: (errorMap: {
    onSubmit: {
      form?: string
      fields: Record<string, string[]>
    }
  }) => void
}

export function applyFormSubmissionError(form: FormErrorApi, error: unknown): void {
  const submissionError = FormErrorMapper.map(error)

  const hasFieldErrors = Object.keys(submissionError.fields).length > 0

  form.setErrorMap({
    onSubmit: {
      form: hasFieldErrors ? undefined : submissionError.message,
      fields: submissionError.fields,
    },
  })
}
