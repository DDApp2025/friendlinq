import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getNotifications, viewAllNotifications } from '../api/notifications'
import type { NotificationItem } from '../api/notifications'
import './Notifications.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

function formatDate(s?: string): string {
  if (!s) return ''
  try {
    return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return s
  }
}

export default function Notifications() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [list, setList] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw) {
      navigate('/login', { replace: true })
      return
    }
    try {
      const u = JSON.parse(raw) as { accessToken?: string }
      setToken(u.accessToken ?? null)
    } catch {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    getNotifications(0, 50, token)
      .then((res) => {
        if (res.message === 'Success' && res.data?.notificationData) {
          setList(res.data.notificationData)
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [token])

  const handleViewAll = () => {
    if (!token) return
    viewAllNotifications(token).then((res) => {
      if (res.message === 'Success') setList((prev) => prev.map((n) => ({ ...n, isView: true })))
    })
  }

  if (!token) return null

  return (
    <div className="notifications-wrapper">
      <header className="notifications-header">
        <Link to="/dashboard">← Back</Link>
        <h1>Notifications</h1>
      </header>
      <main className="notifications-main">
        {error && <div className="notifications-error" role="alert">{error}</div>}
        {loading ? (
          <p className="notifications-loading">Loading…</p>
        ) : (
          <>
            {list.length > 0 && (
              <button type="button" className="notifications-view-all" onClick={handleViewAll}>
                Mark all as viewed
              </button>
            )}
            <ul className="notifications-list">
              {list.map((n) => (
                <li key={n._id ?? Math.random()} className="notifications-item">
                  <p className="notifications-text">{n.textMessage ?? '—'}</p>
                  <span className="notifications-date">{formatDate(n.createdAt)}</span>
                </li>
              ))}
            </ul>
            {!loading && list.length === 0 && (
              <p className="notifications-empty">No notifications yet.</p>
            )}
          </>
        )}
      </main>
    </div>
  )
}
