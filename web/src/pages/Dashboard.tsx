import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFriendFeed } from '../api/posts'
import type { Post } from '../api/types'
import './Dashboard.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'
const IMAGE_BASE = 'https://natural.selectnaturally.com'

function formatDate(s?: string): string {
  if (!s) return ''
  try {
    return new Date(s).toLocaleString()
  } catch {
    return s
  }
}

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw) return
    let token: string | null = null
    try {
      const u = JSON.parse(raw) as { accessToken?: string }
      token = u.accessToken ?? null
    } catch {
      setLoading(false)
      return
    }
    if (!token) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    getFriendFeed(0, 50, token)
      .then((res) => {
        if (res.message === 'Success' && res.data?.myPost) {
          setPosts(res.data.myPost)
        } else {
          setPosts([])
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load feed')
        setPosts([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="dashboard-actions">
        <Link to="/create-post">New Post</Link>
      </div>

      {error && (
        <div className="dashboard-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="dashboard-loading">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="dashboard-empty">No posts yet. Create a post or add friends to see their posts.</p>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <div key={post._id ?? Math.random()} className="post-card">
              <div className="post-author">
                {post.postAuthor?._id ? (
                  <Link to={`/profile/${post.postAuthor._id}`}>{post.postAuthor.fullName ?? 'Unknown'}</Link>
                ) : (
                  post.postAuthor?.fullName ?? 'Unknown'
                )}
              </div>
              {(post.postContent || post.postTitle) && (
                <div className="post-content">{post.postContent || post.postTitle}</div>
              )}
              {post._id && (
                <Link to={`/post/${post._id}`} className="post-link">
                  View post
                </Link>
              )}
              {post.imageURL?.original && (
                <img
                  src={`${IMAGE_BASE}/${post.imageURL.original}`}
                  alt=""
                  className="post-media"
                />
              )}
              {post.videoURL && (
                <video src={`${IMAGE_BASE}/${post.videoURL}`} controls className="post-media" />
              )}
              <div className="post-date">{formatDate(post.createdAt)}</div>
              <div className="post-stats">
                {post.totalLike ?? 0} likes · {post.totalComment ?? 0} comments
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
