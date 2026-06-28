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
  /** Request closing the top sheet — routes through browser history so the
   *  hardware / edge-swipe Back button stays in sync. */
  closeSheet: () => void
  closeAll: () => void
  /** Reconcile the open-sheet stack to a given depth. Called by the global
   *  popstate handler so Back pops sheets instead of leaving the app. */
  syncSheets: (depth: number) => void
  toast: { id: number; message: string; action?: { label: string; run: () => void } } | null
  showToast: (message: string, action?: { label: string; run: () => void }) => void
  dismissToast: () => void
}

const isBrowser = typeof window !== 'undefined'
let toastId = 0

export const useUI = create<UIState>((set, get) => ({
  tab: 'today',
  setTab: (t) => set({ tab: t }),
  sheets: [],

  openSheet: (s) =>
    set((st) => {
      const sheets = [...st.sheets, s]
      // Each open sheet is one history entry, so Back closes one at a time.
      if (isBrowser) window.history.pushState({ acreDepth: sheets.length }, '')
      return { sheets }
    }),

  closeSheet: () => {
    if (get().sheets.length === 0) return
    if (isBrowser) {
      // Step back in history; the popstate handler reconciles the stack.
      window.history.back()
    } else {
      set((st) => ({ sheets: st.sheets.slice(0, -1) }))
    }
  },

  closeAll: () => {
    const n = get().sheets.length
    if (n === 0) return
    if (isBrowser) window.history.go(-n)
    else set({ sheets: [] })
  },

  syncSheets: (depth) =>
    set((st) => (depth >= st.sheets.length ? st : { sheets: st.sheets.slice(0, depth) })),

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
