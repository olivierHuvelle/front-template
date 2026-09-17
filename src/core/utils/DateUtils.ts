import { format, parse, isValid } from 'date-fns'

import { getSettings } from '@/core/settings/settings'

export class DateUtils {
  public static format(date: Date, dateFormat?: string): string {
    const formatToUse = dateFormat ?? getSettings().date.format

    return format(date, formatToUse)
  }

  public static formatDateTime(date: Date, dateTimeFormat?: string): string {
    const formatToUse = dateTimeFormat ?? getSettings().date.dateTimeFormat

    return format(date, formatToUse)
  }

  public static parse(value: string, dateFormat?: string): Date {
    const formatToUse = dateFormat ?? getSettings().date.format
    const date = parse(value, formatToUse, new Date())

    // IDEA : error as always : custom ?
    if (!isValid(date)) {
      throw new Error(`Invalid date "${value}" for format "${formatToUse}"`)
    }

    return date
  }

  public static toIso(date: Date): string {
    return date.toISOString()
  }
}
