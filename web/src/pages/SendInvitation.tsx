import { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { getFriendList } from '../api/friends'
import { FRIEND_LIST_STATUS } from '../api/types'
import type { CustomerData } from '../api/types'
import { getCurrentUser } from '../lib/devProfilePersistence'
import defaultAvatar from '../assets/images/user.jfif'
import './SendInvitation.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'
const IMAGE_BASE = 'https://natural.selectnaturally.com'

function avatarUrl(user: CustomerData): string {
  const img = user?.imageURL as { original?: string; thumbnail?: string } | undefined
  const path = img?.original ?? img?.thumbnail
  return path ? `${IMAGE_BASE}/${path}` : ''
}

function formatForDisplay(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const yyyy = date.getFullYear()
  let hh = date.getHours()
  const min = String(date.getMinutes()).padStart(2, '0')
  const ampm = hh >= 12 ? 'pm' : 'am'
  hh = hh % 12 || 12
  return `${mm}-${dd}-${yyyy} ${hh}:${min} ${ampm}`
}

function toDatetimeLocalValue(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

export default function SendInvitation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'schedule'
  const type = searchParams.get('type') || 'friends'

  const [token, setToken] = useState<string | null>(null)
  const [callTitle, setCallTitle] = useState('')
  const [callType, setCallType] = useState<'audio' | 'video'>('video')
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date())
  const [showPicker, setShowPicker] = useState(false)
  const [friends, setFriends] = useState<CustomerData[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  // Get token
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

  // Load friends list
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
      .catch(() => setFriends([]))
      .finally(() => setLoading(false))
  }, [apiToken])

  const toggleFriend = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val) {
      setScheduleDate(new Date(val))
    }
  }

  const handleSend = () => {
    if (selectedIds.size === 0) return

    setSending(true)

    // Dev mode: simulate sending invitation
    setTimeout(() => {
      setSending(false)
      setSuccess(true)
      console.log('Invitation sent:', {
        callTitle,
        callType,
        scheduleDate: scheduleDate.toISOString(),
        mode,
        selectedFriends: Array.from(selectedIds),
      })
      setTimeout(() => navigate('/schedule-calls'), 1500)
    }, 800)
  }

  if (!token && !import.meta.env.DEV) return null

  return (
    <div className="send-inv-wrapper">
      <header className="send-inv-header fl-header">
        <Link to="/schedule-calls">← Back</Link>
        <h1 className="send-inv-header-title">My Friends</h1>
        <span />
      </header>

      <main className="send-inv-main">
        {/* Send Invitation Button */}
        <button
          type="button"
          className="send-inv-btn-primary"
          onClick={handleSend}
          disabled={sending || selectedIds.size === 0}
        >
          {sending ? 'Sending…' : success ? 'Invitation Sent!' : 'Send Invitation'}
        </button>

        {success && (
          <div className="send-inv-success">
            Invitation sent successfully! Redirecting…
          </div>
        )}

        {/* Call Title */}
        <div className="send-inv-field">
          <label className="send-inv-label">Call title</label>
          <input
            type="text"
            className="send-inv-input"
            placeholder="Enter call title"
            value={callTitle}
            onChange={(e) => setCallTitle(e.target.value)}
          />
        </div>

        {/* Date/Time — clickable badge that opens picker */}
        <div className="send-inv-date-wrapper">
          <button
            type="button"
            className="send-inv-date-badge"
            onClick={() => setShowPicker(true)}
          >
            {formatForDisplay(scheduleDate)}
          </button>

          {showPicker && (
            <div className="send-inv-picker-overlay" onClick={() => setShowPicker(false)}>
              <div className="send-inv-picker-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="send-inv-picker-title">Select Date & Time</h3>
                <input
                  type="datetime-local"
                  className="send-inv-picker-input"
                  value={toDatetimeLocalValue(scheduleDate)}
                  onChange={handleDateChange}
                />
                <div className="send-inv-picker-actions">
                  <button
                    type="button"
                    className="send-inv-picker-btn send-inv-picker-btn-cancel"
                    onClick={() => setShowPicker(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="send-inv-picker-btn send-inv-picker-btn-confirm"
                    onClick={() => setShowPicker(false)}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audio / Video Toggle */}
        <div className="send-inv-type-row">
          <label className="send-inv-type-option">
            <input
              type="radio"
              name="callType"
              checked={callType === 'audio'}
              onChange={() => setCallType('audio')}
            />
            <span>Audio</span>
          </label>
          <label className="send-inv-type-option">
            <input
              type="radio"
              name="callType"
              checked={callType === 'video'}
              onChange={() => setCallType('video')}
            />
            <span>Video</span>
          </label>
        </div>

        {/* Friends List */}
        {loading ? (
          <p className="send-inv-loading">Loading friends…</p>
        ) : friends.length === 0 ? (
          <p className="send-inv-empty">No friends found. Add friends first.</p>
        ) : (
          <ul className="send-inv-friend-list">
            {friends.map((friend) => {
              const id = friend._id ?? ''
              const isSelected = selectedIds.has(id)
              return (
                <li
                  key={id}
                  className={`send-inv-friend-item ${isSelected ? 'send-inv-friend-selected' : ''}`}
                  onClick={() => toggleFriend(id)}
                >
                  <img
                    src={avatarUrl(friend) || defaultAvatar}
                    alt=""
                    className="send-inv-friend-avatar"
                    onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar }}
                  />
                  <div className="send-inv-friend-info">
                    <span className="send-inv-friend-name">
                      {friend.fullName ?? '—'}
                      {friend.email ? ` <${friend.email}>` : ''}
                    </span>
                  </div>
                  <div className={`send-inv-friend-check ${isSelected ? 'send-inv-friend-check-on' : ''}`}>
                    {isSelected && '✓'}
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