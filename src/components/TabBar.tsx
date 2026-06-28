import { Home, ListTodo, CalendarDays, Tractor, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUI, type Tab } from '../lib/ui'
import { cn } from '../lib/utils'
import { haptic } from '../lib/haptics'

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'jobs', label: 'Jobs', icon: ListTodo },
  { id: 'plan', label: 'Plan', icon: CalendarDays },
  { id: 'kit', label: 'Farm', icon: Tractor },
]

export function TabBar() {
  const tab = useUI((s) => s.tab)
  const setTab = useUI((s) => s.setTab)
  const openSheet = useUI((s) => s.openSheet)

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none">
      <div className="mx-auto max-w-lg px-4 pb-[calc(var(--safe-bottom)+10px)] pt-2">
        <div className="pointer-events-auto relative flex items-center justify-between glass rounded-[26px] shadow-lift border border-black/[0.06] dark:border-white/[0.08] px-2 h-[68px]">
          {tabs.slice(0, 2).map((t) => (
            <TabButton key={t.id} t={t} active={tab === t.id} onClick={() => setTab(t.id)} />
          ))}

          {/* Center capture button */}
          <button
            aria-label="Quick capture"
            onClick={() => {
              haptic([8, 20, 8])
              openSheet({ kind: 'quick' })
            }}
            className="pressable relative -mt-8 mx-1 h-16 w-16 shrink-0 rounded-full bg-clay-500 text-white grid place-items-center shadow-glow border-4 border-canvas dark:border-forest-950"
          >
            <Plus size={28} strokeWidth={2.6} />
          </button>

          {tabs.slice(2).map((t) => (
            <TabButton key={t.id} t={t} active={tab === t.id} onClick={() => setTab(t.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TabButton({
  t,
  active,
  onClick,
}: {
  t: { id: Tab; label: string; icon: typeof Home }
  active: boolean
  onClick: () => void
}) {
  const Icon = t.icon
  return (
    <button
      onClick={() => {
        haptic()
        onClick()
      }}
      className="relative flex-1 h-full flex flex-col items-center justify-center gap-1"
    >
      <span className="relative grid place-items-center h-8 w-12">
        {active && (
          <motion.span
            layoutId="tab-pill"
            className="absolute inset-0 rounded-full bg-forest-100 dark:bg-forest-500/20"
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
          />
        )}
        <Icon
          size={21}
          strokeWidth={active ? 2.5 : 2}
          className={cn(
            'relative z-10 transition-colors',
            active ? 'text-forest-700 dark:text-forest-300' : 'text-ink-faint',
          )}
        />
      </span>
      <span
        className={cn(
          'text-[10.5px] font-semibold transition-colors',
          active ? 'text-forest-700 dark:text-forest-300' : 'text-ink-faint',
        )}
      >
        {t.label}
      </span>
    </button>
  )
}
