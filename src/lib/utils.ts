import {
  differenceInCalendarDays,
  format,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
  addDays,
  addWeeks,
  addMonths,
  addYears,
} from 'date-fns'
import type { Job, Recurrence } from './types'

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function nowISO(): string {
  return new Date().toISOString()
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** Human-friendly due label */
export function dueLabel(due?: string): { text: string; tone: 'overdue' | 'today' | 'soon' | 'later' | 'none' } {
  if (!due) return { text: 'No date', tone: 'none' }
  const d = parseISO(due)
  if (isToday(d)) return { text: 'Today', tone: 'today' }
  if (isTomorrow(d)) return { text: 'Tomorrow', tone: 'soon' }
  if (isYesterday(d)) return { text: 'Yesterday', tone: 'overdue' }
  const diff = differenceInCalendarDays(d, new Date())
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, tone: 'overdue' }
  if (diff <= 7) return { text: format(d, 'EEEE'), tone: 'soon' }
  if (diff <= 30) return { text: `In ${diff}d`, tone: 'later' }
  return { text: format(d, 'd MMM'), tone: 'later' }
}

export function fullDate(iso?: string): string {
  if (!iso) return ''
  return format(parseISO(iso), 'EEEE, d MMMM yyyy')
}

export function shortDate(iso?: string): string {
  if (!iso) return ''
  return format(parseISO(iso), 'd MMM yyyy')
}

export function isOverdue(job: Job): boolean {
  if (!job.dueDate || job.status === 'done') return false
  return differenceInCalendarDays(parseISO(job.dueDate), new Date()) < 0
}

export function isDueToday(job: Job): boolean {
  if (!job.dueDate || job.status === 'done') return false
  return isToday(parseISO(job.dueDate))
}

export function isDueThisWeek(job: Job): boolean {
  if (!job.dueDate || job.status === 'done') return false
  const diff = differenceInCalendarDays(parseISO(job.dueDate), new Date())
  return diff >= 0 && diff <= 7
}

export function recurrenceLabel(r: Recurrence): string {
  if (r.unit === 'none') return ''
  const n = r.every
  const unit = r.unit
  if (n === 1) {
    const map: Record<string, string> = {
      days: 'Daily',
      weeks: 'Weekly',
      months: 'Monthly',
      years: 'Yearly',
    }
    return map[unit] ?? ''
  }
  return `Every ${n} ${unit}`
}

export function nextRecurrence(from: string, r: Recurrence): string {
  const d = parseISO(from)
  let next = d
  switch (r.unit) {
    case 'days':
      next = addDays(d, r.every)
      break
    case 'weeks':
      next = addWeeks(d, r.every)
      break
    case 'months':
      next = addMonths(d, r.every)
      break
    case 'years':
      next = addYears(d, r.every)
      break
    default:
      return from
  }
  return format(next, 'yyyy-MM-dd')
}

/** Service status for equipment */
export function serviceStatus(lastServiced?: string, intervalDays?: number) {
  if (!lastServiced || !intervalDays) return null
  const due = addDays(parseISO(lastServiced), intervalDays)
  const daysLeft = differenceInCalendarDays(due, new Date())
  let tone: 'overdue' | 'soon' | 'ok' = 'ok'
  if (daysLeft < 0) tone = 'overdue'
  else if (daysLeft <= 14) tone = 'soon'
  return {
    dueDate: format(due, 'yyyy-MM-dd'),
    daysLeft,
    tone,
    label:
      daysLeft < 0
        ? `${Math.abs(daysLeft)}d overdue`
        : daysLeft === 0
          ? 'Due today'
          : `In ${daysLeft}d`,
  }
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export { format }
