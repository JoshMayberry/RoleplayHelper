import { defineStore } from 'pinia'

const STORAGE_KEY = 'roleplay-helper:settings'

type SettingsState = {
  darkMode: boolean
}

const DEFAULTS: SettingsState = {
  darkMode: true,
}

function load(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw)
    return { ...DEFAULTS, ...parsed }
  } catch (e) {
    console.warn('Failed to load settings from localStorage', e)
    return { ...DEFAULTS }
  }
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => load(),
  actions: {
    setDarkMode(v: boolean) {
      this.darkMode = v
    },
    reset() {
      this.$patch({ ...DEFAULTS })
    },
  },
})

let __persistenceRegistered = false

export function registerSettingsPersistence() {
  const store = useSettingsStore()
  if (__persistenceRegistered) return store
  __persistenceRegistered = true

  // subscribe and persist on every change
  store.$subscribe((mutation, state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.warn('Failed to persist settings to localStorage', e)
    }
  })

  return store
}

export default useSettingsStore
