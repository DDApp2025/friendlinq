import { useNavigate, Link } from 'react-router-dom'
import './Profile.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function Profile() {
  const navigate = useNavigate()

  const handleLogout = () => {
    sessionStorage.removeItem(LOGGED_IN_USER_KEY)
    navigate('/login', { replace: true })
  }

  return (
    <div className="profile-wrapper">
      <header className="profile-header">
        <Link to="/dashboard">← Back</Link>
        <h1>Profile</h1>
      </header>
      <main className="profile-main">
        <p className="profile-placeholder">Profile screen – coming soon.</p>
        <button type="button" className="profile-logout" onClick={handleLogout}>
          Log out
        </button>
      </main>
    </div>
  )
}
