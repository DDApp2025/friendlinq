import { useNavigate, Link } from 'react-router-dom'
import './ScheduleCalls.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function ScheduleCalls() {
  const navigate = useNavigate()
  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  if (!raw) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="schedule-calls-wrapper">
      <header className="schedule-calls-header">
        <Link to="/dashboard">← Back</Link>
        <h1>Schedule Calls</h1>
      </header>
      <main className="schedule-calls-main">
        <p className="schedule-calls-placeholder">Schedule calls – full implementation in next iteration.</p>
      </main>
    </div>
  )
}
