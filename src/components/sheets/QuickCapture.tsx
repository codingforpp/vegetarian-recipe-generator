import { useRef, useState } from 'react'
import { Camera, X, Zap, SlidersHorizontal } from 'lucide-react'
import { Sheet, SheetHeader } from '../ui/Sheet'
import { GhostButton, PrimaryButton, Chip } from '../ui/controls'
import { CATEGORY_LIST } from '../../lib/categories'
import { useStore } from '../../lib/store'
import { useUI } from '../../lib/ui'
import type { CategoryId, Priority } from '../../lib/types'
import { cn, todayISO } from '../../lib/utils'
import { fileToCompressedDataURL } from '../../lib/photo'
import { haptic } from '../../lib/haptics'

export function QuickCapture({ onClose }: { onClose: () => void }) {
  const { areas, addJob } = useStore()
  const openSheet = useUI((s) => s.openSheet)
  const showToast = useUI((s) => s.showToast)

  const [title, setTitle] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [priority, setPriority] = useState<Priority>('normal')
  const [areaId, setAreaId] = useState<string | undefined>()
  const [category, setCategory] = useState<CategoryId>('repair')
  const [dueToday, setDueToday] = useState(false)
  const [added, setAdded] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const canSave = title.trim().length > 0

  async function onPick(files: FileList | null) {
    if (!files) return
    const arr = Array.from(files).slice(0, 3)
    const urls = await Promise.all(arr.map((f) => fileToCompressedDataURL(f)))
    setPhotos((p) => [...p, ...urls].slice(0, 4))
  }

  function save(closeAfter: boolean) {
    if (!canSave) return
    addJob({
      title: title.trim(),
      category,
      priority,
      status: 'todo',
      areaId,
      dueDate: dueToday ? todayISO() : undefined,
      recurrence: { unit: 'none', every: 1 },
      checklist: [],
      photos,
    })
    haptic([10, 25, 10])
    setAdded((n) => n + 1)
    if (closeAfter) {
      showToast(added + 1 > 1 ? `${added + 1} jobs captured` : 'Job captured')
      onClose()
    } else {
      // reset for the next capture
      setTitle('')
      setPhotos([])
      setPriority('normal')
      setDueToday(false)
      showToast('Captured — add another')
      inputRef.current?.focus()
    }
  }

  return (
    <Sheet onClose={onClose} size="auto">
      <SheetHeader
        title="Quick capture"
        left={<GhostButton onClick={onClose}>Cancel</GhostButton>}
        right={
          <button
            onClick={() => {
              const id = openSheet
              // open full editor pre-filled would need draft; just open empty full editor
              id({ kind: 'job-edit', preset: { category, areaId } })
            }}
            className="pressable inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[14px] font-semibold text-ink-soft dark:text-canvas/70"
          >
            <SlidersHorizontal size={15} /> Details
          </button>
        }
      />

      <div className="overflow-y-auto no-scrollbar px-5 pb-[calc(var(--safe-bottom)+20px)] space-y-5 scroll-area">
        <div className="flex items-center gap-2 text-clay-600 dark:text-clay-300 pt-1">
          <Zap size={16} className="fill-current" />
          <span className="text-[13px] font-semibold">Spotted something? Jot it down fast.</span>
        </div>

        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save(true)}
          placeholder="e.g. Broken fence post by the dam"
          autoFocus
          className="w-full bg-transparent text-[20px] font-display font-semibold tracking-tight placeholder:text-ink-faint/50 outline-none text-ink dark:text-canvas"
        />

        {/* Photos */}
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
          {photos.length < 4 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="pressable h-20 w-20 rounded-2xl border-2 border-dashed border-black/15 dark:border-white/20 grid place-items-center text-ink-faint flex-col gap-1"
            >
              <Camera size={20} />
              <span className="text-[10px] font-semibold">Photo</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            hidden
            onChange={(e) => onPick(e.target.files)}
          />
        </div>

        {/* Category */}
        <div className="-mx-5 px-5 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 w-max">
            {CATEGORY_LIST.map((c) => (
              <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                <c.icon size={14} /> {c.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Priority + today */}
        <div className="flex items-center gap-2">
          {(['low', 'normal', 'high', 'urgent'] as Priority[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                haptic()
                setPriority(p)
              }}
              className={cn(
                'flex-1 py-2 rounded-xl text-[13px] font-semibold capitalize transition pressable border',
                priority === p
                  ? p === 'urgent'
                    ? 'bg-clay-500 text-white border-clay-500'
                    : p === 'high'
                      ? 'bg-wheat-400 text-wheat-900 border-wheat-400'
                      : 'bg-forest-800 text-canvas border-forest-800 dark:bg-forest-600 dark:border-forest-600'
                  : 'bg-canvas-subtle text-ink-faint border-black/[0.05] dark:bg-forest-950/50 dark:border-white/10',
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Area */}
        {areas.length > 0 && (
          <div className="-mx-5 px-5 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 w-max">
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

        <button
          onClick={() => {
            haptic()
            setDueToday((v) => !v)
          }}
          className="flex items-center gap-2.5 w-full"
        >
          <span
            className={cn(
              'h-6 w-6 rounded-lg grid place-items-center border-2 transition',
              dueToday ? 'bg-forest-600 border-forest-600 text-canvas' : 'border-ink/20 dark:border-white/25 text-transparent',
            )}
          >
            ✓
          </span>
          <span className="text-[15px] font-medium text-ink dark:text-canvas">Due today</span>
        </button>

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => save(false)}
            disabled={!canSave}
            className={cn(
              'pressable px-5 py-4 rounded-2xl font-semibold text-[15px] border',
              canSave
                ? 'border-forest-300 text-forest-700 dark:border-forest-500/40 dark:text-forest-300'
                : 'border-black/10 text-ink-faint/50',
            )}
          >
            Save & add
          </button>
          <div className="flex-1">
            <PrimaryButton onClick={() => save(true)} disabled={!canSave}>
              Capture
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Sheet>
  )
}
