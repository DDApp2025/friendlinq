import { useNavigate, Link } from 'react-router-dom'
import './Settings.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function Settings() {
  const navigate = useNavigate()
  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  if (!raw) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="settings-wrapper">
      <header className="settings-header">
        <Link to="/profile">← Back</Link>
        <h1>Settings</h1>
      </header>
      <main className="settings-main">
        <nav className="settings-nav">
          <Link to="/change-password" className="settings-link">Change Password</Link>
          <Link to="/wallpapers" className="settings-link">Wallpapers</Link>
          <Link to="/portfolio" className="settings-link">Portfolio</Link>
          <Link to="/nearby" className="settings-link">Nearby Users</Link>
          <Link to="/schedule-calls" className="settings-link">Schedule Calls</Link>
        </nav>
      </main>
    </div>
  )
}
