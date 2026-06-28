import { useEffect, useRef } from 'react'
import { Pencil, Wrench, Clock, CheckCircle2, Plus } from 'lucide-react'
import { Sheet, SheetHeader } from '../ui/Sheet'
import { GhostButton, PrimaryButton } from '../ui/controls'
import { useStore } from '../../lib/store'
import { useUI } from '../../lib/ui'
import { cn, serviceStatus, shortDate } from '../../lib/utils'
import { JobCard } from '../JobCard'
import { SectionHeader } from '../ui/misc'
import { haptic } from '../../lib/haptics'

export function EquipmentDetail({ equipmentId, onClose }: { equipmentId: string; onClose: () => void }) {
  const item = useStore((s) => s.equipment.find((e) => e.id === equipmentId))
  const jobs = useStore((s) => s.jobs.filter((j) => j.equipmentId === equipmentId))
  const logService = useStore((s) => s.logService)
  const openSheet = useUI((s) => s.openSheet)
  const showToast = useUI((s) => s.showToast)

  // If the equipment is removed, dismiss after render rather than calling
  // history.back() mid-render. Fire once.
  const closedRef = useRef(false)
  useEffect(() => {
    if (!item && !closedRef.current) {
      closedRef.current = true
      onClose()
    }
  }, [item, onClose])

  if (!item) return null

  const svc = serviceStatus(item.lastServiced, item.serviceIntervalDays)
  const openJobs = jobs.filter((j) => j.status !== 'done')
  const doneJobs = jobs.filter((j) => j.status === 'done')

  return (
    <Sheet onClose={onClose}>
      <SheetHeader
        left={<GhostButton onClick={onClose}>Close</GhostButton>}
        right={
          <button
            onClick={() => openSheet({ kind: 'equipment-edit', equipmentId })}
            className="pressable inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-[15px] text-forest-700 dark:text-forest-300"
          >
            <Pencil size={15} /> Edit
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-[calc(var(--safe-bottom)+24px)] scroll-area">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 rounded-3xl bg-canvas-subtle dark:bg-forest-950/50 grid place-items-center text-4xl border border-black/[0.05] dark:border-white/10">
            {item.emoji}
          </div>
          <div>
            <h1 className="font-display text-[26px] font-semibold tracking-tight leading-tight text-ink dark:text-canvas">
              {item.name}
            </h1>
            <p className="text-[14px] text-ink-faint">{item.type}</p>
          </div>
        </div>

        {/* Service card */}
        {svc ? (
          <div
            className={cn(
              'mt-5 card p-4',
              svc.tone === 'overdue' && 'ring-1 ring-clay-300 dark:ring-clay-500/40',
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'h-10 w-10 rounded-xl grid place-items-center',
                    svc.tone === 'overdue'
                      ? 'bg-clay-100 text-clay-600 dark:bg-clay-500/15 dark:text-clay-300'
                      : svc.tone === 'soon'
                        ? 'bg-wheat-100 text-wheat-700 dark:bg-wheat-500/15 dark:text-wheat-300'
                        : 'bg-forest-100 text-forest-600 dark:bg-forest-500/15 dark:text-forest-300',
                  )}
                >
                  <Wrench size={18} />
                </span>
                <div>
                  <p className="text-[12px] text-ink-faint">Next service</p>
                  <p className="font-semibold text-[15px] text-ink dark:text-canvas">{svc.label}</p>
                </div>
              </div>
              <span className="text-[13px] text-ink-faint">{shortDate(svc.dueDate)}</span>
            </div>
          </div>
        ) : (
          <div className="mt-5 card p-4 text-[14px] text-ink-faint">
            No service schedule set.{' '}
            <button
              onClick={() => openSheet({ kind: 'equipment-edit', equipmentId })}
              className="font-semibold text-forest-700 dark:text-forest-300"
            >
              Add one
            </button>
          </div>
        )}

        {/* Meta */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="card p-3.5">
            <Clock size={16} className="text-ink-faint mb-1.5" />
            <p className="text-[12px] text-ink-faint">Last serviced</p>
            <p className="text-[14.5px] font-semibold text-ink dark:text-canvas mt-0.5">
              {item.lastServiced ? shortDate(item.lastServiced) : '—'}
            </p>
          </div>
          <div className="card p-3.5">
            <Wrench size={16} className="text-ink-faint mb-1.5" />
            <p className="text-[12px] text-ink-faint">Hours used</p>
            <p className="text-[14.5px] font-semibold text-ink dark:text-canvas mt-0.5">
              {item.hours ?? '—'}
            </p>
          </div>
        </div>

        {item.notes && (
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft dark:text-canvas/75 whitespace-pre-wrap">
            {item.notes}
          </p>
        )}

        {/* Log service */}
        <div className="mt-5">
          <PrimaryButton
            onClick={() => {
              logService(item.id)
              haptic([10, 30, 12])
              showToast('Service logged for today')
            }}
          >
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={18} /> Log service done today
            </span>
          </PrimaryButton>
        </div>

        {/* Related jobs */}
        <div className="mt-7">
          <SectionHeader
            title="Jobs"
            count={openJobs.length}
            action={
              <button
                onClick={() =>
                  openSheet({ kind: 'job-edit', preset: { equipmentId, category: 'machinery' } })
                }
                className="pressable inline-flex items-center gap-1 text-[14px] font-semibold text-forest-700 dark:text-forest-300"
              >
                <Plus size={16} /> Add
              </button>
            }
          />
          {openJobs.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {openJobs.map((j, i) => (
                <JobCard key={j.id} job={j} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-ink-faint px-1 py-2">No open jobs for this equipment.</p>
          )}

          {doneJobs.length > 0 && (
            <div className="mt-5 opacity-70">
              <SectionHeader title="History" count={doneJobs.length} />
              <div className="flex flex-col gap-2.5">
                {doneJobs.map((j, i) => (
                  <JobCard key={j.id} job={j} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  )
}
