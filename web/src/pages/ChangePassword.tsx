import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { changePassword } from '../api/profile'
import './ChangePassword.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  const token = raw ? (() => { try { return (JSON.parse(raw) as { accessToken?: string }).accessToken ?? null; } catch { return null; } })() : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      navigate('/login', { replace: true })
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    if (newPassword.length < 5) {
      setError('New password must be at least 5 characters.')
      return
    }
    setLoading(true)
    setError(null)
    changePassword(oldPassword, newPassword, token)
      .then((res) => {
        if (res.message === 'Success') {
          setSuccess(true)
          setOldPassword('')
          setNewPassword('')
          setConfirmPassword('')
        } else {
          setError(res.message || 'Failed to change password')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to change password'))
      .finally(() => setLoading(false))
  }

  if (!token) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="change-password-wrapper">
      <header className="change-password-header">
        <Link to="/settings">← Back</Link>
        <h1>Change Password</h1>
      </header>
      <main className="change-password-main">
        {success && <div className="change-password-success">Password updated successfully.</div>}
        {error && <div className="change-password-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="change-password-form">
          <label>Current password</label>
          <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required minLength={5} className="change-password-input" />
          <label>New password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={5} className="change-password-input" />
          <label>Confirm new password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={5} className="change-password-input" />
          <button type="submit" className="change-password-submit" disabled={loading}>
            {loading ? 'Saving…' : 'Change Password'}
          </button>
        </form>
      </main>
    </div>
  )
}
