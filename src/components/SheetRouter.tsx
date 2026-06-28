import { AnimatePresence } from 'framer-motion'
import { useUI } from '../lib/ui'
import { JobSheet } from './sheets/JobSheet'
import { JobDetail } from './sheets/JobDetail'
import { QuickCapture } from './sheets/QuickCapture'
import { EquipmentSheet } from './sheets/EquipmentSheet'
import { EquipmentDetail } from './sheets/EquipmentDetail'
import { AreaSheet } from './sheets/AreaSheet'
import { SettingsSheet } from './sheets/SettingsSheet'

export function SheetRouter() {
  const sheets = useUI((s) => s.sheets)
  const closeSheet = useUI((s) => s.closeSheet)

  return (
    <AnimatePresence>
      {sheets.map((sheet, i) => {
        const key = `${sheet.kind}-${i}`
        const onClose = () => closeSheet()
        switch (sheet.kind) {
          case 'job-edit':
            return <JobSheet key={key} jobId={sheet.jobId} preset={sheet.preset} onClose={onClose} />
          case 'job-detail':
            return <JobDetail key={key} jobId={sheet.jobId} onClose={onClose} />
          case 'quick':
            return <QuickCapture key={key} onClose={onClose} />
          case 'equipment-edit':
            return <EquipmentSheet key={key} equipmentId={sheet.equipmentId} onClose={onClose} />
          case 'equipment-detail':
            return <EquipmentDetail key={key} equipmentId={sheet.equipmentId} onClose={onClose} />
          case 'area-edit':
            return <AreaSheet key={key} areaId={sheet.areaId} onClose={onClose} />
          case 'settings':
            return <SettingsSheet key={key} onClose={onClose} />
          default:
            return null
        }
      })}
    </AnimatePresence>
  )
}
