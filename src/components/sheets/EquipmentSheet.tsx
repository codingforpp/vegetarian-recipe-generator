import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Sheet, SheetHeader } from '../ui/Sheet'
import { GhostButton, PrimaryButton, Chip } from '../ui/controls'
import { useStore } from '../../lib/store'
import { useUI } from '../../lib/ui'
import { cn, todayISO } from '../../lib/utils'
import { haptic } from '../../lib/haptics'

const EMOJIS = ['🚜', '🌱', '🪚', '⚙️', '🛻', '🔧', '🪛', '🔌', '⛽', '🧰', '🚿', '🪜', '🔋', '🛞']
const INTERVALS = [
  { label: 'Monthly', days: 30 },
  { label: '3 months', days: 90 },
  { label: '6 months', days: 180 },
  { label: 'Yearly', days: 365 },
]

export function EquipmentSheet({ equipmentId, onClose }: { equipmentId?: string; onClose: () => void }) {
  const { equipment, addEquipment, updateEquipment, deleteEquipment } = useStore()
  const showToast = useUI((s) => s.showToast)
  const existing = equipmentId ? equipment.find((e) => e.id === equipmentId) : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [type, setType] = useState(existing?.type ?? '')
  const [emoji, setEmoji] = useState(existing?.emoji ?? '🚜')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [lastServiced, setLastServiced] = useState(existing?.lastServiced ?? '')
  const [interval, setInterval] = useState<number | undefined>(existing?.serviceIntervalDays)
  const [hours, setHours] = useState(existing?.hours?.toString() ?? '')

  const canSave = name.trim().length > 0

  function save() {
    if (!canSave) return
    const payload = {
      name: name.trim(),
      type: type.trim() || 'Equipment',
      emoji,
      notes: notes.trim() || undefined,
      lastServiced: lastServiced || undefined,
      serviceIntervalDays: interval,
      hours: hours ? parseFloat(hours) : undefined,
    }
    if (existing) {
      updateEquipment(existing.id, payload)
      showToast('Equipment updated')
    } else {
      addEquipment(payload)
      showToast('Equipment added')
    }
    haptic([10, 20, 10])
    onClose()
  }

  return (
    <Sheet onClose={onClose}>
      <SheetHeader
        title={existing ? 'Edit equipment' : 'New equipment'}
        left={<GhostButton onClick={onClose}>Cancel</GhostButton>}
        right={
          <button
            onClick={save}
            disabled={!canSave}
            className={cn('px-4 py-2 font-semibold text-[15px]', canSave ? 'text-forest-700 dark:text-forest-300' : 'text-ink-faint/50')}
          >
            Save
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-[calc(var(--safe-bottom)+24px)] space-y-6 scroll-area">
        {/* Emoji + name */}
        <div className="flex items-center gap-3 pt-2">
          <div className="h-16 w-16 shrink-0 rounded-2xl bg-canvas-subtle dark:bg-forest-950/50 grid place-items-center text-3xl border border-black/[0.05] dark:border-white/10">
            {emoji}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Equipment name"
            autoFocus={!existing}
            className="flex-1 bg-transparent text-[21px] font-display font-semibold tracking-tight placeholder:text-ink-faint/50 outline-none text-ink dark:text-canvas"
          />
        </div>

        <div>
          <p className="label">Icon</p>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => {
                  haptic()
                  setEmoji(e)
                }}
                className={cn(
                  'h-11 w-11 rounded-xl grid place-items-center text-xl transition pressable',
                  emoji === e
                    ? 'bg-forest-100 ring-2 ring-forest-500 dark:bg-forest-500/20'
                    : 'bg-canvas-subtle dark:bg-forest-950/50',
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label">Type</p>
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Tractor, mower, pump…"
            className="field"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="label">Last serviced</p>
            <input
              type="date"
              value={lastServiced}
              onChange={(e) => setLastServiced(e.target.value)}
              className="field"
            />
          </div>
          <div>
            <p className="label">Hours used</p>
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value.replace(/[^\d.]/g, ''))}
              inputMode="decimal"
              placeholder="0"
              className="field"
            />
          </div>
        </div>

        <div>
          <p className="label">Service interval</p>
          <div className="flex flex-wrap gap-2">
            {INTERVALS.map((iv) => (
              <Chip
                key={iv.days}
                active={interval === iv.days}
                onClick={() => setInterval((cur) => (cur === iv.days ? undefined : iv.days))}
              >
                {iv.label}
              </Chip>
            ))}
          </div>
          {!lastServiced && interval && (
            <button
              onClick={() => setLastServiced(todayISO())}
              className="mt-2 text-[13px] font-semibold text-forest-700 dark:text-forest-300"
            >
              Set last serviced to today
            </button>
          )}
        </div>

        <div>
          <p className="label">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Fuel type, spare parts, quirks…"
            rows={3}
            className="field resize-none"
          />
        </div>

        {existing && (
          <button
            onClick={() => {
              deleteEquipment(existing.id)
              showToast('Equipment deleted')
              onClose()
            }}
            className="pressable w-full py-3.5 rounded-2xl text-clay-600 font-semibold inline-flex items-center justify-center gap-2 border border-clay-200 dark:border-clay-500/30"
          >
            <Trash2 size={17} /> Delete equipment
          </button>
        )}

        <PrimaryButton onClick={save} disabled={!canSave}>
          {existing ? 'Save changes' : 'Add equipment'}
        </PrimaryButton>
      </div>
    </Sheet>
  )
}
