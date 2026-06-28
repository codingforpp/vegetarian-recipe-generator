import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Sheet, SheetHeader } from '../ui/Sheet'
import { GhostButton, PrimaryButton } from '../ui/controls'
import { useStore } from '../../lib/store'
import { useUI } from '../../lib/ui'
import { cn } from '../../lib/utils'
import { haptic } from '../../lib/haptics'

const EMOJIS = ['🌾', '🍎', '🥬', '🏡', '🛖', '💧', '🌳', '🐔', '🐑', '🐄', '🚜', '🌻', '🍇', '🌲', '🪵', '⛰️']
const COLORS = ['#c25a36', '#cf8c22', '#436343', '#345034', '#0ea5e9', '#b06e1c', '#7c3aed', '#be185d']

export function AreaSheet({ areaId, onClose }: { areaId?: string; onClose: () => void }) {
  const { areas, addArea, updateArea, deleteArea } = useStore()
  const showToast = useUI((s) => s.showToast)
  const existing = areaId ? areas.find((a) => a.id === areaId) : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [emoji, setEmoji] = useState(existing?.emoji ?? '🌾')
  const [color, setColor] = useState(existing?.color ?? COLORS[0])
  const [notes, setNotes] = useState(existing?.notes ?? '')

  const canSave = name.trim().length > 0

  function save() {
    if (!canSave) return
    const payload = { name: name.trim(), emoji, color, notes: notes.trim() || undefined }
    if (existing) {
      updateArea(existing.id, payload)
      showToast('Area updated')
    } else {
      addArea(payload)
      showToast('Area added')
    }
    haptic([10, 20, 10])
    onClose()
  }

  return (
    <Sheet onClose={onClose} size="auto">
      <SheetHeader
        title={existing ? 'Edit area' : 'New area'}
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
      <div className="overflow-y-auto no-scrollbar px-5 pb-[calc(var(--safe-bottom)+24px)] space-y-6 scroll-area">
        <div className="flex items-center gap-3 pt-2">
          <div
            className="h-16 w-16 shrink-0 rounded-2xl grid place-items-center text-3xl"
            style={{ backgroundColor: color + '22' }}
          >
            {emoji}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Area name"
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
                  emoji === e ? 'ring-2 ring-forest-500' : '',
                )}
                style={{ backgroundColor: emoji === e ? color + '22' : undefined }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label">Colour</p>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  haptic()
                  setColor(c)
                }}
                className={cn(
                  'h-9 w-9 rounded-full transition pressable',
                  color === c ? 'ring-2 ring-offset-2 ring-offset-canvas dark:ring-offset-forest-900 ring-ink/40' : '',
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="label">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Gate codes, access notes…"
            rows={2}
            className="field resize-none"
          />
        </div>

        {existing && (
          <button
            onClick={() => {
              deleteArea(existing.id)
              showToast('Area deleted')
              onClose()
            }}
            className="pressable w-full py-3.5 rounded-2xl text-clay-600 font-semibold inline-flex items-center justify-center gap-2 border border-clay-200 dark:border-clay-500/30"
          >
            <Trash2 size={17} /> Delete area
          </button>
        )}

        <PrimaryButton onClick={save} disabled={!canSave}>
          {existing ? 'Save changes' : 'Add area'}
        </PrimaryButton>
      </div>
    </Sheet>
  )
}
