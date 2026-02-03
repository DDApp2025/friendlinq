import { useNavigate, Link } from 'react-router-dom'
import './Portfolio.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function Portfolio() {
  const navigate = useNavigate()
  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  if (!raw) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="portfolio-wrapper">
      <header className="portfolio-header">
        <Link to="/profile">← Back</Link>
        <h1>Portfolio</h1>
      </header>
      <main className="portfolio-main">
        <p className="portfolio-placeholder">Portfolio – full implementation in next iteration.</p>
      </main>
    </div>
  )
}
