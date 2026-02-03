import { useNavigate, Link, useParams } from 'react-router-dom'
import './GroupMembers.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function GroupMembers() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  if (!raw) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="group-members-wrapper">
      <header className="group-members-header">
        <Link to={groupId ? `/groups/${groupId}` : '/groups'}>← Back</Link>
        <h1>Members</h1>
      </header>
      <main className="group-members-main">
        <p className="group-members-placeholder">Group members list – full implementation in next iteration.</p>
      </main>
    </div>
  )
}
