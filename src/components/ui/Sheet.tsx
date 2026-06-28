import { type ReactNode, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface SheetProps {
  children: ReactNode
  onClose: () => void
  /** full = nearly full-height detail/edit; auto = sized to content */
  size?: 'full' | 'auto'
  className?: string
}

export function Sheet({ children, onClose, size = 'full', className }: SheetProps) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <motion.div
        className="absolute inset-0 bg-forest-950/40 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />
      <motion.div
        className={cn(
          'relative w-full mx-auto max-w-lg glass rounded-t-[28px] shadow-sheet',
          'border-t border-x border-black/[0.06] dark:border-white/[0.08]',
          size === 'full' ? 'h-[92vh]' : 'max-h-[88vh]',
          'flex flex-col overflow-hidden',
          className,
        )}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 38, stiffness: 380 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 700) onClose()
        }}
      >
        <div className="shrink-0 pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
          <div className="h-1.5 w-10 rounded-full bg-ink/15 dark:bg-white/20" />
        </div>
        {children}
      </motion.div>
    </div>
  )
}

interface SheetHeaderProps {
  title?: string
  left?: ReactNode
  right?: ReactNode
}

export function SheetHeader({ title, left, right }: SheetHeaderProps) {
  return (
    <div className="shrink-0 flex items-center justify-between px-5 h-12">
      <div className="min-w-[64px] flex justify-start">{left}</div>
      {title && (
        <h2 className="font-display text-[19px] font-semibold tracking-tight truncate px-2">
          {title}
        </h2>
      )}
      <div className="min-w-[64px] flex justify-end">{right}</div>
    </div>
  )
}
