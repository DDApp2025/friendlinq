import { useEffect, useState } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { getMemberOfGroup } from '../api/groups'
import './GroupMembers.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

type MemberRow = {
  _id?: string;
  groupMemberId?: { _id?: string; fullName?: string };
};

export default function GroupMembers() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const [members, setMembers] = useState<MemberRow[]>([])
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
    getMemberOfGroup(groupId, token)
      .then((res) => {
        if (res.message === 'Success' && res.data?.groupMemberList) {
          setMembers(res.data.groupMemberList)
        } else {
          setMembers([])
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load members')
        setMembers([])
      })
      .finally(() => setLoading(false))
  }, [groupId, navigate])

  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  if (!raw) return null

  return (
    <div className="group-members-wrapper">
      <header className="group-members-header">
        <Link to={groupId ? `/groups/${groupId}` : '/groups'}>← Back</Link>
        <h1>Members</h1>
      </header>
      <main className="group-members-main">
        {error && (
          <div className="group-members-error" role="alert">
            {error}
          </div>
        )}
        {loading ? (
          <p className="group-members-loading">Loading…</p>
        ) : members.length === 0 ? (
          <p className="group-members-empty">No members.</p>
        ) : (
          <ul className="group-members-list">
            {members.map((m) => {
              const id = m.groupMemberId?._id ?? m._id ?? ''
              const name = m.groupMemberId?.fullName ?? 'Unknown'
              return (
                <li key={m._id ?? id ?? Math.random()} className="group-members-item">
                  {id ? (
                    <Link to={`/profile/${id}`} className="group-members-name">
                      {name}
                    </Link>
                  ) : (
                    <span className="group-members-name">{name}</span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
