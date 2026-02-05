import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LOGGED_IN_USER_KEY } from '../constants/devUser'
import { getCurrentUser, updateCurrentUserProfile } from '../lib/devProfilePersistence'
import './Settings.css'

export default function ChangePassword() {
  const navigate = useNavigate()

  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  if (!raw && !import.meta.env.DEV) {
    navigate('/login', { replace: true })
    return null
  }

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validation
    if (!currentPassword.trim()) {
      setError('Please enter your current password.')
      return
    }
    if (!newPassword.trim()) {
      setError('Please enter a new password.')
      return
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    // Dev mode: verify current password against stored user
    const user = getCurrentUser() as any
    if (user && user.password && user.password !== currentPassword) {
      setError('Current password is incorrect.')
      return
    }

    setLoading(true)

    // In dev mode, update password in persistence layer
    if (import.meta.env.DEV) {
      setTimeout(() => {
        updateCurrentUserProfile({ password: newPassword } as any)
        setLoading(false)
        setSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        // Navigate back after brief delay
        setTimeout(() => navigate('/settings'), 1500)
      }, 500)
      return
    }

    // Production: call API (placeholder)
    setLoading(false)
    setError('Password change API not connected yet.')
  }

  return (
    <div className="settings-wrapper">
      <header className="settings-header fl-header">
        <Link to="/settings">← Back</Link>
        <h1 className="settings-header-title">Change Password</h1>
        <span />
      </header>

      <main className="settings-main">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '12px 16px',
              background: '#d1fae5',
              color: '#065f46',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}>
              Password changed successfully! Redirecting…
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: '#333', fontSize: '0.95rem' }}>
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: '#333', fontSize: '0.95rem' }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: '#333', fontSize: '0.95rem' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: loading ? '#999' : '#006B3F',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
            }}
          >
            {loading ? 'Saving…' : 'Change Password'}
          </button>
        </form>
      </main>
    </div>
  )
}