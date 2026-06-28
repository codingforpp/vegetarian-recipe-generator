import { useRef, useState } from 'react'
import { Camera, X, Plus, Trash2, Clock, DollarSign } from 'lucide-react'
import { format, addDays, nextSaturday } from 'date-fns'
import { Sheet, SheetHeader } from '../ui/Sheet'
import { GhostButton, PrimaryButton, Chip } from '../ui/controls'
import { CATEGORY_LIST, PRIORITY_LIST } from '../../lib/categories'
import { useStore } from '../../lib/store'
import { useUI } from '../../lib/ui'
import type { CategoryId, ChecklistItem, Priority, Recurrence, RecurrenceUnit } from '../../lib/types'
import { cn, uid } from '../../lib/utils'
import { fileToCompressedDataURL } from '../../lib/photo'
import { haptic } from '../../lib/haptics'

interface Props {
  jobId?: string
  preset?: Record<string, unknown>
  onClose: () => void
}

export function JobSheet({ jobId, preset, onClose }: Props) {
  const { jobs, areas, equipment, addJob, updateJob, deleteJob } = useStore()
  const showToast = useUI((s) => s.showToast)
  const existing = jobId ? jobs.find((j) => j.id === jobId) : undefined

  const [title, setTitle] = useState(existing?.title ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [category, setCategory] = useState<CategoryId>(
    existing?.category ?? ((preset?.category as CategoryId) || 'general'),
  )
  const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'normal')
  const [areaId, setAreaId] = useState<string | undefined>(
    existing?.areaId ?? (preset?.areaId as string | undefined),
  )
  const [equipmentId, setEquipmentId] = useState<string | undefined>(
    existing?.equipmentId ?? (preset?.equipmentId as string | undefined),
  )
  const [dueDate, setDueDate] = useState<string | undefined>(existing?.dueDate)
  const [recurrence, setRecurrence] = useState<Recurrence>(
    existing?.recurrence ?? { unit: 'none', every: 1 },
  )
  const [photos, setPhotos] = useState<string[]>(existing?.photos ?? [])
  const [checklist, setChecklist] = useState<ChecklistItem[]>(existing?.checklist ?? [])
  const [checkInput, setCheckInput] = useState('')
  const [estMinutes, setEstMinutes] = useState<string>(existing?.estMinutes?.toString() ?? '')
  const [cost, setCost] = useState<string>(existing?.cost?.toString() ?? '')
  const [showExtras, setShowExtras] = useState(
    !!(existing?.estMinutes || existing?.cost || existing?.checklist.length),
  )

  const fileRef = useRef<HTMLInputElement>(null)

  const canSave = title.trim().length > 0

  function save() {
    if (!canSave) return
    const payload = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      category,
      priority,
      status: existing?.status ?? ('todo' as const),
      areaId,
      equipmentId,
      dueDate,
      recurrence,
      checklist,
      photos,
      estMinutes: estMinutes ? parseInt(estMinutes, 10) : undefined,
      cost: cost ? parseFloat(cost) : undefined,
    }
    if (existing) {
      updateJob(existing.id, payload)
      showToast('Job updated')
    } else {
      addJob(payload)
      showToast('Job added')
    }
    haptic([10, 20, 10])
    onClose()
  }

  async function onPickPhotos(files: FileList | null) {
    if (!files) return
    const arr = Array.from(files).slice(0, 4)
    const urls = await Promise.all(arr.map((f) => fileToCompressedDataURL(f)))
    setPhotos((p) => [...p, ...urls].slice(0, 6))
  }

  function addCheck() {
    const t = checkInput.trim()
    if (!t) return
    setChecklist((c) => [...c, { id: uid(), text: t, done: false }])
    setCheckInput('')
  }

  const dueChips: { label: string; date?: string }[] = [
    { label: 'Today', date: format(new Date(), 'yyyy-MM-dd') },
    { label: 'Tomorrow', date: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
    { label: 'Weekend', date: format(nextSaturday(new Date()), 'yyyy-MM-dd') },
    { label: 'Next week', date: format(addDays(new Date(), 7), 'yyyy-MM-dd') },
    { label: 'No date', date: undefined },
  ]

  return (
    <Sheet onClose={onClose}>
      <SheetHeader
        title={existing ? 'Edit job' : 'New job'}
        left={<GhostButton onClick={onClose}>Cancel</GhostButton>}
        right={
          <button
            onClick={save}
            disabled={!canSave}
            className={cn(
              'px-4 py-2 rounded-xl font-semibold text-[15px] transition',
              canSave ? 'text-forest-700 dark:text-forest-300' : 'text-ink-faint/50',
            )}
          >
            Save
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-[calc(var(--safe-bottom)+24px)] space-y-6 scroll-area">
        {/* Title */}
        <div className="pt-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            autoFocus={!existing}
            className="w-full bg-transparent text-[22px] font-display font-semibold tracking-tight placeholder:text-ink-faint/50 outline-none text-ink dark:text-canvas"
          />
        </div>

        {/* Category */}
        <div>
          <p className="label">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_LIST.map((c) => (
              <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                <c.icon size={14} /> {c.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <p className="label">Priority</p>
          <div className="flex gap-2">
            {PRIORITY_LIST.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  haptic()
                  setPriority(p.id)
                }}
                className={cn(
                  'pressable flex-1 py-2.5 rounded-xl text-[13.5px] font-semibold border transition',
                  priority === p.id
                    ? p.chip + ' border-transparent shadow-soft'
                    : 'bg-canvas-subtle text-ink-faint border-black/[0.05] dark:bg-forest-950/50 dark:border-white/10',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div>
          <p className="label">When</p>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {dueChips.map((c) => (
              <Chip key={c.label} active={dueDate === c.date} onClick={() => setDueDate(c.date)}>
                {c.label}
              </Chip>
            ))}
          </div>
          <input
            type="date"
            value={dueDate ?? ''}
            onChange={(e) => setDueDate(e.target.value || undefined)}
            className="field"
          />
        </div>

        {/* Recurrence */}
        <div>
          <p className="label">Repeats</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {(
              [
                { u: 'none', n: 1, label: 'Never' },
                { u: 'days', n: 1, label: 'Daily' },
                { u: 'weeks', n: 1, label: 'Weekly' },
                { u: 'months', n: 1, label: 'Monthly' },
                { u: 'months', n: 3, label: 'Seasonal' },
                { u: 'years', n: 1, label: 'Yearly' },
              ] as { u: RecurrenceUnit; n: number; label: string }[]
            ).map((r) => (
              <Chip
                key={r.label}
                active={recurrence.unit === r.u && recurrence.every === r.n}
                onClick={() => setRecurrence({ unit: r.u, every: r.n })}
              >
                {r.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Area + Equipment */}
        {areas.length > 0 && (
          <div>
            <p className="label">Area</p>
            <div className="flex flex-wrap gap-2">
              {areas.map((a) => (
                <Chip
                  key={a.id}
                  active={areaId === a.id}
                  onClick={() => setAreaId((cur) => (cur === a.id ? undefined : a.id))}
                >
                  <span>{a.emoji}</span> {a.name}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {equipment.length > 0 && (
          <div>
            <p className="label">Equipment</p>
            <div className="flex flex-wrap gap-2">
              {equipment.map((e) => (
                <Chip
                  key={e.id}
                  active={equipmentId === e.id}
                  onClick={() => setEquipmentId((cur) => (cur === e.id ? undefined : e.id))}
                >
                  <span>{e.emoji}</span> {e.name}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <p className="label">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add details, parts needed, measurements…"
            rows={3}
            className="field resize-none"
          />
        </div>

        {/* Photos */}
        <div>
          <p className="label">Photos</p>
          <div className="flex gap-2.5 flex-wrap">
            {photos.map((p, i) => (
              <div key={i} className="relative h-20 w-20">
                <img src={p} alt="" className="h-20 w-20 rounded-2xl object-cover border border-black/5" />
                <button
                  onClick={() => setPhotos((ph) => ph.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 h-6 w-6 grid place-items-center rounded-full bg-forest-900 text-canvas shadow-soft"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            {photos.length < 6 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="pressable h-20 w-20 rounded-2xl border-2 border-dashed border-black/15 dark:border-white/20 grid place-items-center text-ink-faint"
              >
                <Camera size={22} />
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            hidden
            onChange={(e) => onPickPhotos(e.target.files)}
          />
        </div>

        {/* Extras toggle */}
        {!showExtras ? (
          <button
            onClick={() => setShowExtras(true)}
            className="pressable inline-flex items-center gap-1.5 text-[14px] font-semibold text-forest-700 dark:text-forest-300"
          >
            <Plus size={16} /> Checklist, time & cost
          </button>
        ) : (
          <>
            {/* Checklist */}
            <div>
              <p className="label">Checklist</p>
              <div className="space-y-2 mb-2">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md border-2 border-ink/20 dark:border-white/25 shrink-0" />
                    <span className="flex-1 text-[15px]">{item.text}</span>
                    <button
                      onClick={() => setChecklist((c) => c.filter((x) => x.id !== item.id))}
                      className="text-ink-faint p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={checkInput}
                  onChange={(e) => setCheckInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCheck()}
                  placeholder="Add a step…"
                  className="field flex-1 py-2.5"
                />
                <button
                  onClick={addCheck}
                  className="pressable px-4 rounded-2xl bg-forest-100 text-forest-700 dark:bg-forest-500/20 dark:text-forest-300 font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Time + cost */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="label">Est. time</p>
                <div className="relative">
                  <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    value={estMinutes}
                    onChange={(e) => setEstMinutes(e.target.value.replace(/\D/g, ''))}
                    inputMode="numeric"
                    placeholder="min"
                    className="field pl-10"
                  />
                </div>
              </div>
              <div>
                <p className="label">Est. cost</p>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    value={cost}
                    onChange={(e) => setCost(e.target.value.replace(/[^\d.]/g, ''))}
                    inputMode="decimal"
                    placeholder="0"
                    className="field pl-10"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Delete */}
        {existing && (
          <button
            onClick={() => {
              deleteJob(existing.id)
              showToast('Job deleted')
              onClose()
            }}
            className="pressable w-full py-3.5 rounded-2xl text-clay-600 font-semibold inline-flex items-center justify-center gap-2 border border-clay-200 dark:border-clay-500/30"
          >
            <Trash2 size={17} /> Delete job
          </button>
        )}

        <div className="pt-1">
          <PrimaryButton onClick={save} disabled={!canSave}>
            {existing ? 'Save changes' : 'Add job'}
          </PrimaryButton>
        </div>
      </div>
    </Sheet>
  )
}
