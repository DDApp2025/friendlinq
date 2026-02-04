import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getGroupList } from '../api/groups'
import type { GroupItem } from '../api/groups'
import './GroupsList.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function GroupsList() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [groups, setGroups] = useState<GroupItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw && !import.meta.env.DEV) {
      navigate('/login', { replace: true })
      return
    }
    if (!raw) return
    try {
      const u = JSON.parse(raw) as { accessToken?: string }
      setToken(u.accessToken ?? null)
    } catch {
      if (!import.meta.env.DEV) navigate('/login', { replace: true })
    }
  }, [navigate])

  const apiToken: string = token ?? (import.meta.env.DEV ? 'dev-token' : '')
  useEffect(() => {
    if (!apiToken) return
    getGroupList(0, 50, apiToken)
      .then((res) => {
        if (res.message === 'Success' && res.data?.groupList) {
          setGroups(res.data.groupList)
        }
      })
      .finally(() => setLoading(false))
  }, [apiToken])

  if (!token && !import.meta.env.DEV) return null

  return (
    <div className="groups-list-wrapper">
      <header className="groups-list-header fl-header">
        <Link to="/dashboard">← Back</Link>
        <h1 className="groups-list-header-title">Groups</h1>
        <span />
        <Link to="/groups/create" className="groups-list-create">Create</Link>
      </header>
      <main className="groups-list-main">
        {loading ? (
          <p className="groups-list-loading">Loading…</p>
        ) : groups.length === 0 ? (
          <p className="groups-list-empty">No groups yet. Create a group to get started.</p>
        ) : (
          <ul className="groups-list-ul">
            {groups.map((g) => (
              <li key={g._id ?? ''}>
                <Link to={`/groups/${g._id}`} className="groups-list-item">
                  {g.groupName ?? 'Unnamed group'}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
