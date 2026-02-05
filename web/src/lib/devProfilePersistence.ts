/**
 * DEV-only: persist profile edit fields to current user (sessionStorage + localStorage).
 * Profile page reads from same user. No second user system.
 */
import type { CustomerData } from '../api/types'
import { LOGGED_IN_USER_KEY } from '../constants/devUser'

const DEV_USER_STORAGE_KEY = 'friendlinq_dev_user'

export type DevProfileUpdates = Partial<{
  profilePhoto: string
  profileBannerPhoto: string
  wallpaper: string
  profileWallpaper: string
  customWallpaper: string
  wallpaperGallery: string[]
  profileVideo: string
  profileVideos: string[]
  topFourImages: string[]
  topFourFriends: CustomerData[]
}>

function getStored(): CustomerData & { accessToken?: string } | null {
  try {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (raw) return JSON.parse(raw) as CustomerData & { accessToken?: string }
    if (import.meta.env.DEV && typeof localStorage !== 'undefined') {
      const devRaw = localStorage.getItem(DEV_USER_STORAGE_KEY)
      if (devRaw) {
        const user = JSON.parse(devRaw) as CustomerData & { accessToken?: string }
        sessionStorage.setItem(LOGGED_IN_USER_KEY, devRaw)
        return user
      }
    }
  } catch {
    // ignore
  }
  return null
}

function setStored(user: CustomerData & { accessToken?: string }) {
  const s = JSON.stringify(user)
  sessionStorage.setItem(LOGGED_IN_USER_KEY, s)
  if (import.meta.env.DEV && typeof localStorage !== 'undefined') {
    localStorage.setItem(DEV_USER_STORAGE_KEY, s)
  }
}

/** Get current user (sessionStorage, or in DEV fallback to localStorage). */
export function getCurrentUser(): (CustomerData & { accessToken?: string }) | null {
  return getStored()
}

/** Merge profile updates into current user and persist. DEV only; in prod no-op for this helper. */
export function updateCurrentUserProfile(updates: DevProfileUpdates): void {
  if (!import.meta.env.DEV) return
  const current = getStored()
  if (!current) return
  const next = { ...current, ...updates }
  setStored(next)
}