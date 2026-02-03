import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getFriendFeed, likeUnlikePost, deleteMyPost } from '../api/posts'
import type { Post } from '../api/types'
import './Dashboard.css'

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

export default function Dashboard() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [likeLoadingId, setLikeLoadingId] = useState<string | null>(null)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw) {
      navigate('/login', { replace: true })
      return
    }
    let user: { accessToken?: string; _id?: string }
    try {
      user = JSON.parse(raw)
    } catch {
      navigate('/login', { replace: true })
      return
    }
    const t = user.accessToken
    if (!t) {
      navigate('/login', { replace: true })
      return
    }
    setToken(t)
    setCurrentUserId(user._id ?? null)
    setLoading(true)
    setError(null)
    getFriendFeed(0, 20, t)
      .then((res) => {
        if (res.message === 'Success' && res.data) {
          setPosts(res.data.myPost ?? [])
        } else {
          setError(res.message || 'Failed to load feed.')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load feed.'))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleLike = (post: Post) => {
    if (!token || !post._id) return
    const nextLike = !post.isLike
    setLikeLoadingId(post._id)
    likeUnlikePost(post._id, nextLike, token)
      .then((res) => {
        if (res.message === 'Success') {
          setPosts((prev) =>
            prev.map((p) =>
              p._id === post._id
                ? { ...p, isLike: nextLike, totalLike: (p.totalLike ?? 0) + (nextLike ? 1 : -1) }
                : p
            )
          )
        }
      })
      .finally(() => setLikeLoadingId(null))
  }

  const handleDelete = (postId: string) => {
    if (!token || !window.confirm('Delete this post?')) return
    setDeleteLoadingId(postId)
    deleteMyPost(postId, token)
      .then((res) => {
        if (res.message === 'Success') {
          setPosts((prev) => prev.filter((p) => p._id !== postId))
        } else {
          setError(res.message || 'Failed to delete')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to delete'))
      .finally(() => setDeleteLoadingId(null))
  }

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <h1>Friendlinq</h1>
        <nav>
          <Link to="/create-post">New Post</Link>
          <Link to="/chat">Messages</Link>
          <Link to="/friends">Friends</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </header>

      <main className="dashboard-main">
        {loading && (
          <div className="dashboard-loading" aria-busy="true">
            Loading feed…
          </div>
        )}

        {error && (
          <div className="dashboard-error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="dashboard-empty">
            <p>No posts yet. Connect with friends to see their posts here.</p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <ul className="feed-list">
            {posts.map((post) => (
              <li key={post._id ?? Math.random()} className="feed-item">
                <div className="feed-item-header">
                  <img
                    src={post.postAuthor?.imageURL?.original ? `${IMAGE_BASE}/${post.postAuthor.imageURL.original}` : ''}
                    alt=""
                    className="feed-avatar"
                  />
                  <div className="feed-meta">
                    {post.postAuthor?._id ? (
                      <Link to={`/profile/${post.postAuthor._id}`} className="feed-author feed-author-link">
                        {post.postAuthor?.fullName ?? 'Unknown'}
                      </Link>
                    ) : (
                      <span className="feed-author">{post.postAuthor?.fullName ?? 'Unknown'}</span>
                    )}
                    <span className="feed-date">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                {post.postContent && <p className="feed-content">{post.postContent}</p>}
                {post.imageURL?.original && (
                  <img
                    src={`${IMAGE_BASE}/${post.imageURL.original}`}
                    alt=""
                    className="feed-media"
                  />
                )}
                {post.videoURL && (
                  <video
                    src={`${IMAGE_BASE}/${post.videoURL}`}
                    controls
                    className="feed-media"
                  />
                )}
                <div className="feed-actions">
                  <button
                    type="button"
                    className={`feed-action-btn feed-like ${post.isLike ? 'active' : ''}`}
                    onClick={() => handleLike(post)}
                    disabled={likeLoadingId === post._id}
                  >
                    {post.isLike ? 'Liked' : 'Like'} · {post.totalLike ?? 0}
                  </button>
                  <Link to={`/post/${post._id}`} className="feed-action-btn feed-comment-link">
                    Comment · {post.totalComment ?? 0}
                  </Link>
                  {currentUserId && post.postAuthor?._id === currentUserId && (
                    <button
                      type="button"
                      className="feed-action-btn feed-delete"
                      onClick={() => handleDelete(post._id!)}
                      disabled={deleteLoadingId === post._id}
                    >
                      {deleteLoadingId === post._id ? '…' : 'Delete'}
                    </button>
                  )}
                </div>
                <div className="feed-stats">
                  <span>{post.totalLike ?? 0} likes</span>
                  <span>{post.totalComment ?? 0} comments</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
