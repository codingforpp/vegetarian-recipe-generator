import { motion } from 'framer-motion'
import { AlertTriangle, Sun, CalendarRange, Sparkles, Settings2 } from 'lucide-react'
import { useStore } from '../lib/store'
import { useUI } from '../lib/ui'
import {
  greeting,
  isDueToday,
  isDueThisWeek,
  isOverdue,
  cn,
} from '../lib/utils'
import { format } from 'date-fns'
import { JobCard } from '../components/JobCard'
import { SectionHeader, EmptyState, ProgressRing } from '../components/ui/misc'

export function Today() {
  const jobs = useStore((s) => s.jobs)
  const farmName = useStore((s) => s.settings.farmName)
  const openSheet = useUI((s) => s.openSheet)

  const open = jobs.filter((j) => j.status !== 'done')
  const overdue = open.filter(isOverdue).sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
  const dueToday = open.filter(isDueToday)
  const thisWeek = open
    .filter((j) => isDueThisWeek(j) && !isDueToday(j))
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))

  // urgent items not already in overdue/today
  const urgent = open.filter(
    (j) => j.priority === 'urgent' && !isOverdue(j) && !isDueToday(j),
  )

  const completedToday = jobs.filter(
    (j) => j.completedAt && format(new Date(j.completedAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
  ).length
  const todayTotal = dueToday.length + overdue.length + completedToday
  const progress = todayTotal === 0 ? 1 : completedToday / todayTotal

  const stats = [
    { id: 'overdue', label: 'Overdue', value: overdue.length, icon: AlertTriangle, accent: 'text-clay-600', bg: 'bg-clay-100 dark:bg-clay-500/15' },
    { id: 'today', label: 'Today', value: dueToday.length, icon: Sun, accent: 'text-wheat-700 dark:text-wheat-300', bg: 'bg-wheat-100 dark:bg-wheat-500/15' },
    { id: 'week', label: 'This week', value: thisWeek.length, icon: CalendarRange, accent: 'text-forest-600 dark:text-forest-300', bg: 'bg-forest-100 dark:bg-forest-500/15' },
  ]

  return (
    <div className="px-4 pt-[calc(var(--safe-top)+12px)]">
      {/* Header */}
      <header className="flex items-start justify-between mb-5 pt-2">
        <div>
          <p className="text-[14px] text-ink-faint font-medium">
            {greeting()} · {format(new Date(), 'EEEE d MMM')}
          </p>
          <h1 className="font-display text-[30px] leading-[1.05] font-semibold tracking-tight text-ink dark:text-canvas mt-0.5">
            {farmName}
          </h1>
        </div>
        <button
          onClick={() => openSheet({ kind: 'settings' })}
          aria-label="Settings"
          className="pressable mt-1 grid place-items-center h-11 w-11 rounded-full bg-canvas-raised border border-black/[0.06] shadow-soft dark:bg-forest-900/70 dark:border-white/10"
        >
          <Settings2 size={19} className="text-ink-soft dark:text-canvas/70" />
        </button>
      </header>

      {/* Progress hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-4xl p-5 mb-4 bg-forest-900 text-canvas shadow-lift"
      >
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-forest-700/50 blur-2xl" />
        <div className="absolute right-10 bottom-0 h-24 w-24 rounded-full bg-clay-500/20 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="relative grid place-items-center">
            <ProgressRing value={progress} size={64} stroke={6} />
            <span className="absolute text-[15px] font-bold">{Math.round(progress * 100)}%</span>
          </div>
          <div className="flex-1">
            <p className="font-display text-[19px] font-semibold leading-tight">
              {todayTotal === 0
                ? 'Nothing due today'
                : progress >= 1
                  ? "Today's all done"
                  : `${completedToday} of ${todayTotal} done today`}
            </p>
            <p className="text-[13.5px] text-canvas/65 mt-0.5">
              {overdue.length > 0
                ? `${overdue.length} overdue · let's catch up`
                : dueToday.length > 0
                  ? 'A steady day on the farm'
                  : 'Take a walk, log what you spot'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        {stats.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            onClick={() => useUI.getState().setTab('jobs')}
            className="card pressable p-3.5 flex flex-col items-start"
          >
            <span className={cn('grid place-items-center h-9 w-9 rounded-xl mb-2.5', s.bg)}>
              <s.icon size={17} className={s.accent} strokeWidth={2.3} />
            </span>
            <span className="text-[26px] font-bold leading-none font-display text-ink dark:text-canvas">
              {s.value}
            </span>
            <span className="text-[12.5px] text-ink-faint mt-1 font-medium">{s.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Needs attention */}
      {(overdue.length > 0 || urgent.length > 0) && (
        <section className="mb-7">
          <SectionHeader title="Needs attention" count={overdue.length + urgent.length} />
          <div className="flex flex-col gap-2.5">
            {[...overdue, ...urgent].map((j, i) => (
              <JobCard key={j.id} job={j} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Due today */}
      <section className="mb-7">
        <SectionHeader title="Due today" count={dueToday.length} />
        {dueToday.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {dueToday.map((j, i) => (
              <JobCard key={j.id} job={j} index={i} />
            ))}
          </div>
        ) : (
          <div className="card">
            <EmptyState
              emoji="🌿"
              title="No jobs due today"
              subtitle="Spotted something on your walk? Tap the + to log it before you forget."
            />
          </div>
        )}
      </section>

      {/* This week */}
      {thisWeek.length > 0 && (
        <section className="mb-7">
          <SectionHeader title="Coming this week" count={thisWeek.length} />
          <div className="flex flex-col gap-2.5">
            {thisWeek.map((j, i) => (
              <JobCard key={j.id} job={j} index={i} />
            ))}
          </div>
        </section>
      )}

      {open.length === 0 && (
        <div className="card mt-2">
          <EmptyState
            emoji="🌻"
            title="The farm's all caught up"
            subtitle="Every job is done. Enjoy the quiet — or plan ahead for the season."
            action={
              <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-forest-700 dark:text-forest-300">
                <Sparkles size={15} /> You're on top of it
              </span>
            }
          />
        </div>
      )}
    </div>
  )
}
