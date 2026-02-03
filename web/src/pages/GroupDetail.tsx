import { useNavigate, Link, useParams } from 'react-router-dom'
import './GroupDetail.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  if (!raw) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="group-detail-wrapper">
      <header className="group-detail-header">
        <Link to="/groups">← Back</Link>
        <h1>Group</h1>
      </header>
      <main className="group-detail-main">
        <p className="group-detail-placeholder">Group detail and chat – screen {groupId ? 'loaded' : ''}. Full implementation in next iteration.</p>
        <Link to={`/groups/${groupId}/members`} className="group-detail-link">View members</Link>
      </main>
    </div>
  )
}
