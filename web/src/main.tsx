import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import {
  LOGGED_IN_USER_KEY,
  DEV_ACTIVE_USER_EMAIL_KEY,
  DEV_JUST_LOGOUT_KEY,
  DEV_USERS,
  getDevUserByEmail,
} from './constants/devUser'
import { getCurrentUser } from './lib/devProfilePersistence'

if (import.meta.env.DEV) {
  const justLoggedOut = sessionStorage.getItem(DEV_JUST_LOGOUT_KEY)
  if (justLoggedOut) {
    sessionStorage.removeItem(DEV_JUST_LOGOUT_KEY)
    sessionStorage.removeItem(LOGGED_IN_USER_KEY)
    // do not inject any user; app will show login
  } else {
    let email = localStorage.getItem(DEV_ACTIVE_USER_EMAIL_KEY)
    if (!email || !getDevUserByEmail(email)) {
      email = DEV_USERS[0].email
      localStorage.setItem(DEV_ACTIVE_USER_EMAIL_KEY, email)
    }
    // Prefer persisted user (sessionStorage/localStorage) so topFourImages etc. survive refresh
    const persisted = getCurrentUser()
    if (persisted && (persisted.email || '').trim().toLowerCase() === (email || '').trim().toLowerCase()) {
      sessionStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(persisted))
      console.log('DEV MODE ACTIVE USER (persisted):', { fullName: persisted.fullName, email: persisted.email, _id: persisted._id })
    } else {
      const user = getDevUserByEmail(email)
      if (user) {
        sessionStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user))
        console.log('DEV MODE ACTIVE USER:', { fullName: user.fullName, email: user.email, _id: user._id })
      }
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
