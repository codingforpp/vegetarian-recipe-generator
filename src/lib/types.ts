export type Priority = 'low' | 'normal' | 'high' | 'urgent'
export type JobStatus = 'todo' | 'doing' | 'done'

export type RecurrenceUnit = 'none' | 'days' | 'weeks' | 'months' | 'years'

export interface Recurrence {
  unit: RecurrenceUnit
  every: number // e.g. every 2 weeks
}

export type CategoryId =
  | 'repair'
  | 'machinery'
  | 'seasonal'
  | 'fencing'
  | 'garden'
  | 'animals'
  | 'building'
  | 'water'
  | 'general'

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface Job {
  id: string
  title: string
  notes?: string
  category: CategoryId
  priority: Priority
  status: JobStatus
  areaId?: string
  equipmentId?: string
  dueDate?: string // ISO date
  recurrence: Recurrence
  checklist: ChecklistItem[]
  photos: string[] // data URLs
  estMinutes?: number
  cost?: number
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface Area {
  id: string
  name: string
  emoji: string
  color: string // tailwind-ish hex
  notes?: string
  createdAt: string
}

export interface Equipment {
  id: string
  name: string
  type: string
  emoji: string
  notes?: string
  lastServiced?: string // ISO date
  serviceIntervalDays?: number
  hours?: number
  photo?: string
  createdAt: string
}

export interface Settings {
  theme: 'system' | 'light' | 'dark'
  farmName: string
  reduceMotion: boolean
}
