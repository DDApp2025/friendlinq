import { useNavigate, Link } from 'react-router-dom'
import './Settings.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function Settings() {
  const navigate = useNavigate()
  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  if (!raw && !import.meta.env.DEV) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="settings-wrapper">
      <header className="settings-header fl-header">
        <Link to="/profile">← Back</Link>
        <h1 className="settings-header-title">Settings</h1>
        <span />
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
