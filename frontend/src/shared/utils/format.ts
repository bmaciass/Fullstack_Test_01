import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export function formatDate(date: string | Date, format = 'MMM D, YYYY'): string {
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('MMM D, YYYY h:mm A')
}

export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow()
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function formatEnumValue(value: string): string {
  return value
    .split('_')
    .map((word) => capitalize(word))
    .join(' ')
}
