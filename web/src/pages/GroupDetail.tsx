import { useEffect, useState } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { getGroupDetails } from '../api/groups'
import type { GroupItem } from '../api/groups'
import './GroupDetail.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const [group, setGroup] = useState<GroupItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw) {
      navigate('/login', { replace: true })
      return
    }
    let token: string | null = null
    try {
      const u = JSON.parse(raw) as { accessToken?: string }
      token = u.accessToken ?? null
    } catch {
      setLoading(false)
      return
    }
    if (!token || !groupId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    getGroupDetails(groupId, token)
      .then((res) => {
        if (res.message === 'Success' && res.data) {
          const d = res.data as { group?: GroupItem } & GroupItem
          const g = d.group ?? d
          setGroup(g && typeof g === 'object' ? (g as GroupItem) : null)
        } else {
          setError(res.message || 'Group not found')
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load group')
      })
      .finally(() => setLoading(false))
  }, [groupId, navigate])

  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  if (!raw) return null

  return (
    <div className="group-detail-wrapper">
      <header className="group-detail-header">
        <Link to="/groups">← Back</Link>
        <h1>{group?.groupName ?? 'Group'}</h1>
      </header>
      <main className="group-detail-main">
        {error && (
          <div className="group-detail-error" role="alert">
            {error}
          </div>
        )}
        {loading ? (
          <p className="group-detail-loading">Loading…</p>
        ) : group ? (
          <>
            <p className="group-detail-desc">{group.groupName ?? 'Group'}</p>
            <Link to={`/groups/${groupId}/members`} className="group-detail-link">
              View members
            </Link>
          </>
        ) : null}
      </main>
    </div>
  )
}
