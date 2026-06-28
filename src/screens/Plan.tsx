import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useStore } from '../lib/store'
import { JobCard } from '../components/JobCard'
import { SectionHeader, EmptyState } from '../components/ui/misc'
import { CATEGORIES } from '../lib/categories'
import { cn } from '../lib/utils'
import { haptic } from '../lib/haptics'

export function Plan() {
  const jobs = useStore((s) => s.jobs)
  const [cursor, setCursor] = useState(new Date())
  const [selected, setSelected] = useState(new Date())

  const byDay = useMemo(() => {
    const map = new Map<string, typeof jobs>()
    for (const j of jobs) {
      if (!j.dueDate || j.status === 'done') continue
      const key = j.dueDate
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(j)
    }
    return map
  }, [jobs])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const selectedKey = format(selected, 'yyyy-MM-dd')
  const selectedJobs = (byDay.get(selectedKey) ?? []).sort(
    (a, b) => (a.priority < b.priority ? 1 : -1),
  )

  return (
    <div className="px-4 pt-[calc(var(--safe-top)+12px)]">
      <header className="pt-2 mb-4">
        <h1 className="font-display text-[30px] font-semibold tracking-tight text-ink dark:text-canvas">
          Plan
        </h1>
      </header>

      {/* Calendar card */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              haptic()
              setCursor((c) => addMonths(c, -1))
            }}
            className="pressable h-9 w-9 grid place-items-center rounded-full text-ink-soft dark:text-canvas/70 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-display text-[17px] font-semibold">{format(cursor, 'MMMM yyyy')}</h2>
          <button
            onClick={() => {
              haptic()
              setCursor((c) => addMonths(c, 1))
            }}
            className="pressable h-9 w-9 grid place-items-center rounded-full text-ink-soft dark:text-canvas/70 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1.5">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[11px] font-bold text-ink-faint py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayJobs = byDay.get(key) ?? []
            const isSel = isSameDay(day, selected)
            const inMonth = isSameMonth(day, cursor)
            const today = isToday(day)
            const hasUrgent = dayJobs.some((j) => j.priority === 'urgent')
            return (
              <button
                key={key}
                onClick={() => {
                  haptic()
                  setSelected(day)
                }}
                className="relative flex flex-col items-center py-1"
              >
                <span
                  className={cn(
                    'h-9 w-9 grid place-items-center rounded-full text-[14.5px] font-semibold transition-all',
                    !inMonth && 'text-ink-faint/40',
                    inMonth && !isSel && 'text-ink dark:text-canvas',
                    isSel && 'bg-forest-800 text-canvas dark:bg-forest-600 shadow-soft',
                    today && !isSel && 'text-clay-600 dark:text-clay-300',
                  )}
                >
                  {format(day, 'd')}
                </span>
                <span className="flex gap-0.5 h-1.5 mt-0.5">
                  {dayJobs.slice(0, 3).map((j) => (
                    <span
                      key={j.id}
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        isSel ? 'bg-forest-300' : hasUrgent && j.priority === 'urgent' ? 'bg-clay-500' : CATEGORIES[j.category].dot,
                      )}
                    />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day jobs */}
      <SectionHeader
        title={isToday(selected) ? 'Today' : format(selected, 'EEEE d MMM')}
        count={selectedJobs.length}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-2.5"
        >
          {selectedJobs.length > 0 ? (
            selectedJobs.map((j, i) => <JobCard key={j.id} job={j} index={i} />)
          ) : (
            <div className="card">
              <EmptyState
                emoji="📅"
                title="Nothing scheduled"
                subtitle={`No jobs due on ${format(selected, 'd MMMM')}.`}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
