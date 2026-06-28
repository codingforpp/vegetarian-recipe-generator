import { create } from 'zustand'

export type Tab = 'today' | 'jobs' | 'plan' | 'kit'

export type Sheet =
  | { kind: 'job-edit'; jobId?: string; preset?: Record<string, unknown> }
  | { kind: 'job-detail'; jobId: string }
  | { kind: 'quick' }
  | { kind: 'area-edit'; areaId?: string }
  | { kind: 'equipment-edit'; equipmentId?: string }
  | { kind: 'equipment-detail'; equipmentId: string }
  | { kind: 'areas' }
  | { kind: 'settings' }

interface UIState {
  tab: Tab
  setTab: (t: Tab) => void
  sheets: Sheet[]
  openSheet: (s: Sheet) => void
  closeSheet: () => void
  closeAll: () => void
  toast: { id: number; message: string; action?: { label: string; run: () => void } } | null
  showToast: (message: string, action?: { label: string; run: () => void }) => void
  dismissToast: () => void
}

let toastId = 0

export const useUI = create<UIState>((set) => ({
  tab: 'today',
  setTab: (t) => set({ tab: t }),
  sheets: [],
  openSheet: (s) => set((st) => ({ sheets: [...st.sheets, s] })),
  closeSheet: () => set((st) => ({ sheets: st.sheets.slice(0, -1) })),
  closeAll: () => set({ sheets: [] }),
  toast: null,
  showToast: (message, action) => {
    const id = ++toastId
    set({ toast: { id, message, action } })
    setTimeout(() => {
      set((st) => (st.toast?.id === id ? { toast: null } : st))
    }, 3200)
  },
  dismissToast: () => set({ toast: null }),
}))
