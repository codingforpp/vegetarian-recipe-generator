import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X, Check } from 'lucide-react'
import { useStore } from '../lib/store'
import { JobCard } from '../components/JobCard'
import { Chip } from '../components/ui/controls'
import { SectionHeader, EmptyState } from '../components/ui/misc'
import { CATEGORY_LIST, PRIORITIES } from '../lib/categories'
import type { CategoryId, Job } from '../lib/types'
import { cn, isOverdue } from '../lib/utils'

type SortKey = 'smart' | 'due' | 'priority' | 'created'
type StatusFilter = 'open' | 'done' | 'all'

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'smart', label: 'Smart' },
  { key: 'due', label: 'Due date' },
  { key: 'priority', label: 'Priority' },
  { key: 'created', label: 'Newest' },
]

export function Jobs() {
  const jobs = useStore((s) => s.jobs)
  const areas = useStore((s) => s.areas)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('open')
  const [cats, setCats] = useState<CategoryId[]>([])
  const [areaId, setAreaId] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('smart')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let list = jobs.slice()

    if (status === 'open') list = list.filter((j) => j.status !== 'done')
    else if (status === 'done') list = list.filter((j) => j.status === 'done')

    if (cats.length) list = list.filter((j) => cats.includes(j.category))
    if (areaId) list = list.filter((j) => j.areaId === areaId)

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.notes?.toLowerCase().includes(q),
      )
    }

    list.sort((a, b) => {
      switch (sort) {
        case 'due':
          return dueSort(a, b)
        case 'priority':
          return PRIORITIES[b.priority].rank - PRIORITIES[a.priority].rank || dueSort(a, b)
        case 'created':
          return a.createdAt < b.createdAt ? 1 : -1
        default:
          return smartSort(a, b)
      }
    })
    return list
  }, [jobs, status, cats, areaId, query, sort])

  const activeFilters = cats.length + (areaId ? 1 : 0)

  function toggleCat(id: CategoryId) {
    setCats((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  }

  return (
    <div className="px-4 pt-[calc(var(--safe-top)+12px)]">
      <header className="pt-2 mb-4">
        <h1 className="font-display text-[30px] font-semibold tracking-tight text-ink dark:text-canvas">
          All jobs
        </h1>
      </header>

      {/* Search + filter button */}
      <div className="flex gap-2.5 mb-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs…"
            className="field pl-11 pr-9 py-3"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            'pressable relative grid place-items-center h-[50px] w-[50px] rounded-2xl border shrink-0',
            showFilters || activeFilters
              ? 'bg-forest-800 text-canvas border-forest-800 dark:bg-forest-600 dark:border-forest-600'
              : 'bg-canvas-raised border-black/[0.06] text-ink-soft dark:bg-forest-900/60 dark:border-white/10 dark:text-canvas/70',
          )}
        >
          <SlidersHorizontal size={19} />
          {activeFilters > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 grid place-items-center rounded-full bg-clay-500 text-white text-[11px] font-bold">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Status segmented as scroll chips */}
      <div className="flex gap-2 mb-3">
        {(['open', 'done', 'all'] as StatusFilter[]).map((s) => (
          <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
            {s === 'open' ? 'Open' : s === 'done' ? 'Done' : 'All'}
          </Chip>
        ))}
      </div>

      {/* Expandable filters */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="overflow-hidden"
          >
            <div className="card p-4 mb-3 space-y-4">
              <div>
                <p className="label">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_LIST.map((c) => (
                    <Chip key={c.id} active={cats.includes(c.id)} onClick={() => toggleCat(c.id)}>
                      <c.icon size={13} /> {c.label}
                    </Chip>
                  ))}
                </div>
              </div>
              {areas.length > 0 && (
                <div>
                  <p className="label">Area</p>
                  <div className="flex flex-wrap gap-2">
                    {areas.map((a) => (
                      <Chip
                        key={a.id}
                        active={areaId === a.id}
                        onClick={() => setAreaId((cur) => (cur === a.id ? null : a.id))}
                      >
                        <span>{a.emoji}</span> {a.name}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="label">Sort by</p>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((o) => (
                    <Chip key={o.key} active={sort === o.key} onClick={() => setSort(o.key)}>
                      {sort === o.key && <Check size={13} />} {o.label}
                    </Chip>
                  ))}
                </div>
              </div>
              {activeFilters > 0 && (
                <button
                  onClick={() => {
                    setCats([])
                    setAreaId(null)
                  }}
                  className="text-[14px] font-semibold text-clay-600"
                >
                  Clear filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <SectionHeader title={status === 'done' ? 'Completed' : 'Jobs'} count={filtered.length} />
      {filtered.length > 0 ? (
        <motion.div layout className="flex flex-col gap-2.5 pb-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((j, i) => (
              <JobCard key={j.id} job={j} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="card">
          <EmptyState
            emoji={query || activeFilters ? '🔍' : '🌾'}
            title={query || activeFilters ? 'No matching jobs' : 'No jobs yet'}
            subtitle={
              query || activeFilters
                ? 'Try clearing your search or filters.'
                : 'Tap the + button to log your first farm job.'
            }
          />
        </div>
      )}
    </div>
  )
}

function dueSort(a: Job, b: Job) {
  if (!a.dueDate && !b.dueDate) return 0
  if (!a.dueDate) return 1
  if (!b.dueDate) return -1
  return a.dueDate < b.dueDate ? -1 : 1
}

function smartSort(a: Job, b: Job) {
  // overdue first, then by priority, then by due date
  const ao = isOverdue(a) ? 1 : 0
  const bo = isOverdue(b) ? 1 : 0
  if (ao !== bo) return bo - ao
  const pr = PRIORITIES[b.priority].rank - PRIORITIES[a.priority].rank
  if (pr !== 0) return pr
  return dueSort(a, b)
}
