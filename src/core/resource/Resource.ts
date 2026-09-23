import type { ZodObject, ZodOptional, ZodRawShape } from 'zod'

import type { FieldSelection } from '@/core/resource/FieldSelection'
import type { CreateFields, UpdateFields } from '@/core/resource/ResourceFields'
import { SchemaUtils } from '@/core/schema/SchemaUtils'

type ResourceField<TShape extends ZodRawShape> = keyof TShape

type PartialShape<TShape extends ZodRawShape> = {
  [K in keyof TShape]: ZodOptional<TShape[K]>
}

export type ResourceOptions<TShape extends ZodRawShape> = {
  readOnlyFields?: readonly ResourceField<TShape>[]
  create?: FieldSelection<ResourceField<TShape>>
  update?: FieldSelection<ResourceField<TShape>>
}

export class Resource<
  TShape extends ZodRawShape,
  const TOptions extends ResourceOptions<TShape> = ResourceOptions<TShape>,
> {
  public readonly name: string
  public readonly schema: ZodObject<TShape>

  public readonly readOnlyFields: readonly ResourceField<TShape>[]
  public readonly createFields: readonly CreateFields<TShape, TOptions>[]
  public readonly updateFields: readonly UpdateFields<TShape, TOptions>[]

  public readonly createSchema: ZodObject<Pick<TShape, CreateFields<TShape, TOptions>>>

  public readonly updateSchema: ZodObject<
    PartialShape<Pick<TShape, UpdateFields<TShape, TOptions>>>
  >

  declare readonly $options: TOptions

  constructor(name: string, schema: ZodObject<TShape>, options?: TOptions) {
    this.name = name
    this.schema = schema

    this.readOnlyFields = options?.readOnlyFields ?? []

    const writableFields = this.getWritableFields()

    this.createFields = this.selectFields(writableFields, options?.create) as readonly CreateFields<
      TShape,
      TOptions
    >[]

    this.updateFields = this.selectFields(writableFields, options?.update) as readonly UpdateFields<
      TShape,
      TOptions
    >[]

    this.createSchema = SchemaUtils.pick(this.schema, this.createFields)

    this.updateSchema = SchemaUtils.pick(this.schema, this.updateFields).partial()
  }

  private getWritableFields(): ResourceField<TShape>[] {
    const readOnlyFields = new Set<PropertyKey>(this.readOnlyFields)

    return (Object.keys(this.schema.shape) as ResourceField<TShape>[]).filter(
      (field) => !readOnlyFields.has(field),
    )
  }

  private selectFields(
    fields: readonly ResourceField<TShape>[],
    selection?: FieldSelection<ResourceField<TShape>>,
  ): readonly ResourceField<TShape>[] {
    if (selection?.only) {
      this.validateFields(selection.only, fields)

      return selection.only
    }

    if (selection?.except) {
      this.validateFields(selection.except, fields)

      const excludedFields = new Set<PropertyKey>(selection.except)

      return fields.filter((field) => !excludedFields.has(field))
    }

    return fields
  }

  private validateFields(
    fields: readonly ResourceField<TShape>[],
    availableFields: readonly ResourceField<TShape>[],
  ): void {
    const availableFieldSet = new Set<PropertyKey>(availableFields)

    for (const field of fields) {
      if (!availableFieldSet.has(field)) {
        throw new Error(`Field "${String(field)}" is not writable`)
      }
    }
  }
}
