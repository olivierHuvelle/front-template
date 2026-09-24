export class FormErrorUtils {
  public static getMessage(error: unknown): string | undefined {
    if (typeof error === 'string') {
      return error
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return error.message
    }

    return undefined
  }

  public static getMessages(errors: readonly unknown[]): string[] {
    const messages = errors
      .map((error) => this.getMessage(error))
      .filter((message): message is string => message !== undefined)

    return [...new Set(messages)]
  }
}
