import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Wrench, ChevronRight, MapPin } from 'lucide-react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import { Segmented } from '../components/ui/controls'
import { SectionHeader, EmptyState } from '../components/ui/misc'
import { serviceStatus, cn } from '../lib/utils'

export function Kit() {
  const [seg, setSeg] = useState<'equipment' | 'areas'>('equipment')

  return (
    <div className="px-4 pt-[calc(var(--safe-top)+12px)]">
      <header className="pt-2 mb-4 flex items-end justify-between">
        <h1 className="font-display text-[30px] font-semibold tracking-tight text-ink dark:text-canvas">
          The farm
        </h1>
      </header>

      <div className="mb-6">
        <Segmented
          value={seg}
          onChange={setSeg}
          options={[
            { value: 'equipment', label: 'Equipment' },
            { value: 'areas', label: 'Areas' },
          ]}
        />
      </div>

      {seg === 'equipment' ? <EquipmentList /> : <AreaList />}
    </div>
  )
}

function EquipmentList() {
  const equipment = useStore((s) => s.equipment)
  const jobs = useStore((s) => s.jobs)
  const openSheet = useUI((s) => s.openSheet)

  return (
    <>
      <SectionHeader
        title="Equipment"
        count={equipment.length}
        action={
          <button
            onClick={() => openSheet({ kind: 'equipment-edit' })}
            className="pressable inline-flex items-center gap-1 text-[14px] font-semibold text-forest-700 dark:text-forest-300"
          >
            <Plus size={16} /> Add
          </button>
        }
      />
      {equipment.length === 0 ? (
        <div className="card">
          <EmptyState
            emoji="🚜"
            title="No equipment yet"
            subtitle="Add machinery to track servicing and keep jobs linked to it."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {equipment.map((e, i) => {
            const svc = serviceStatus(e.lastServiced, e.serviceIntervalDays)
            const openJobs = jobs.filter((j) => j.equipmentId === e.id && j.status !== 'done').length
            return (
              <motion.button
                key={e.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openSheet({ kind: 'equipment-detail', equipmentId: e.id })}
                className="card pressable flex items-center gap-3.5 p-3.5 text-left"
              >
                <div className="shrink-0 h-14 w-14 rounded-2xl bg-canvas-subtle dark:bg-forest-950/50 grid place-items-center text-2xl border border-black/[0.04] dark:border-white/10">
                  {e.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[15.5px] tracking-tight text-ink dark:text-canvas truncate">
                    {e.name}
                  </p>
                  <p className="text-[12.5px] text-ink-faint">{e.type}</p>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    {svc ? (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-0.5 rounded-full',
                          svc.tone === 'overdue'
                            ? 'bg-clay-100 text-clay-700 dark:bg-clay-500/15 dark:text-clay-300'
                            : svc.tone === 'soon'
                              ? 'bg-wheat-100 text-wheat-800 dark:bg-wheat-500/15 dark:text-wheat-300'
                              : 'bg-forest-100 text-forest-700 dark:bg-forest-500/15 dark:text-forest-300',
                        )}
                      >
                        <Wrench size={11} /> Service {svc.label}
                      </span>
                    ) : (
                      <span className="text-[11.5px] text-ink-faint">No service schedule</span>
                    )}
                    {openJobs > 0 && (
                      <span className="text-[11.5px] text-ink-faint">{openJobs} open jobs</span>
                    )}
                  </div>
                </div>
                <ChevronRight size={18} className="text-ink-faint shrink-0" />
              </motion.button>
            )
          })}
        </div>
      )}
    </>
  )
}

function AreaList() {
  const areas = useStore((s) => s.areas)
  const jobs = useStore((s) => s.jobs)
  const openSheet = useUI((s) => s.openSheet)

  return (
    <>
      <SectionHeader
        title="Areas"
        count={areas.length}
        action={
          <button
            onClick={() => openSheet({ kind: 'area-edit' })}
            className="pressable inline-flex items-center gap-1 text-[14px] font-semibold text-forest-700 dark:text-forest-300"
          >
            <Plus size={16} /> Add
          </button>
        }
      />
      {areas.length === 0 ? (
        <div className="card">
          <EmptyState
            emoji="🗺️"
            title="No areas yet"
            subtitle="Map out the paddocks, sheds and gardens so every job has a place."
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {areas.map((a, i) => {
            const openJobs = jobs.filter((j) => j.areaId === a.id && j.status !== 'done').length
            return (
              <motion.button
                key={a.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openSheet({ kind: 'area-edit', areaId: a.id })}
                className="card pressable p-4 text-left flex flex-col aspect-[4/3] justify-between"
              >
                <div
                  className="h-11 w-11 rounded-2xl grid place-items-center text-xl"
                  style={{ backgroundColor: a.color + '22' }}
                >
                  {a.emoji}
                </div>
                <div>
                  <p className="font-semibold text-[15px] tracking-tight text-ink dark:text-canvas truncate">
                    {a.name}
                  </p>
                  <p className="text-[12px] text-ink-faint inline-flex items-center gap-1 mt-0.5">
                    <MapPin size={11} />
                    {openJobs} {openJobs === 1 ? 'job' : 'jobs'}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </div>
      )}
    </>
  )
}
