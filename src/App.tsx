import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from './lib/ui'
import { useTheme } from './lib/useTheme'
import { Today } from './screens/Today'
import { Jobs } from './screens/Jobs'
import { Plan } from './screens/Plan'
import { Kit } from './screens/Kit'
import { TabBar } from './components/TabBar'
import { Toast } from './components/Toast'
import { SheetRouter } from './components/SheetRouter'

const screens = {
  today: Today,
  jobs: Jobs,
  plan: Plan,
  kit: Kit,
}

export default function App() {
  useTheme()
  const tab = useUI((s) => s.tab)
  const Screen = screens[tab]

  return (
    <div className="min-h-full">
      <main className="mx-auto max-w-lg pb-[120px] min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
      </main>

      <TabBar />
      <Toast />
      <SheetRouter />
    </div>
  )
}
