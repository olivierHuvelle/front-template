export type AppErrorKind =
  'configuration' | 'settings' | 'api' | 'network' | 'response-parse' | 'serialization'

export abstract class AppError extends Error {
  public abstract readonly kind: AppErrorKind

  protected constructor(message: string, options?: ErrorOptions) {
    super(message, options)

    this.name = new.target.name
  }
}
