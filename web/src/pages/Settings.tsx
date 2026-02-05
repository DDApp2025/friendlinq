import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LOGGED_IN_USER_KEY, DEV_ACTIVE_USER_EMAIL_KEY, DEV_JUST_LOGOUT_KEY } from '../constants/devUser'
import { getCurrentUser, updateCurrentUserProfile } from '../lib/devProfilePersistence'
import './Settings.css'

export default function Settings() {
  const navigate = useNavigate()

  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  if (!raw && !import.meta.env.DEV) {
    navigate('/login', { replace: true })
    return null
  }

  // Load email toggle from persistence
  const user = getCurrentUser() as any
  const [emailUpdates, setEmailUpdates] = useState<boolean>(user?.emailUpdatesEnabled ?? true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleToggleEmail = () => {
    const next = !emailUpdates
    setEmailUpdates(next)
    updateCurrentUserProfile({ emailUpdatesEnabled: next } as any)
  }

  const handleLogout = () => {
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

  const handleDeleteAccount = () => {
    // Dev mode: just show confirmation, don't actually delete
    setShowDeleteConfirm(false)
    alert('Account deletion is not available in dev mode.')
  }

  return (
    <div className="settings-wrapper">
      <header className="settings-header fl-header">
        <Link to="/dashboard">← Back</Link>
        <h1 className="settings-header-title">Settings</h1>
        <span />
      </header>

      <main className="settings-main">
        <nav className="settings-nav">
          {/* Get Updates in email */}
          <div className="settings-row settings-row-toggle">
            <div className="settings-row-left">
              <span className="settings-row-icon">🔔</span>
              <span className="settings-row-label">Get Updates in email</span>
            </div>
            <button
              type="button"
              className={`settings-toggle ${emailUpdates ? 'settings-toggle-on' : ''}`}
              onClick={handleToggleEmail}
              role="switch"
              aria-checked={emailUpdates}
            >
              <span className="settings-toggle-knob" />
            </button>
          </div>

          {/* Change Password */}
          <Link to="/change-password" className="settings-row settings-row-link">
            <div className="settings-row-left">
              <span className="settings-row-icon">Aa</span>
              <span className="settings-row-label">Change Password</span>
            </div>
            <span className="settings-row-chevron">›</span>
          </Link>

          {/* Plans — disabled/coming soon */}
          <div className="settings-row settings-row-disabled">
            <div className="settings-row-left">
              <span className="settings-row-icon">Aa</span>
              <span className="settings-row-label">Plans</span>
            </div>
            <span className="settings-row-badge">Coming Soon</span>
          </div>

          {/* Delete Account */}
          <button
            type="button"
            className="settings-row settings-row-link settings-row-danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <div className="settings-row-left">
              <span className="settings-row-icon">Aa</span>
              <span className="settings-row-label">Delete Account</span>
            </div>
            <span className="settings-row-chevron">›</span>
          </button>

          {/* LogOut */}
          <button
            type="button"
            className="settings-row settings-row-link settings-row-logout"
            onClick={handleLogout}
          >
            <div className="settings-row-left">
              <span className="settings-row-icon">⇥</span>
              <span className="settings-row-label">LogOut</span>
            </div>
          </button>
        </nav>
      </main>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="settings-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="settings-modal-title">Delete Account</h3>
            <p className="settings-modal-text">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="settings-modal-actions">
              <button
                type="button"
                className="settings-modal-btn settings-modal-btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="settings-modal-btn settings-modal-btn-delete"
                onClick={handleDeleteAccount}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}