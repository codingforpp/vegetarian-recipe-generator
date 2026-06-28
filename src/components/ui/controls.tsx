import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { haptic } from '../../lib/haptics'

/** Segmented control / pill toggle */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode }[]
}) {
  return (
    <div className="relative flex p-1 rounded-2xl bg-canvas-subtle dark:bg-forest-950/60 border border-black/[0.05] dark:border-white/10">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => {
              haptic()
              onChange(o.value)
            }}
            className="relative flex-1 py-2 text-[14px] font-semibold rounded-xl transition-colors"
          >
            {active && (
              <motion.div
                layoutId="segmented-active"
                className="absolute inset-0 bg-canvas-raised dark:bg-forest-700 rounded-xl shadow-soft"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              />
            )}
            <span
              className={cn(
                'relative z-10',
                active ? 'text-forest-800 dark:text-canvas' : 'text-ink-faint',
              )}
            >
              {o.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Selectable chip */
export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      onClick={() => {
        haptic()
        onClick?.()
      }}
      className={cn(
        'pressable inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13.5px] font-semibold whitespace-nowrap border transition-colors',
        active
          ? 'bg-forest-800 text-canvas border-forest-800 dark:bg-canvas dark:text-forest-900 dark:border-canvas'
          : 'bg-canvas-raised text-ink-soft border-black/[0.06] dark:bg-forest-900/60 dark:text-canvas/70 dark:border-white/10',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        haptic(10)
        onClick?.()
      }}
      className={cn(
        'pressable w-full py-4 rounded-2xl font-semibold text-[16px] tracking-tight',
        'bg-forest-800 text-canvas shadow-lift',
        'disabled:opacity-40 disabled:shadow-none',
        'dark:bg-forest-600',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function GhostButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={() => {
        haptic()
        onClick?.()
      }}
      className={cn(
        'pressable px-4 py-2.5 rounded-xl font-semibold text-[15px] text-ink-soft dark:text-canvas/70',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function IconButton({
  children,
  onClick,
  className,
  label,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  label?: string
}) {
  return (
    <button
      aria-label={label}
      onClick={() => {
        haptic()
        onClick?.()
      }}
      className={cn(
        'pressable grid place-items-center h-10 w-10 rounded-full',
        'bg-canvas-raised border border-black/[0.06] text-ink-soft shadow-soft',
        'dark:bg-forest-900/70 dark:border-white/10 dark:text-canvas/80',
        className,
      )}
    >
      {children}
    </button>
  )
}
