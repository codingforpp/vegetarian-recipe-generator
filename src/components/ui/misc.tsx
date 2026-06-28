import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function SectionHeader({
  title,
  count,
  action,
  className,
}: {
  title: string
  count?: number
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between mb-2.5 px-1', className)}>
      <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-ink-faint">
        {title}
        {count !== undefined && <span className="ml-2 text-ink-faint/70">{count}</span>}
      </h3>
      {action}
    </div>
  )
}

export function EmptyState({
  emoji,
  title,
  subtitle,
  action,
}: {
  emoji: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-8">
      <div className="text-5xl mb-4 grayscale-[0.2]">{emoji}</div>
      <p className="font-display text-lg font-semibold text-ink dark:text-canvas">{title}</p>
      {subtitle && <p className="mt-1.5 text-[14px] text-ink-faint max-w-[260px]">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ProgressRing({
  value,
  size = 56,
  stroke = 5,
}: {
  value: number // 0..1
  size?: number
  stroke?: number
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, value))
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        className="stroke-black/10 dark:stroke-white/15"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        className="stroke-forest-500 transition-[stroke-dashoffset] duration-700 ease-spring"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - clamped)}
      />
    </svg>
  )
}
