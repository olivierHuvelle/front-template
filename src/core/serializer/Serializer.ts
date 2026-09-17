import { z, type ZodRawShape } from 'zod'

import type { Resource } from '@/core/resource/Resource'
import { DateUtils } from '@/core/utils/DateUtils'

type ResourceData<TShape extends ZodRawShape> = z.infer<Resource<TShape>['schema']>

export type Serialized<T> = T extends Date
  ? string
  : T extends Array<infer U>
    ? Array<Serialized<U>>
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : T

export type SerializeOptions<T> =
  | {
      fields: Array<keyof T>
      exclude?: never
    }
  | {
      fields?: never
      exclude: Array<keyof T>
    }
  | {
      fields?: never
      exclude?: never
    }

export class Serializer<TShape extends ZodRawShape> {
  public readonly resource: Resource<TShape>

  constructor(resource: Resource<TShape>) {
    this.resource = resource
  }

  public deserialize(data: unknown): ResourceData<TShape> {
    return this.resource.schema.parse(data)
  }

  public serialize(
    data: Partial<ResourceData<TShape>>,
    options: SerializeOptions<ResourceData<TShape>> = {},
  ): Partial<Serialized<ResourceData<TShape>>> {
    // IDEA: SchemaUtils.omit(schema, fields), SchemaUtils.pick(schema, fields)
    // IDEA: add custom errors

    if (options.fields) {
      const shape = Object.fromEntries(
        options.fields.map((field) => [field, this.resource.schema.shape[field as keyof TShape]]),
      ) as ZodRawShape

      const validatedData = z.object(shape).parse(data)

      return this.serializeValue(validatedData) as Partial<Serialized<ResourceData<TShape>>>
    }

    if (options.exclude) {
      const excludedFields = new Set<PropertyKey>(options.exclude)

      const shape = Object.fromEntries(
        Object.entries(this.resource.schema.shape).filter(([field]) => !excludedFields.has(field)),
      ) as ZodRawShape

      const validatedData = z.object(shape).parse(data)

      return this.serializeValue(validatedData) as Partial<Serialized<ResourceData<TShape>>>
    }

    const validatedData = this.resource.schema.parse(data)

    return this.serializeValue(validatedData) as Serialized<ResourceData<TShape>>
  }

  private serializeValue(value: unknown): unknown {
    if (value instanceof Date) {
      return DateUtils.toIso(value)
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.serializeValue(item))
    }

    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [key, this.serializeValue(nestedValue)]),
      )
    }

    return value
  }
}
