import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getGroupList } from '../api/groups'
import type { GroupItem } from '../api/groups'
import './GroupsList.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

/** DEV: mock groups when API returns empty (match backend shape) */
function getDevMockGroups(currentUserId: string): GroupItem[] {
  return [
    { _id: 'dev-group-1', groupName: 'Dev Group One', groupAdminId: currentUserId },
    { _id: 'dev-group-2', groupName: 'Dev Group Two', groupAdminId: 'other-user' },
    { _id: 'dev-group-3', groupName: 'Dev Group Three', groupAdminId: currentUserId },
    { _id: 'dev-group-4', groupName: 'Dev Group Four', groupAdminId: 'other-user' },
    { _id: 'dev-group-5', groupName: 'Dev Group Five', groupAdminId: currentUserId },
  ]
}

function getGroupAdminId(g: GroupItem): string | undefined {
  const admin = g.groupAdminId
  if (!admin) return undefined
  return typeof admin === 'object' && admin !== null && '_id' in admin
    ? (admin as { _id?: string })._id
    : String(admin)
}

export default function GroupsList() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined)
  const [groups, setGroups] = useState<GroupItem[]>([])
  const [loading, setLoading] = useState(true)
  const [pausedGroupIds, setPausedGroupIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw && !import.meta.env.DEV) {
      navigate('/login', { replace: true })
      return
    }
    if (!raw) return
    try {
      const u = JSON.parse(raw) as { accessToken?: string; _id?: string }
      setToken(u.accessToken ?? null)
      setCurrentUserId(u._id ?? undefined)
    } catch {
      if (!import.meta.env.DEV) navigate('/login', { replace: true })
    }
  }, [navigate])

  const apiToken: string = token ?? (import.meta.env.DEV ? 'dev-token' : '')
  useEffect(() => {
    if (!apiToken) return
    setLoading(true)
    getGroupList(0, 50, apiToken)
      .then((res) => {
        if (res.message === 'Success' && res.data?.groupList && res.data.groupList.length > 0) {
          setGroups(res.data.groupList)
        } else if (import.meta.env.DEV) {
          const devId = currentUserId ?? 'dev-user'
          setGroups(getDevMockGroups(devId))
        } else {
          setGroups([])
        }
      })
      .catch(() => {
        if (import.meta.env.DEV) {
          setGroups(getDevMockGroups(currentUserId ?? 'dev-user'))
        } else {
          setGroups([])
        }
      })
      .finally(() => setLoading(false))
  }, [apiToken, currentUserId])

  const togglePause = (groupId: string) => {
    setPausedGroupIds((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  if (!token && !import.meta.env.DEV) return null

  return (
    <div className="groups-list-wrapper">
      <header className="groups-list-header fl-header">
        <Link to="/dashboard">← Back</Link>
        <h1 className="groups-list-header-title">Groups</h1>
        <span />
      </header>
      <main className="groups-list-main">
        <div className="groups-list-actions">
          <Link to="/groups" className="groups-list-btn groups-list-btn-join">
            Join Group
          </Link>
          <Link to="/groups/create" className="groups-list-btn groups-list-btn-create">
            Create Group
          </Link>
        </div>

        {loading ? (
          <p className="groups-list-loading">Loading…</p>
        ) : groups.length === 0 ? (
          <p className="groups-list-empty">No groups yet. Create a group to get started.</p>
        ) : (
          <ul className="groups-list-ul">
            {groups.map((g) => {
              const groupId = g._id ?? ''
              const isAdmin = currentUserId && getGroupAdminId(g) === currentUserId
              const isPaused = pausedGroupIds.has(groupId)
              return (
                <li key={groupId} className="groups-list-row">
                  <Link to={`/groups/${groupId}`} className="groups-list-item">
                    {g.groupName ?? 'Unnamed group'}
                  </Link>
                  <div className="groups-list-row-actions">
                    <Link
                      to="/schedule-calls"
                      className="groups-list-icon"
                      title="Call (audio)"
                      aria-label="Call"
                    >
                      📞
                    </Link>
                    <Link
                      to="/schedule-calls?mode=video"
                      className="groups-list-icon"
                      title="Video call"
                      aria-label="Video"
                    >
                      📹
                    </Link>
                    <Link
                      to="/schedule-calls"
                      className="groups-list-icon"
                      title="Schedule time"
                      aria-label="Schedule"
                    >
                      📅
                    </Link>
                    {isAdmin && (
                      <Link
                        to={`/groups/${groupId}`}
                        className="groups-list-icon"
                        title="Edit group"
                        aria-label="Edit"
                      >
                        ✏️
                      </Link>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        className="groups-list-icon groups-list-icon-btn"
                        title={isPaused ? 'Resume' : 'Pause'}
                        aria-label={isPaused ? 'Resume' : 'Pause'}
                        onClick={(e) => {
                          e.preventDefault()
                          togglePause(groupId)
                        }}
                      >
                        {isPaused ? '▶️' : '⏸'}
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
