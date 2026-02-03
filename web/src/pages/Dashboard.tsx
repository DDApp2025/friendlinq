import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function Dashboard() {
  const navigate = useNavigate()

  useEffect(() => {
    const user = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!user) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  return (
    <div className="dashboard-wrapper">
      <h1>Dashboard</h1>
      <p>Home feed placeholder – Screen #4 in migration order.</p>
    </div>
  )
}
