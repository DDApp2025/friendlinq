import { useNavigate, Link } from 'react-router-dom'
import './NearbyUsers.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function NearbyUsers() {
  const navigate = useNavigate()
  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  if (!raw) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="nearby-wrapper">
      <header className="nearby-header">
        <Link to="/dashboard">← Back</Link>
        <h1>Nearby Users</h1>
      </header>
      <main className="nearby-main">
        <p className="nearby-placeholder">Nearby users – full implementation in next iteration.</p>
      </main>
    </div>
  )
}
