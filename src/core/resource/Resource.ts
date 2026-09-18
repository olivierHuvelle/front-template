import type { ZodObject, ZodRawShape } from 'zod'

import type { FieldSelection } from '@/core/resource/FieldSelection'

type ResourceField<TShape extends ZodRawShape> = keyof TShape

export type ResourceOptions<TShape extends ZodRawShape> = {
  readOnlyFields?: Array<ResourceField<TShape>>
  create?: FieldSelection<ResourceField<TShape>>
  update?: FieldSelection<ResourceField<TShape>>
}

export class Resource<TShape extends ZodRawShape> {
  public readonly name: string
  public readonly schema: ZodObject<TShape>

  public readonly readOnlyFields: Array<ResourceField<TShape>>
  public readonly createFields: Array<ResourceField<TShape>>
  public readonly updateFields: Array<ResourceField<TShape>>

  constructor(name: string, schema: ZodObject<TShape>, options: ResourceOptions<TShape> = {}) {
    this.name = name
    this.schema = schema

    this.readOnlyFields = options.readOnlyFields ?? []

    const writableFields = this.getWritableFields()

    this.createFields = this.selectFields(writableFields, options.create)
    this.updateFields = this.selectFields(writableFields, options.update)
  }

  private getWritableFields(): Array<ResourceField<TShape>> {
    const readOnlyFields = new Set<PropertyKey>(this.readOnlyFields)

    return (Object.keys(this.schema.shape) as Array<ResourceField<TShape>>).filter(
      (field) => !readOnlyFields.has(field),
    )
  }

  private selectFields(
    fields: Array<ResourceField<TShape>>,
    selection?: FieldSelection<ResourceField<TShape>>,
  ): Array<ResourceField<TShape>> {
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
    fields: Array<ResourceField<TShape>>,
    availableFields: Array<ResourceField<TShape>>,
  ): void {
    const availableFieldSet = new Set<PropertyKey>(availableFields)

    for (const field of fields) {
      if (!availableFieldSet.has(field)) {
        throw new Error(`Field "${String(field)}" is not writable`)
      }
    }
  }
}
