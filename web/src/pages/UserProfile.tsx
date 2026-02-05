import { useEffect, useState } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { getProfileOfAnotherUser } from '../api/profile'
import { getAnotherUsersPost } from '../api/posts'
import type { CustomerData, Post } from '../api/types'
import bannerFallback from '../assets/images/banner1.jpg'
import './UserProfile.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'
const IMAGE_BASE = 'https://natural.selectnaturally.com'

function formatDate(s?: string): string {
  if (!s) return ''
  try {
    const d = new Date(s)
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit', hour: 'numeric', minute: '2-digit' })
  } catch {
    return s
  }
}

function avatarUrl(user: CustomerData | undefined): string {
  if (!user?.imageURL || typeof user.imageURL !== 'object') return ''
  const orig = (user.imageURL as { original?: string }).original
  return orig ? `${IMAGE_BASE}/${orig}` : ''
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)

  const token = (() => {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw) return null
    try {
      const u = JSON.parse(raw) as { accessToken?: string; _id?: string }
      return u.accessToken ?? null
    } catch {
      return null
    }
  })()
  const apiToken = token ?? (import.meta.env.DEV ? 'dev-token' : '')

  useEffect(() => {
    if (!token && !import.meta.env.DEV) {
      navigate('/login', { replace: true })
      return
    }
    if (!userId) {
      setError('User not specified')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    getProfileOfAnotherUser(apiToken, userId)
      .then((res) => {
        if (res.message === 'Success' && res.data?.customerData) {
          setUser(res.data.customerData)
        } else {
          setError(res.message || 'User not found')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false))

    getAnotherUsersPost(userId, 0, 50, apiToken)
      .then((res) => {
        if (res.message === 'Success' && res.data?.myPost) {
          setPosts((res.data.myPost as Post[]).slice().reverse())
        }
      })
      .catch(() => {})
      .finally(() => setPostsLoading(false))
  }, [navigate, token, userId])

  if (!token && !import.meta.env.DEV) return null
  if (loading && !user) {
    return (
      <div className="user-profile-wrapper">
        <header className="user-profile-header fl-header">
          <Link to="/friends">← Back</Link>
          <h1 className="user-profile-header-title">Profile</h1>
          <span />
        </header>
        <main className="user-profile-main">
          <p className="screen-loading">Loading…</p>
        </main>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="user-profile-wrapper">
        <header className="user-profile-header fl-header">
          <Link to="/friends">← Back</Link>
          <h1 className="user-profile-header-title">Profile</h1>
          <span />
        </header>
        <main className="user-profile-main">
          <div className="screen-error" role="alert">{error}</div>
          <Link to="/dashboard" className="user-profile-back-link">Back to dashboard</Link>
        </main>
      </div>
    )
  }

  const photoUrl = avatarUrl(user ?? undefined)

  return (
    <div className="user-profile-wrapper">
      <header className="user-profile-header fl-header">
        <Link to="/friends">← Back</Link>
        <h1 className="user-profile-header-title">{user?.fullName ?? 'Profile'}</h1>
        <span />
      </header>

      <main className="user-profile-main">
        <div className="user-profile-banner">
          <div className="user-profile-banner-img-wrap">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="user-profile-banner-img" />
            ) : (
              <img src={bannerFallback} alt="" className="user-profile-banner-img user-profile-banner-fallback" />
            )}
          </div>
        </div>

        <section className="user-profile-section">
          <h2 className="user-profile-section-title">Account details</h2>
          <div className="user-profile-details-list">
            <div className="user-profile-detail-row">
              <span className="user-profile-detail-label">Name</span>
              <span className="user-profile-detail-value">{user?.fullName ?? '—'}</span>
            </div>
            <div className="user-profile-detail-row">
              <span className="user-profile-detail-label">Location</span>
              <span className="user-profile-detail-value">{(user?.country as string) ?? '—'}</span>
            </div>
            <div className="user-profile-detail-row">
              <span className="user-profile-detail-label">Gender</span>
              <span className="user-profile-detail-value">{(user?.gender as string) ?? '—'}</span>
            </div>
            <div className="user-profile-detail-row">
              <span className="user-profile-detail-label">State</span>
              <span className="user-profile-detail-value">{(user?.state as string) ?? '—'}</span>
            </div>
            <div className="user-profile-detail-row">
              <span className="user-profile-detail-label">City</span>
              <span className="user-profile-detail-value">{(user?.city as string) ?? '—'}</span>
            </div>
            <div className="user-profile-detail-row">
              <span className="user-profile-detail-label">Email</span>
              <span className="user-profile-detail-value">{user?.email ?? '—'}</span>
            </div>
            <div className="user-profile-detail-row">
              <span className="user-profile-detail-label">Phone</span>
              <span className="user-profile-detail-value">{(user?.phoneNumber as string) ?? '—'}</span>
            </div>
            {userId && (
              <div className="user-profile-detail-row user-profile-actions">
                <span className="user-profile-detail-label" />
                <div className="user-profile-calling-option">
                  <Link to={`/chat/${userId}`} className="user-profile-action-link" title="Chat">💬 Chat</Link>
                  <Link to="/schedule-calls" className="user-profile-action-link" title="Call">📞 Call</Link>
                  <Link to="/schedule-calls" className="user-profile-action-link" title="Video">📹 Video</Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="user-profile-section user-profile-section-posts">
          <h2 className="user-profile-section-title">Post</h2>
          {postsLoading ? (
            <p className="user-profile-posts-loading">Loading posts…</p>
          ) : posts.length === 0 ? (
            <p className="user-profile-posts-empty">No posts yet.</p>
          ) : (
            <ul className="user-profile-posts-list">
              {posts.map((post) => (
                <li key={post._id ?? Math.random()} className="user-profile-post-item">
                  <div className="user-profile-post-meta">
                    <span className="user-profile-post-author">{post.postAuthor?.fullName ?? 'Unknown'}</span>
                    <span className="user-profile-post-date">{formatDate(post.createdAt)}</span>
                  </div>
                  {post.postContent && <p className="user-profile-post-content">{post.postContent}</p>}
                  {post.imageURL?.original && (
                    <img
                      src={`${IMAGE_BASE}/${post.imageURL.original}`}
                      alt=""
                      className="user-profile-post-media"
                    />
                  )}
                  {post.videoURL && (
                    <video src={`${IMAGE_BASE}/${post.videoURL}`} controls className="user-profile-post-media" />
                  )}
                  <div className="user-profile-post-stats">
                    {post.totalLike ?? 0} likes · {post.totalComment ?? 0} comments
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
