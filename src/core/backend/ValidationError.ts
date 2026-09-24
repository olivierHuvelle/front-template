export type ValidationError = {
  message?: string
  fields: Record<string, string[]>
}
