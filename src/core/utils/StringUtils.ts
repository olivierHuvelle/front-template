export class StringUtils {
  public static capitalize(value: string): string {
    if (!value) {
      return value
    }

    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  public static toCamelCase(value: string): string {
    return value
      .trim()
      .replace(/[-_\s]+(.)?/g, (_, character?: string) =>
        character ? character.toUpperCase() : '',
      )
      .replace(/^./, (character) => character.toLowerCase())
  }

  public static toSnakeCase(value: string): string {
    return value
      .trim()
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[-\s]+/g, '_')
      .toLowerCase()
  }

  public static normalize(
    value: string,
    options: {
      capitalize?: boolean
    } = {},
  ): string {
    const normalized = value.trim().toLowerCase()

    if (options.capitalize) {
      return this.capitalize(normalized)
    }

    return normalized
  }
}
