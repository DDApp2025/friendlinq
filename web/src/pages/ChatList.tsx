import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getFriendList } from '../api/friends'
import { FRIEND_LIST_STATUS } from '../api/types'
import type { CustomerData } from '../api/types'
import './ChatList.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'
const IMAGE_BASE = 'https://natural.selectnaturally.com'

function avatarUrl(user: CustomerData): string {
  const img = user?.imageURL as { original?: string; thumbnail?: string } | undefined
  const path = img?.original ?? img?.thumbnail
  return path ? `${IMAGE_BASE}/${path}` : ''
}

export default function ChatList() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [friends, setFriends] = useState<CustomerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    setLoading(true)
    getFriendList(0, 100, FRIEND_LIST_STATUS.ACCEPTED, apiToken)
      .then((res) => {
        if (res.message === 'Success' && res.data?.friendList) {
          setFriends(res.data.friendList)
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [apiToken])

  if (!token && !import.meta.env.DEV) return null

  return (
    <div className="chat-list-wrapper">
      <header className="chat-list-header fl-header">
        <Link to="/dashboard">← Back</Link>
        <h1 className="chat-list-header-title">Messages</h1>
        <span />
      </header>
      <main className="chat-list-main">
        {error && <div className="chat-list-error" role="alert">{error}</div>}
        {loading ? (
          <p className="chat-list-loading">Loading…</p>
        ) : friends.length === 0 ? (
          <p className="chat-list-empty">No friends yet. Add friends to start messaging.</p>
        ) : (
          <ul className="chat-list-ul">
            {friends.map((user) => (
              <li key={user._id ?? ''} className="chat-list-item">
                <Link to={`/chat/${user._id}`} className="chat-list-item-link">
                  <img src={avatarUrl(user)} alt="" className="chat-list-avatar" />
                  <div className="chat-list-info">
                    <span className="chat-list-name">{user.fullName ?? '—'}</span>
                    <span className="chat-list-email">{user.email ?? ''}</span>
                  </div>
                  <span className="chat-list-arrow">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
