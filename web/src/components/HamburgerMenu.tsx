import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import defaultAvatar from '../assets/images/user.jfif'
import { LOGGED_IN_USER_KEY, DEV_ACTIVE_USER_EMAIL_KEY, DEV_JUST_LOGOUT_KEY } from '../constants/devUser'
const IMAGE_BASE = 'https://natural.selectnaturally.com'

/**
 * Global profile menu (top-right): trigger is user's profile picture, matching RN app.
 * Menu items: Profile, Send Invitation, Support, Settings, Logout.
 */
function getProfileImageUrl(): string {
  try {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw) return ''
    const u = JSON.parse(raw) as { profilePhoto?: string; imageURL?: { original?: string } }

    // 1. Check for dev-uploaded profile photo first (base64)
    if (u?.profilePhoto) return u.profilePhoto

    // 2. Fall back to API-provided image
    const path = u?.imageURL?.original
    return path ? `${IMAGE_BASE}/${path}` : ''
  } catch {
    return ''
  }
}

function getCurrentUserDisplay(): { fullName: string; email: string } {
  try {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw) return { fullName: '', email: '' }
    const u = JSON.parse(raw) as { fullName?: string; email?: string }
    return { fullName: u?.fullName ?? '', email: u?.email ?? '' }
  } catch {
    return { fullName: '', email: '' }
  }
}

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [userDisplay, setUserDisplay] = useState({ fullName: '', email: '' })
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)

  // Re-read profile image on every route change so it updates after upload
  useEffect(() => {
    setProfileImageUrl(getProfileImageUrl())
    setUserDisplay(getCurrentUserDisplay())
  }, [location])

  useEffect(() => {
    if (open) setUserDisplay(getCurrentUserDisplay())
  }, [open])

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Click outside and ESC to close
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleLogout = () => {
    setOpen(false)
    try {
      sessionStorage.removeItem(LOGGED_IN_USER_KEY)
      if (import.meta.env.DEV) {
        localStorage.removeItem(DEV_ACTIVE_USER_EMAIL_KEY)
        sessionStorage.setItem(DEV_JUST_LOGOUT_KEY, '1')
      }
    } catch {
      // ignore
    }
    navigate('/login', { replace: true })
  }

  return (
    <div className="profile-menu-wrap" ref={containerRef}>
      <button
        type="button"
        className="profile-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Open menu"
      >
        {profileImageUrl ? (
          <img src={profileImageUrl} alt="" className="profile-menu-avatar" />
        ) : (
          <img src={defaultAvatar} alt="" className="profile-menu-avatar" />
        )}
      </button>
      {open && (
        <div className="profile-menu-dropdown" role="menu">
          {(userDisplay.fullName || userDisplay.email) && (
            <div className="profile-menu-user-info">
              {userDisplay.fullName && <span className="profile-menu-user-name">{userDisplay.fullName}</span>}
              {userDisplay.email && <span className="profile-menu-user-email">{userDisplay.email}</span>}
            </div>
          )}
          {import.meta.env.DEV && userDisplay.email && (
            <div className="profile-menu-dev-user" aria-hidden>
              Signed in as: {userDisplay.email}
            </div>
          )}
          <Link to="/profile" className="profile-menu-item" role="menuitem" onClick={() => setOpen(false)}>
            Profile
          </Link>
          <Link to="/friends" className="profile-menu-item" role="menuitem" onClick={() => setOpen(false)}>
            Send Invitation
          </Link>
          <Link to="/settings" className="profile-menu-item" role="menuitem" onClick={() => setOpen(false)}>
            Support
          </Link>
          <Link to="/settings" className="profile-menu-item" role="menuitem" onClick={() => setOpen(false)}>
            Settings
          </Link>
          <div className="profile-menu-divider" />
          <button
            type="button"
            className="profile-menu-item profile-menu-logout"
            role="menuitem"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}