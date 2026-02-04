import { useNavigate, Link } from 'react-router-dom'
import './NearbyUsers.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function NearbyUsers() {
  const navigate = useNavigate()
  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  if (!raw && !import.meta.env.DEV) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="nearby-wrapper">
      <header className="nearby-header fl-header">
        <Link to="/dashboard">← Back</Link>
        <h1 className="nearby-header-title">Nearby Users</h1>
        <span />
      </header>
      <main className="nearby-main">
        <p className="nearby-placeholder">Nearby users – full implementation in next iteration.</p>
      </main>
    </div>
  )
}
