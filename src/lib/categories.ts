import type { CategoryId, Priority } from './types'
import {
  Wrench,
  Tractor,
  Leaf,
  Fence,
  Sprout,
  Bird,
  Home,
  Droplets,
  Hammer,
  type LucideIcon,
} from 'lucide-react'

export interface CategoryMeta {
  id: CategoryId
  label: string
  icon: LucideIcon
  // soft background + strong foreground for chips/icons
  tint: string
  fg: string
  dot: string
}

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  repair: {
    id: 'repair',
    label: 'Repair',
    icon: Wrench,
    tint: 'bg-clay-100 dark:bg-clay-500/15',
    fg: 'text-clay-700 dark:text-clay-200',
    dot: 'bg-clay-500',
  },
  machinery: {
    id: 'machinery',
    label: 'Machinery',
    icon: Tractor,
    tint: 'bg-wheat-100 dark:bg-wheat-500/15',
    fg: 'text-wheat-800 dark:text-wheat-200',
    dot: 'bg-wheat-500',
  },
  seasonal: {
    id: 'seasonal',
    label: 'Seasonal',
    icon: Leaf,
    tint: 'bg-forest-100 dark:bg-forest-500/15',
    fg: 'text-forest-700 dark:text-forest-200',
    dot: 'bg-forest-500',
  },
  fencing: {
    id: 'fencing',
    label: 'Fencing',
    icon: Fence,
    tint: 'bg-stone-200/70 dark:bg-white/5',
    fg: 'text-stone-700 dark:text-stone-200',
    dot: 'bg-stone-500',
  },
  garden: {
    id: 'garden',
    label: 'Garden',
    icon: Sprout,
    tint: 'bg-emerald-100 dark:bg-emerald-500/15',
    fg: 'text-emerald-700 dark:text-emerald-200',
    dot: 'bg-emerald-500',
  },
  animals: {
    id: 'animals',
    label: 'Animals',
    icon: Bird,
    tint: 'bg-amber-100 dark:bg-amber-500/15',
    fg: 'text-amber-700 dark:text-amber-200',
    dot: 'bg-amber-500',
  },
  building: {
    id: 'building',
    label: 'Building',
    icon: Home,
    tint: 'bg-orange-100 dark:bg-orange-500/15',
    fg: 'text-orange-700 dark:text-orange-200',
    dot: 'bg-orange-500',
  },
  water: {
    id: 'water',
    label: 'Water',
    icon: Droplets,
    tint: 'bg-sky-100 dark:bg-sky-500/15',
    fg: 'text-sky-700 dark:text-sky-200',
    dot: 'bg-sky-500',
  },
  general: {
    id: 'general',
    label: 'General',
    icon: Hammer,
    tint: 'bg-stone-200/70 dark:bg-white/5',
    fg: 'text-stone-700 dark:text-stone-200',
    dot: 'bg-stone-400',
  },
}

export const CATEGORY_LIST = Object.values(CATEGORIES)

export interface PriorityMeta {
  id: Priority
  label: string
  ring: string
  chip: string
  bar: string
  rank: number
}

export const PRIORITIES: Record<Priority, PriorityMeta> = {
  urgent: {
    id: 'urgent',
    label: 'Urgent',
    ring: 'ring-clay-500',
    chip: 'bg-clay-500 text-white',
    bar: 'bg-clay-500',
    rank: 3,
  },
  high: {
    id: 'high',
    label: 'High',
    ring: 'ring-wheat-500',
    chip: 'bg-wheat-400 text-wheat-900',
    bar: 'bg-wheat-400',
    rank: 2,
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    ring: 'ring-forest-400',
    chip: 'bg-forest-100 text-forest-700 dark:bg-forest-500/20 dark:text-forest-200',
    bar: 'bg-forest-400',
    rank: 1,
  },
  low: {
    id: 'low',
    label: 'Low',
    ring: 'ring-stone-300',
    chip: 'bg-stone-200 text-stone-600 dark:bg-white/10 dark:text-stone-300',
    bar: 'bg-stone-300',
    rank: 0,
  },
}

export const PRIORITY_LIST = Object.values(PRIORITIES).sort((a, b) => b.rank - a.rank)
