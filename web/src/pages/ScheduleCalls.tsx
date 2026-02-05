import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getAllCalls } from '../api/scheduleCalls'
import type { ScheduleCallItem } from '../api/scheduleCalls'
import './ScheduleCalls.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

function formatDate(s?: string): string {
  if (!s) return ''
  try {
    const d = new Date(s)
    return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return s
  }
}

export default function ScheduleCalls() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [list, setList] = useState<ScheduleCallItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw && !import.meta.env.DEV) {
      navigate('/login', { replace: true })
      return
    }
    if (!raw) return
    try {
      const u = JSON.parse(raw) as { accessToken?: string }
      setToken(u.accessToken ?? null)
    } catch {
      if (!import.meta.env.DEV) navigate('/login', { replace: true })
    }
  }, [navigate])

  const apiToken: string = token ?? (import.meta.env.DEV ? 'dev-token' : '')
  useEffect(() => {
    if (!apiToken) return
    setLoading(true)
    setError(null)
    getAllCalls(apiToken)
      .then((res) => {
        if (res.message === 'Success') {
          const data = res.data
          setList(Array.isArray(data) ? data : [])
        }
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [apiToken])

  if (!token && !import.meta.env.DEV) return null

  return (
    <div className="schedule-calls-wrapper">
      <header className="schedule-calls-header fl-header">
        <Link to="/dashboard">← Back</Link>
        <h1 className="schedule-calls-header-title">Schedule Calls</h1>
        <span />
      </header>
      <main className="schedule-calls-main">
        {/* Card 1: Host a Voice or Video Call Now */}
        <section className="schedule-calls-card">
          <h2 className="schedule-calls-card-title">Host a Voice or Video Call Now</h2>
          <div className="schedule-calls-card-actions">
            <button
              type="button"
              className="schedule-calls-card-btn"
              onClick={() => navigate('/send-invitation?mode=hostNow&type=friends')}
            >
              Select Friends
            </button>
            <button
              type="button"
              className="schedule-calls-card-btn"
              onClick={() => navigate('/send-invitation?mode=hostNow&type=group')}
            >
              Select a Group
            </button>
          </div>
        </section>

        {/* Card 2: Schedule a future Voice or Video Call */}
        <section className="schedule-calls-card">
          <h2 className="schedule-calls-card-title">Schedule a future Voice or Video Call</h2>
          <div className="schedule-calls-card-actions">
            <button
              type="button"
              className="schedule-calls-card-btn"
              onClick={() => navigate('/send-invitation?mode=schedule&type=friends')}
            >
              Select Friends
            </button>
            <button
              type="button"
              className="schedule-calls-card-btn"
              onClick={() => navigate('/send-invitation?mode=schedule&type=group')}
            >
              Select a Group
            </button>
          </div>
        </section>

        {/* Existing: list of scheduled calls */}
        {error && (
          <div className="schedule-calls-error" role="alert">
            {error}
          </div>
        )}
        <h3 className="schedule-calls-list-heading">Your scheduled calls</h3>
        {loading ? (
          <p className="schedule-calls-loading">Loading…</p>
        ) : list.length === 0 ? (
          <p className="schedule-calls-placeholder">No scheduled calls. Use the cards above to schedule.</p>
        ) : (
          <ul className="schedule-calls-list">
            {list.map((item) => (
              <li key={item._id ?? ''} className="schedule-calls-item">
                <h3 className="schedule-calls-item-title">{item.title ?? 'Call'}</h3>
                <p className="schedule-calls-item-date">{formatDate(item.scheduleDate)}</p>
                {item.memberNames?.length ? (
                  <p className="schedule-calls-item-members">With: {item.memberNames.join(', ')}</p>
                ) : null}
                {item.inviteLink && (
                  <a href={item.inviteLink} target="_blank" rel="noopener noreferrer" className="schedule-calls-item-link">
                    Join link
                  </a>
                )}
                {item.isEnded && <span className="schedule-calls-item-ended">Ended</span>}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}