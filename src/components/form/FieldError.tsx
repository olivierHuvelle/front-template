import { FormErrorUtils } from '@/core/utils/FormErrorUtils'

type FieldErrorProps = {
  errors: readonly unknown[]
}

export function FieldError({ errors }: FieldErrorProps) {
  const messages = FormErrorUtils.getMessages(errors)

  if (messages.length === 0) {
    return null
  }

  return (
    <div className="space-y-1">
      {messages.map((message) => (
        <p key={message} className="text-sm text-destructive">
          {message}
        </p>
      ))}
    </div>
  )
}
