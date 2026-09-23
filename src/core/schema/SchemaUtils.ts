import { z, type ZodObject, type ZodRawShape } from 'zod'

export class SchemaUtils {
  public static pick<TShape extends ZodRawShape, const TKey extends keyof TShape>(
    schema: ZodObject<TShape>,
    fields: readonly TKey[],
  ): ZodObject<Pick<TShape, TKey>> {
    const shape = Object.fromEntries(fields.map((field) => [field, schema.shape[field]])) as Pick<
      TShape,
      TKey
    >

    return z.object(shape)
  }
}
