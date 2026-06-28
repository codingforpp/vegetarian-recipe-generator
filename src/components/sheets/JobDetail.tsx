import { Check, Pencil, Repeat, Clock, DollarSign, CalendarDays } from 'lucide-react'
import { Sheet, SheetHeader } from '../ui/Sheet'
import { GhostButton, PrimaryButton } from '../ui/controls'
import { useStore } from '../../lib/store'
import { useUI } from '../../lib/ui'
import { CATEGORIES, PRIORITIES } from '../../lib/categories'
import { cn, dueLabel, fullDate, recurrenceLabel } from '../../lib/utils'
import { haptic } from '../../lib/haptics'

export function JobDetail({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const job = useStore((s) => s.jobs.find((j) => j.id === jobId))
  const area = useStore((s) => s.areas.find((a) => a.id === job?.areaId))
  const equipment = useStore((s) => s.equipment.find((e) => e.id === job?.equipmentId))
  const toggleDone = useStore((s) => s.toggleDone)
  const toggleChecklistItem = useStore((s) => s.toggleChecklistItem)
  const openSheet = useUI((s) => s.openSheet)

  if (!job) {
    onClose()
    return null
  }

  const cat = CATEGORIES[job.category]
  const Icon = cat.icon
  const due = dueLabel(job.dueDate)
  const done = job.status === 'done'
  const doneCount = job.checklist.filter((c) => c.done).length

  const meta: { icon: typeof Clock; label: string; value: string }[] = []
  if (job.dueDate) meta.push({ icon: CalendarDays, label: 'Due', value: fullDate(job.dueDate) })
  if (job.recurrence.unit !== 'none')
    meta.push({ icon: Repeat, label: 'Repeats', value: recurrenceLabel(job.recurrence) })
  if (job.estMinutes) meta.push({ icon: Clock, label: 'Est. time', value: `${job.estMinutes} min` })
  if (job.cost) meta.push({ icon: DollarSign, label: 'Est. cost', value: `$${job.cost}` })

  return (
    <Sheet onClose={onClose}>
      <SheetHeader
        left={<GhostButton onClick={onClose}>Close</GhostButton>}
        right={
          <button
            onClick={() => openSheet({ kind: 'job-edit', jobId })}
            className="pressable inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-[15px] text-forest-700 dark:text-forest-300"
          >
            <Pencil size={15} /> Edit
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-[calc(var(--safe-bottom)+24px)] scroll-area">
        {/* Title block */}
        <div className="flex items-start gap-2 mb-1">
          <span className={cn('inline-flex items-center gap-1.5 text-[13px] font-semibold px-2.5 py-1 rounded-full', cat.tint, cat.fg)}>
            <Icon size={13} /> {cat.label}
          </span>
          <span className={cn('text-[13px] font-semibold px-2.5 py-1 rounded-full', PRIORITIES[job.priority].chip)}>
            {PRIORITIES[job.priority].label}
          </span>
        </div>
        <h1
          className={cn(
            'font-display text-[26px] font-semibold tracking-tight leading-tight mt-2 text-ink dark:text-canvas',
            done && 'line-through text-ink-faint',
          )}
        >
          {job.title}
        </h1>

        {/* Place chips */}
        {(area || equipment) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {area && (
              <span className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-soft dark:text-canvas/70 bg-canvas-subtle dark:bg-forest-950/50 px-3 py-1.5 rounded-full">
                <span>{area.emoji}</span> {area.name}
              </span>
            )}
            {equipment && (
              <button
                onClick={() => openSheet({ kind: 'equipment-detail', equipmentId: equipment.id })}
                className="pressable inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-soft dark:text-canvas/70 bg-canvas-subtle dark:bg-forest-950/50 px-3 py-1.5 rounded-full"
              >
                <span>{equipment.emoji}</span> {equipment.name}
              </button>
            )}
          </div>
        )}

        {/* Due banner */}
        {job.dueDate && !done && (
          <div
            className={cn(
              'mt-4 rounded-2xl px-4 py-3 text-[14.5px] font-semibold',
              due.tone === 'overdue'
                ? 'bg-clay-100 text-clay-700 dark:bg-clay-500/15 dark:text-clay-300'
                : due.tone === 'today'
                  ? 'bg-forest-100 text-forest-800 dark:bg-forest-500/15 dark:text-forest-200'
                  : 'bg-canvas-subtle text-ink-soft dark:bg-forest-950/50 dark:text-canvas/70',
            )}
          >
            {due.tone === 'overdue' ? '⚠️ ' : '📅 '}
            {due.tone === 'overdue' || due.tone === 'today' ? `${due.text} · ` : ''}
            {fullDate(job.dueDate)}
          </div>
        )}

        {/* Photos */}
        {job.photos.length > 0 && (
          <div className="mt-4 -mx-1 flex gap-2.5 overflow-x-auto no-scrollbar px-1 pb-1">
            {job.photos.map((p, i) => (
              <img
                key={i}
                src={p}
                alt=""
                className="h-44 w-44 shrink-0 rounded-3xl object-cover border border-black/5"
              />
            ))}
          </div>
        )}

        {/* Notes */}
        {job.notes && (
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-soft dark:text-canvas/75 whitespace-pre-wrap">
            {job.notes}
          </p>
        )}

        {/* Meta grid */}
        {meta.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {meta.map((m, i) => (
              <div key={i} className="card p-3.5">
                <m.icon size={16} className="text-ink-faint mb-1.5" />
                <p className="text-[12px] text-ink-faint">{m.label}</p>
                <p className="text-[14.5px] font-semibold text-ink dark:text-canvas mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Checklist */}
        {job.checklist.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                Checklist
              </p>
              <span className="text-[13px] font-semibold text-ink-faint">
                {doneCount}/{job.checklist.length}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/10 mb-3 overflow-hidden">
              <div
                className="h-full bg-forest-500 transition-all duration-500 ease-spring"
                style={{ width: `${(doneCount / job.checklist.length) * 100}%` }}
              />
            </div>
            <div className="space-y-1">
              {job.checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    haptic()
                    toggleChecklistItem(job.id, item.id)
                  }}
                  className="pressable w-full flex items-center gap-3 py-2.5 px-1 text-left"
                >
                  <span
                    className={cn(
                      'h-6 w-6 rounded-lg grid place-items-center border-2 shrink-0 transition',
                      item.done
                        ? 'bg-forest-600 border-forest-600 text-canvas'
                        : 'border-ink/20 dark:border-white/25 text-transparent',
                    )}
                  >
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span
                    className={cn(
                      'text-[15.5px]',
                      item.done && 'line-through text-ink-faint',
                    )}
                  >
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Complete CTA */}
        <div className="mt-7">
          <PrimaryButton
            onClick={() => {
              toggleDone(job.id)
              haptic([10, 30, 12])
              if (!done) onClose()
            }}
            className={done ? 'bg-canvas-subtle text-ink-soft dark:bg-forest-900 shadow-none' : ''}
          >
            {done ? '↩ Mark as not done' : '✓ Mark complete'}
          </PrimaryButton>
        </div>
      </div>
    </Sheet>
  )
}
