import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Area, Equipment, Job, Settings } from './types'
import { seedAreas, seedEquipment, seedJobs } from './seed'
import { nowISO, nextRecurrence, todayISO, uid } from './utils'

interface State {
  jobs: Job[]
  areas: Area[]
  equipment: Equipment[]
  settings: Settings
  hydrated: boolean

  // jobs
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateJob: (id: string, patch: Partial<Job>) => void
  deleteJob: (id: string) => void
  toggleDone: (id: string) => void
  setStatus: (id: string, status: Job['status']) => void
  toggleChecklistItem: (jobId: string, itemId: string) => void

  // areas
  addArea: (area: Omit<Area, 'id' | 'createdAt'>) => string
  updateArea: (id: string, patch: Partial<Area>) => void
  deleteArea: (id: string) => void

  // equipment
  addEquipment: (e: Omit<Equipment, 'id' | 'createdAt'>) => string
  updateEquipment: (id: string, patch: Partial<Equipment>) => void
  deleteEquipment: (id: string) => void
  logService: (id: string) => void

  // settings
  updateSettings: (patch: Partial<Settings>) => void
  resetSampleData: () => void
  clearAll: () => void
}

const defaultSettings: Settings = {
  theme: 'system',
  farmName: 'Willowbrook',
  reduceMotion: false,
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      jobs: seedJobs,
      areas: seedAreas,
      equipment: seedEquipment,
      settings: defaultSettings,
      hydrated: false,

      addJob: (job) => {
        const id = uid()
        const now = nowISO()
        set((s) => ({ jobs: [{ ...job, id, createdAt: now, updatedAt: now }, ...s.jobs] }))
        return id
      },

      updateJob: (id, patch) =>
        set((s) => ({
          jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch, updatedAt: nowISO() } : j)),
        })),

      deleteJob: (id) => set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })),

      toggleDone: (id) => {
        const job = get().jobs.find((j) => j.id === id)
        if (!job) return
        const becomingDone = job.status !== 'done'

        // If completing a recurring job, spawn the next occurrence
        if (becomingDone && job.recurrence.unit !== 'none' && job.dueDate) {
          const nextDate = nextRecurrence(job.dueDate, job.recurrence)
          const next: Job = {
            ...job,
            id: uid(),
            status: 'todo',
            dueDate: nextDate,
            completedAt: undefined,
            checklist: job.checklist.map((c) => ({ ...c, done: false })),
            createdAt: nowISO(),
            updatedAt: nowISO(),
          }
          set((s) => ({
            jobs: [
              next,
              ...s.jobs.map((j) =>
                j.id === id
                  ? { ...j, status: 'done' as const, completedAt: nowISO(), updatedAt: nowISO() }
                  : j,
              ),
            ],
          }))
          return
        }

        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === id
              ? {
                  ...j,
                  status: becomingDone ? ('done' as const) : ('todo' as const),
                  completedAt: becomingDone ? nowISO() : undefined,
                  updatedAt: nowISO(),
                }
              : j,
          ),
        }))
      },

      setStatus: (id, status) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === id
              ? {
                  ...j,
                  status,
                  completedAt: status === 'done' ? nowISO() : undefined,
                  updatedAt: nowISO(),
                }
              : j,
          ),
        })),

      toggleChecklistItem: (jobId, itemId) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  updatedAt: nowISO(),
                  checklist: j.checklist.map((c) =>
                    c.id === itemId ? { ...c, done: !c.done } : c,
                  ),
                }
              : j,
          ),
        })),

      addArea: (area) => {
        const id = uid()
        set((s) => ({ areas: [...s.areas, { ...area, id, createdAt: nowISO() }] }))
        return id
      },
      updateArea: (id, patch) =>
        set((s) => ({ areas: s.areas.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      deleteArea: (id) =>
        set((s) => ({
          areas: s.areas.filter((a) => a.id !== id),
          jobs: s.jobs.map((j) => (j.areaId === id ? { ...j, areaId: undefined } : j)),
        })),

      addEquipment: (e) => {
        const id = uid()
        set((s) => ({ equipment: [...s.equipment, { ...e, id, createdAt: nowISO() }] }))
        return id
      },
      updateEquipment: (id, patch) =>
        set((s) => ({
          equipment: s.equipment.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      deleteEquipment: (id) =>
        set((s) => ({
          equipment: s.equipment.filter((e) => e.id !== id),
          jobs: s.jobs.map((j) => (j.equipmentId === id ? { ...j, equipmentId: undefined } : j)),
        })),
      logService: (id) =>
        set((s) => ({
          equipment: s.equipment.map((e) =>
            e.id === id ? { ...e, lastServiced: todayISO() } : e,
          ),
        })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      resetSampleData: () =>
        set(() => ({ jobs: seedJobs, areas: seedAreas, equipment: seedEquipment })),
      clearAll: () => set(() => ({ jobs: [], areas: [], equipment: [] })),
    }),
    {
      name: 'acre-store-v1',
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true
      },
    },
  ),
)
