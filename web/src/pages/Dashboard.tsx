import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFriendFeed } from '../api/posts'
import type { Post } from '../api/types'
import friendlinqLogo from '../assets/images/friendlinq_logo.png'
import photoImg from '../assets/images/photo.png'
import loadingGif from '../assets/images/loading.gif'
import './Dashboard.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'
const IMAGE_BASE = 'https://natural.selectnaturally.com'

function formatDate(s?: string): string {
  if (!s) return ''
  try {
    return new Date(s).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return s
  }
}

function getCurrentUserAvatar(): string {
  try {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw) return ''
    const u = JSON.parse(raw) as { imageURL?: { original?: string } }
    const path = u?.imageURL?.original
    return path ? `${IMAGE_BASE}/${path}` : ''
  } catch {
    return ''
  }
}

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState('')

  useEffect(() => {
    setUserAvatar(getCurrentUserAvatar())
  }, [])

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
    <div className="dashboard-home">
      {/* Header: logo + FriendLinq + profile pic */}
      <header className="dashboard-header-bar">
        <Link to="/dashboard" className="dashboard-brand">
          <img src={friendlinqLogo} alt="FriendLinq" className="dashboard-logo" />
          <span className="dashboard-brand-text">FriendLinq</span>
        </Link>
        <Link to="/profile" className="dashboard-profile-pic">
          {userAvatar ? (
            <img src={userAvatar} alt="" />
          ) : (
            <div className="dashboard-avatar-placeholder" aria-hidden />
          )}
        </Link>
      </header>

      {/* Composer: What's on your mind + Post, Friends/Community, Photo | Video | See Friends Posts */}
      <section className="dashboard-composer">
        <div className="dashboard-post-row">
          <Link to="/profile" className="dashboard-composer-avatar">
            {userAvatar ? (
              <img src={userAvatar} alt="" />
            ) : (
              <div className="dashboard-avatar-placeholder" aria-hidden />
            )}
          </Link>
          <Link to="/create-post" className="dashboard-composer-input">
            What's on your mind.
          </Link>
          <Link to="/create-post" className="dashboard-post-btn">
            Post
          </Link>
        </div>
        <div className="dashboard-post-public">
          <label className="dashboard-radio-label">
            <input type="radio" name="audience" defaultChecked />
            <span>Friends</span>
          </label>
          <label className="dashboard-radio-label">
            <input type="radio" name="audience" />
            <span>Community</span>
          </label>
        </div>
        <div className="dashboard-public-post">
          <Link to="/create-post" className="dashboard-media-option">
            <img src={photoImg} alt="" className="dashboard-icon-photo-img" />
            Photo
          </Link>
          <Link to="/create-post" className="dashboard-media-option">
            <span className="dashboard-icon-video" aria-hidden />
            Video
          </Link>
          <button type="button" className="dashboard-see-friends-btn">
            See Friends Posts
          </button>
        </div>
      </section>

      {/* Feed: loading / error / empty / post list */}
      <main className="dashboard-main">
        {error && (
          <div className="dashboard-error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="dashboard-loading">
            <img src={loadingGif} alt="" className="dashboard-loading-gif" />
          </div>
        ) : posts.length === 0 ? (
          <p className="dashboard-empty">
            No posts yet. Create a post or add friends to see their posts.
          </p>
        ) : (
          <div className="dashboard-people-all-comment">
            {posts.map((post) => (
              <article key={post._id ?? Math.random()} className="dashboard-person-post-wrap">
                <div className="dashboard-person-post">
                  <p className="dashboard-post-author-avatar">
                    {post.postAuthor?.imageURL?.original ? (
                      <img
                        src={`${IMAGE_BASE}/${post.postAuthor.imageURL.original}`}
                        alt=""
                      />
                    ) : (
                      <span className="dashboard-avatar-placeholder small" aria-hidden />
                    )}
                  </p>
                  <p className="dashboard-post-author-meta">
                    {post.postAuthor?._id ? (
                      <Link to={`/profile/${post.postAuthor._id}`}>
                        {post.postAuthor.fullName ?? 'Unknown'}
                      </Link>
                    ) : (
                      post.postAuthor?.fullName ?? 'Unknown'
                    )}
                    <span className="dashboard-post-date">{formatDate(post.createdAt)}</span>
                  </p>
                  <p className="dashboard-post-menu">
                    <span className="dashboard-ellipsis" aria-hidden>⋮</span>
                  </p>
                </div>
                <div className="dashboard-latest-post">
                  {(post.postContent || post.postTitle) && (
                    <p>{post.postContent || post.postTitle}</p>
                  )}
                  {post.imageURL?.original && (
                    <p>
                      <img
                        src={`${IMAGE_BASE}/${post.imageURL.original}`}
                        alt=""
                        className="dashboard-post-media-img"
                      />
                    </p>
                  )}
                  {post.videoURL && (
                    <p>
                      <video
                        src={`${IMAGE_BASE}/${post.videoURL}`}
                        controls
                        className="dashboard-post-media-video"
                      />
                    </p>
                  )}
                </div>
                <div className="dashboard-likecomment-section">
                  <div className="dashboard-like-part">
                    <p>
                      <span className="dashboard-like-icon" aria-hidden>👍</span>{' '}
                      {post.totalLike ?? 0}
                    </p>
                  </div>
                  <div className="dashboard-comment-part">
                    <p>{post.totalComment ?? 0} Comments</p>
                  </div>
                </div>
                <div className="dashboard-share">
                  <div className="dashboard-like-part">
                    <p>
                      {post._id && (
                        <Link to={`/post/${post._id}`} className="dashboard-share-link">
                          <span className="dashboard-like-icon" aria-hidden>👍</span> Like
                        </Link>
                      )}
                    </p>
                  </div>
                  <div className="dashboard-comment-part">
                    <p>
                      {post._id && (
                        <Link to={`/post/${post._id}`} className="dashboard-share-link">
                          💬 Comment
                        </Link>
                      )}
                    </p>
                  </div>
                  <div className="dashboard-comment-part">
                    <p>
                      <Link to={`/post/${post._id}`} className="dashboard-share-link">
                        Share
                      </Link>
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
