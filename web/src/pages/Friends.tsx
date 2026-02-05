import { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import {
  getFriendList,
  sendFriendRequest,
  acceptFriendRequest,
  searchUser,
} from '../api/friends'
import { FRIEND_LIST_STATUS } from '../api/types'
import type { CustomerData } from '../api/types'
import ProfileEditLayout from '../components/ProfileEditLayout'
import { getCurrentUser, updateCurrentUserProfile } from '../lib/devProfilePersistence'
import './Friends.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'
const IMAGE_BASE = 'https://natural.selectnaturally.com'

type Tab = 'suggestions' | 'requests' | 'sent' | 'friends'

function avatarUrl(user: CustomerData): string {
  const img = user?.imageURL as { original?: string; thumbnail?: string } | undefined
  const path = img?.original ?? img?.thumbnail
  return path ? `${IMAGE_BASE}/${path}` : ''
}

export default function Friends() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromProfile = searchParams.get('from') === 'profile'
  const topFourMode = searchParams.get('mode') === 'topFour'

  const [token, setToken] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>(fromProfile && topFourMode ? 'friends' : 'suggestions')
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set())
  const [requests, setRequests] = useState<CustomerData[]>([])
  const [sent, setSent] = useState<CustomerData[]>([])
  const [friends, setFriends] = useState<CustomerData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CustomerData[]>([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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
    setError(null)
    Promise.all([
      getFriendList(0, 100, FRIEND_LIST_STATUS.INVITATION, apiToken),
      getFriendList(0, 100, FRIEND_LIST_STATUS.SEND, apiToken),
      getFriendList(0, 100, FRIEND_LIST_STATUS.ACCEPTED, apiToken),
    ])
      .then(([invRes, sendRes, accRes]) => {
        if (invRes.message === 'Success' && invRes.data) setRequests(invRes.data.friendList ?? [])
        if (sendRes.message === 'Success' && sendRes.data) setSent(sendRes.data.friendList ?? [])
        if (accRes.message === 'Success' && accRes.data) setFriends(accRes.data.friendList ?? [])
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [apiToken])

  // Load previously saved top four friends from persistence layer
  useEffect(() => {
    if (fromProfile && topFourMode) {
      const u = getCurrentUser() as any
      const stored = (u?.topFourFriends as CustomerData[] | undefined) ?? []
      setSelectedFriendIds(new Set(stored.map((f: any) => f._id ?? '').filter(Boolean)))
    }
  }, [fromProfile, topFourMode])

  const handleSearch = () => {
    if (!apiToken || !searchQuery.trim()) return
    setSearching(true)
    searchUser(searchQuery.trim(), 0, 30, apiToken)
      .then((res) => {
        if (res.message === 'Success' && res.data?.customerData) {
          setSearchResults(res.data.customerData)
        } else {
          setSearchResults([])
        }
      })
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false))
  }

  const handleAddFriend = (userToId: string) => {
    const t = token ?? (import.meta.env.DEV ? 'dev-token' : '')
    if (!t) return
    setActionLoading(userToId)
    sendFriendRequest(userToId, apiToken)
      .then((res) => {
        if (res.message === 'Success') {
          setRequests((prev) => prev.filter((u) => u._id !== userToId))
          setSearchResults((prev) => prev.filter((u) => u._id !== userToId))
          getFriendList(0, 100, FRIEND_LIST_STATUS.ACCEPTED, apiToken).then((accRes) => {
            if (accRes.message === 'Success' && accRes.data?.friendList) {
              setFriends(accRes.data.friendList)
            }
          })
        } else {
          setError(res.message || 'Failed to send request')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to send request'))
      .finally(() => setActionLoading(null))
  }

  const handleAccept = (userToId: string) => {
    if (!apiToken) return
    setActionLoading(userToId)
    acceptFriendRequest(userToId, 'ACCEPTED', apiToken)
      .then((res) => {
        if (res.message === 'Success') {
          setRequests((prev) => prev.filter((u) => u._id !== userToId))
          getFriendList(0, 100, FRIEND_LIST_STATUS.ACCEPTED, apiToken).then((accRes) => {
            if (accRes.message === 'Success' && accRes.data?.friendList) {
              setFriends(accRes.data.friendList)
            }
          })
        } else {
          setError(res.message || 'Failed to accept')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to accept'))
      .finally(() => setActionLoading(null))
  }

  const handleReject = (userToId: string) => {
    if (!apiToken) return
    setActionLoading(userToId)
    acceptFriendRequest(userToId, 'REJECTED', apiToken)
      .then((res) => {
        if (res.message === 'Success') {
          setRequests((prev) => prev.filter((u) => u._id !== userToId))
        }
      })
      .finally(() => setActionLoading(null))
  }

  const toggleTopFourFriend = (user: CustomerData) => {
    const id = user._id ?? ''
    setSelectedFriendIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 4) next.add(id)
      return next
    })
  }

  const handleSaveTopFour = () => {
    const selected = friends.filter((u) => selectedFriendIds.has(u._id ?? ''))
    // Save through the persistence layer
    updateCurrentUserProfile({ topFourFriends: selected })
    navigate('/profile')
  }

  if (!token && !import.meta.env.DEV) return null

  const displayList =
    tab === 'suggestions'
      ? searchResults
      : tab === 'requests'
        ? requests
        : tab === 'sent'
          ? sent
          : friends

  const mainContent = (
    <main className="friends-main">
        {fromProfile && topFourMode && (
          <p className="friends-top-four-message">
            Select up to 4 favorite friends to show on your profile page.
          </p>
        )}
        {error && (
          <div className="friends-error" role="alert">
            {error}
          </div>
        )}

        <div className="friends-tabs">
          <button
            type="button"
            className={`friends-tab ${tab === 'suggestions' ? 'active' : ''}`}
            onClick={() => setTab('suggestions')}
          >
            Search
          </button>
          <button
            type="button"
            className={`friends-tab ${tab === 'requests' ? 'active' : ''}`}
            onClick={() => setTab('requests')}
          >
            Requests {requests.length > 0 ? `(${requests.length})` : ''}
          </button>
          <button
            type="button"
            className={`friends-tab ${tab === 'sent' ? 'active' : ''}`}
            onClick={() => setTab('sent')}
          >
            Sent
          </button>
          <button
            type="button"
            className={`friends-tab ${tab === 'friends' ? 'active' : ''}`}
            onClick={() => setTab('friends')}
          >
            My Friends
          </button>
        </div>

        {tab === 'suggestions' && (
          <div className="friends-search-box">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name or email"
              className="friends-search-input"
            />
            <button type="button" className="friends-search-btn" onClick={handleSearch} disabled={searching}>
              {searching ? '…' : 'Search'}
            </button>
          </div>
        )}

        {loading && tab !== 'suggestions' ? (
          <p className="friends-loading">Loading…</p>
        ) : (
          <ul className="friends-list">
            {tab === 'suggestions' && !searchQuery.trim() && searchResults.length === 0 && (
              <p className="friends-empty">Use the search above to find people to add as friends.</p>
            )}
            {tab === 'suggestions' && searchQuery.trim() && !searching && searchResults.length === 0 && (
              <p className="friends-empty">No results found.</p>
            )}
            {displayList.map((user) => {
              const isSelected = topFourMode && tab === 'friends' && selectedFriendIds.has(user._id ?? '')
              return (
              <li key={user._id ?? ''} className={`friends-list-item ${isSelected ? 'friends-list-item-selected' : ''}`}>
                {fromProfile && topFourMode && tab === 'friends' ? (
                  <button
                    type="button"
                    className="friends-item-checkbox"
                    onClick={() => toggleTopFourFriend(user)}
                    aria-pressed={isSelected}
                    aria-label={isSelected ? 'Deselect' : 'Select'}
                  >
                    {isSelected ? '✓' : ''}
                  </button>
                ) : (
                  <Link to={`/profile/${user._id}`} className="friends-item-avatar-wrap">
                    <img
                      src={avatarUrl(user)}
                      alt=""
                      className="friends-item-avatar"
                    />
                  </Link>
                )}
                <div className="friends-item-info">
                  {tab === 'friends' && fromProfile && topFourMode ? (
                    <span className="friends-item-name">{user.fullName ?? '—'}</span>
                  ) : (
                    <Link to={`/profile/${user._id}`} className="friends-item-name">
                      {user.fullName ?? '—'}
                    </Link>
                  )}
                  <span className="friends-item-email">{user.email ?? ''}</span>
                </div>
                <div className="friends-item-actions">
                  {tab === 'suggestions' && !topFourMode && (
                    <button
                      type="button"
                      className="friends-btn friends-btn-add"
                      onClick={() => handleAddFriend(user._id!)}
                      disabled={!!(actionLoading && actionLoading === user._id) || (user as CustomerData & { isFriend?: boolean }).isFriend || (user as CustomerData & { isFriendRequestSend?: boolean }).isFriendRequestSend}
                    >
                      {(user as CustomerData & { isFriendRequestSend?: boolean }).isFriendRequestSend
                        ? 'Sent'
                        : (user as CustomerData & { isFriend?: boolean }).isFriend
                          ? 'Friends'
                          : actionLoading === user._id
                            ? '…'
                            : 'Add Friend'}
                    </button>
                  )}
                  {tab === 'requests' && !topFourMode && (
                    <>
                      <button
                        type="button"
                        className="friends-btn friends-btn-accept"
                        onClick={() => handleAccept(user._id!)}
                        disabled={actionLoading === user._id}
                      >
                        {actionLoading === user._id ? '…' : 'Accept'}
                      </button>
                      <button
                        type="button"
                        className="friends-btn friends-btn-reject"
                        onClick={() => handleReject(user._id!)}
                        disabled={actionLoading === user._id}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {tab === 'sent' && !topFourMode && <span className="friends-item-status">Request sent</span>}
                  {tab === 'friends' && !fromProfile && !topFourMode && <Link to={`/profile/${user._id}`} className="friends-item-view">View profile</Link>}
                  {tab === 'friends' && fromProfile && topFourMode && (
                    <span className="friends-item-selected-label">{isSelected ? 'Selected' : ''}</span>
                  )}
                </div>
              </li>
            )
            })}
          </ul>
        )}
        {fromProfile && topFourMode && (
          <div className="friends-save-wrap">
            <button
              type="button"
              className="friends-btn friends-btn-save"
              onClick={handleSaveTopFour}
              disabled={selectedFriendIds.size === 0}
            >
              Save
            </button>
          </div>
        )}
      </main>
  )

  if (fromProfile && topFourMode) {
    return (
      <ProfileEditLayout title="Top four friends">
        <div className="friends-wrapper">
          {mainContent}
        </div>
      </ProfileEditLayout>
    )
  }

  return (
    <div className="friends-wrapper">
      <header className="friends-header fl-header">
        <Link to="/dashboard">← Back</Link>
        <h1 className="friends-header-title">Add Friends</h1>
        <span />
      </header>
      {mainContent}
    </div>
  )
}