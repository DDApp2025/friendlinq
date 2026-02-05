/**
 * Development-only: switchable test users (Julio, Christi).
 * Current user: sessionStorage under LOGGED_IN_USER_KEY.
 * Which user is active: localStorage under DEV_ACTIVE_USER_EMAIL.
 * Not used in production.
 */

export const LOGGED_IN_USER_KEY = 'loggedInUser'

/** localStorage: email of the dev user currently "signed in". Cleared on logout. */
export const DEV_ACTIVE_USER_EMAIL_KEY = 'DEV_ACTIVE_USER_EMAIL'

/** sessionStorage: set on logout so main.tsx does not re-inject a user. */
export const DEV_JUST_LOGOUT_KEY = 'DEV_JUST_LOGOUT'

export interface DevUserRecord {
  _id: string
  fullName: string
  email: string
  password: string
  accessToken: string
  imageURL: { original: string; thumbnail: string }
}

/** DEV-only users that can be switched via login. Same shape as CustomerData for sessionStorage. */
export const DEV_USERS: DevUserRecord[] = [
  {
    _id: 'dev-user',
    fullName: 'Julio',
    email: 'julio@gmail.com',
    password: '123456',
    accessToken: 'dev-token',
    imageURL: { original: '', thumbnail: '' },
  },
  {
    _id: 'dev-friend-christi',
    fullName: 'Christi',
    email: 'Christi@gmail.com',
    password: '123456',
    accessToken: 'dev-token',
    imageURL: { original: '', thumbnail: '' },
  },
]

/** Current dev user (for backward compat). Equals first in DEV_USERS. */
export const DEV_USER = DEV_USERS[0]

/** Second user: searchable as friend. */
export const DEV_FRIEND = DEV_USERS[1]

export function getDevUserByEmail(email: string): DevUserRecord | undefined {
  const e = (email || '').trim().toLowerCase()
  return DEV_USERS.find((u) => u.email.toLowerCase() === e)
}

export function getDevUserByEmailAndPassword(email: string, password: string): DevUserRecord | undefined {
  const u = getDevUserByEmail(email)
  return u && u.password === (password || '') ? u : undefined
}
