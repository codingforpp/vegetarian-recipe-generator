import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from '../lib/ui'
import { haptic } from '../lib/haptics'

export function Toast() {
  const toast = useUI((s) => s.toast)
  const dismiss = useUI((s) => s.dismissToast)

  return (
    <div className="fixed inset-x-0 bottom-[calc(var(--safe-bottom)+96px)] z-40 flex justify-center px-4 pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-forest-900 dark:bg-forest-700 text-canvas pl-4 pr-2 py-2.5 shadow-lift max-w-sm"
          >
            <span className="text-[14.5px] font-medium">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  haptic()
                  toast.action!.run()
                  dismiss()
                }}
                className="pressable text-[14px] font-bold text-clay-300 px-3 py-1.5 rounded-xl bg-white/10"
              >
                {toast.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
