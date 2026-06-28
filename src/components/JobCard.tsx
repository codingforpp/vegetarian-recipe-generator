import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Check, Repeat, Paperclip, ListChecks } from 'lucide-react'
import type { Job } from '../lib/types'
import { CATEGORIES } from '../lib/categories'
import { cn, dueLabel } from '../lib/utils'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { haptic } from '../lib/haptics'

const toneStyles: Record<string, string> = {
  overdue: 'text-clay-600 dark:text-clay-300',
  today: 'text-forest-700 dark:text-forest-200 font-semibold',
  soon: 'text-ink-soft dark:text-canvas/60',
  later: 'text-ink-faint',
  none: 'text-ink-faint',
}

export const JobCard = forwardRef<HTMLDivElement, { job: Job; index?: number }>(function JobCard(
  { job, index = 0 },
  ref,
) {
  const toggleDone = useStore((s) => s.toggleDone)
  const area = useStore((s) => s.areas.find((a) => a.id === job.areaId))
  const equipment = useStore((s) => s.equipment.find((e) => e.id === job.equipmentId))
  const openSheet = useUI((s) => s.openSheet)
  const showToast = useUI((s) => s.showToast)

  const cat = CATEGORIES[job.category]
  const Icon = cat.icon
  const due = dueLabel(job.dueDate)
  const done = job.status === 'done'
  const doneCount = job.checklist.filter((c) => c.done).length

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index * 0.03, 0.25), type: 'spring', damping: 26, stiffness: 320 }}
      onClick={() => openSheet({ kind: 'job-detail', jobId: job.id })}
      className={cn(
        'card pressable group relative flex items-start gap-3.5 p-3.5 pr-4 cursor-pointer overflow-hidden',
        done && 'opacity-60',
      )}
    >
      {job.priority === 'urgent' && !done && (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-clay-500" />
      )}

      {/* Complete toggle */}
      <button
        aria-label={done ? 'Mark not done' : 'Mark done'}
        onClick={(e) => {
          e.stopPropagation()
          haptic(done ? 6 : [10, 30, 12])
          toggleDone(job.id)
          if (!done) showToast('Job completed', { label: 'Undo', run: () => toggleDone(job.id) })
        }}
        className={cn(
          'mt-0.5 shrink-0 h-7 w-7 rounded-full grid place-items-center border-2 transition-all duration-200 active:scale-90',
          done
            ? 'bg-forest-600 border-forest-600 text-canvas'
            : 'border-ink/20 dark:border-white/25 text-transparent hover:border-forest-500',
        )}
      >
        <Check size={15} strokeWidth={3} className={done ? 'animate-check-pop' : ''} />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-[15.5px] font-semibold leading-snug tracking-tight text-ink dark:text-canvas',
            done && 'line-through decoration-1 text-ink-faint',
          )}
        >
          {job.title}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]">
          <span className={cn('inline-flex items-center gap-1', cat.fg)}>
            <Icon size={13} strokeWidth={2.4} />
            {cat.label}
          </span>
          {area && (
            <span className="text-ink-faint inline-flex items-center gap-1">
              <span>{area.emoji}</span>
              {area.name}
            </span>
          )}
          {equipment && !area && (
            <span className="text-ink-faint inline-flex items-center gap-1">
              <span>{equipment.emoji}</span>
              {equipment.name}
            </span>
          )}
          {job.dueDate && <span className={toneStyles[due.tone]}>{due.text}</span>}
        </div>

        {(job.recurrence.unit !== 'none' || job.checklist.length > 0 || job.photos.length > 0) && (
          <div className="mt-1.5 flex items-center gap-3 text-[11.5px] text-ink-faint">
            {job.recurrence.unit !== 'none' && (
              <span className="inline-flex items-center gap-1">
                <Repeat size={11} /> Repeats
              </span>
            )}
            {job.checklist.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <ListChecks size={12} /> {doneCount}/{job.checklist.length}
              </span>
            )}
            {job.photos.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Paperclip size={11} /> {job.photos.length}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Photo thumbnail */}
      {job.photos[0] && (
        <img
          src={job.photos[0]}
          alt=""
          className="shrink-0 h-14 w-14 rounded-2xl object-cover border border-black/5"
        />
      )}
    </motion.div>
  )
})
