import { useState } from 'react'
import { Sun, Moon, Smartphone, Trash2, RotateCcw, Sprout } from 'lucide-react'
import { Sheet, SheetHeader } from '../ui/Sheet'
import { GhostButton } from '../ui/controls'
import { Segmented } from '../ui/controls'
import { useStore } from '../../lib/store'
import { useUI } from '../../lib/ui'
import { cn } from '../../lib/utils'
import { haptic } from '../../lib/haptics'

export function SettingsSheet({ onClose }: { onClose: () => void }) {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const jobs = useStore((s) => s.jobs)
  const equipment = useStore((s) => s.equipment)
  const areas = useStore((s) => s.areas)
  const resetSampleData = useStore((s) => s.resetSampleData)
  const clearAll = useStore((s) => s.clearAll)
  const showToast = useUI((s) => s.showToast)
  const [farmName, setFarmName] = useState(settings.farmName)
  const [confirmClear, setConfirmClear] = useState(false)

  const done = jobs.filter((j) => j.status === 'done').length
  const open = jobs.length - done

  return (
    <Sheet onClose={onClose} size="auto">
      <SheetHeader title="Settings" left={<GhostButton onClick={onClose}>Done</GhostButton>} />
      <div className="overflow-y-auto no-scrollbar px-5 pb-[calc(var(--safe-bottom)+24px)] space-y-7 scroll-area pt-2">
        {/* Farm name */}
        <div>
          <p className="label">Farm name</p>
          <input
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            onBlur={() => updateSettings({ farmName: farmName.trim() || 'My Farm' })}
            className="field"
          />
        </div>

        {/* Theme */}
        <div>
          <p className="label">Appearance</p>
          <Segmented
            value={settings.theme}
            onChange={(v) => updateSettings({ theme: v })}
            options={[
              { value: 'light', label: <span className="inline-flex items-center gap-1.5"><Sun size={15} /> Light</span> },
              { value: 'system', label: <span className="inline-flex items-center gap-1.5"><Smartphone size={15} /> Auto</span> },
              { value: 'dark', label: <span className="inline-flex items-center gap-1.5"><Moon size={15} /> Dark</span> },
            ]}
          />
        </div>

        {/* Stats */}
        <div>
          <p className="label">Your farm at a glance</p>
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { v: open, l: 'Open' },
              { v: done, l: 'Done' },
              { v: equipment.length, l: 'Kit' },
              { v: areas.length, l: 'Areas' },
            ].map((s) => (
              <div key={s.l} className="card p-3 text-center">
                <p className="font-display text-[22px] font-bold text-ink dark:text-canvas leading-none">
                  {s.v}
                </p>
                <p className="text-[11.5px] text-ink-faint mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data */}
        <div>
          <p className="label">Data</p>
          <div className="card divide-y divide-black/[0.05] dark:divide-white/[0.06] overflow-hidden">
            <button
              onClick={() => {
                haptic()
                resetSampleData()
                showToast('Sample data restored')
                onClose()
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-black/[0.03]"
            >
              <RotateCcw size={18} className="text-ink-soft" />
              <div className="flex-1">
                <p className="text-[15px] font-medium text-ink dark:text-canvas">Restore sample data</p>
                <p className="text-[12.5px] text-ink-faint">Reset to the demo farm</p>
              </div>
            </button>
            <button
              onClick={() => {
                if (!confirmClear) {
                  setConfirmClear(true)
                  return
                }
                haptic([10, 40, 10])
                clearAll()
                showToast('All data cleared')
                onClose()
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-clay-50',
                confirmClear && 'bg-clay-50 dark:bg-clay-500/10',
              )}
            >
              <Trash2 size={18} className="text-clay-600" />
              <div className="flex-1">
                <p className="text-[15px] font-medium text-clay-600">
                  {confirmClear ? 'Tap again to confirm' : 'Clear everything'}
                </p>
                <p className="text-[12.5px] text-ink-faint">Delete all jobs, kit & areas</p>
              </div>
            </button>
          </div>
          <p className="text-[12px] text-ink-faint mt-2 px-1">
            Everything is stored privately on this device.
          </p>
        </div>

        {/* About */}
        <div className="flex flex-col items-center text-center pt-2 pb-1">
          <div className="h-12 w-12 rounded-2xl bg-forest-800 grid place-items-center text-canvas mb-2">
            <Sprout size={24} />
          </div>
          <p className="font-display text-[17px] font-semibold text-ink dark:text-canvas">Acre</p>
          <p className="text-[12.5px] text-ink-faint">Farm jobs, beautifully kept · v1.0</p>
        </div>
      </div>
    </Sheet>
  )
}
