import type { ZodObject, ZodRawShape } from 'zod'

export class Resource<TShape extends ZodRawShape> {
  public readonly name: string
  public readonly schema: ZodObject<TShape>

  constructor(name: string, schema: ZodObject<TShape>) {
    this.name = name
    this.schema = schema
  }
}
