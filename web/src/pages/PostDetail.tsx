import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import {
  getPostDetail,
  getPostComment,
  postComment,
  likeUnlikePost,
  deleteMyPost,
} from '../api/posts'
import type { Post, PostComment as PostCommentType } from '../api/types'
import './Dashboard.css'
import './PostDetail.css'

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

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const commentInputRef = useRef<HTMLInputElement>(null)
  const [token, setToken] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<PostCommentType[]>([])
  const [totalComment, setTotalComment] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw && !import.meta.env.DEV) {
      navigate('/login', { replace: true })
      return
    }
    if (!raw) return
    try {
      const u = JSON.parse(raw) as { accessToken?: string; _id?: string }
      setToken(u.accessToken ?? null)
      setCurrentUserId(u._id ?? null)
    } catch {
      if (!import.meta.env.DEV) navigate('/login', { replace: true })
    }
  }, [navigate])

  const apiToken: string = token ?? (import.meta.env.DEV ? 'dev-token' : '')
  useEffect(() => {
    if ((!token && !import.meta.env.DEV) || !postId) return
    setLoading(true)
    setError(null)
    Promise.all([
      getPostDetail(postId, apiToken),
      getPostComment(postId, 0, 100, apiToken),
    ])
      .then(([detailRes, commentRes]) => {
        if (detailRes.message === 'Success' && detailRes.data?.postDetails) {
          setPost(detailRes.data.postDetails)
        } else {
          setError(detailRes.message || 'Post not found')
        }
        if (commentRes.message === 'Success' && commentRes.data) {
          setComments(commentRes.data.comments ?? [])
          setTotalComment(commentRes.data.totalComment ?? 0)
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [token, postId])

  const handleLike = () => {
    if (!token || !postId || !post) return
    const nextLike = !post.isLike
    setLikeLoading(true)
    likeUnlikePost(postId, nextLike, apiToken)
      .then((res) => {
        if (res.message === 'Success') {
          setPost((p) =>
            p
              ? {
                  ...p,
                  isLike: nextLike,
                  totalLike: (p.totalLike ?? 0) + (nextLike ? 1 : -1),
                }
              : null
          )
        }
      })
      .finally(() => setLikeLoading(false))
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !postId || !newComment.trim() || newComment.trim().length < 2) return
    setCommentLoading(true)
    postComment(postId, newComment.trim(), apiToken)
      .then((res) => {
        if (res.message === 'Success') {
          setNewComment('')
          return getPostComment(postId!, 0, 100, apiToken)
        }
      })
      .then((res) => {
        if (res?.message === 'Success' && res.data) {
          setComments(res.data.comments ?? [])
          setTotalComment(res.data.totalComment ?? 0)
          setPost((p) => (p ? { ...p, totalComment: res!.data!.totalComment } : null))
        }
      })
      .finally(() => setCommentLoading(false))
  }

  const handleDeletePost = () => {
    if (!token || !postId || !window.confirm('Delete this post?')) return
    deleteMyPost(postId, token)
      .then((res) => {
        if (res.message === 'Success') {
          navigate('/dashboard', { replace: true })
        } else {
          setError(res.message || 'Failed to delete')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to delete'))
  }

  if (!token && !import.meta.env.DEV) return null
  if (loading && !post) {
    return (
      <div className="post-detail-wrapper">
        <header className="post-detail-header fl-header">
          <Link to="/dashboard">← Back</Link>
          <h1 className="post-detail-title">Post</h1>
          <span />
        </header>
        <main className="post-detail-main">
          <p className="screen-loading">Loading…</p>
        </main>
      </div>
    )
  }
  if ((error && !post) || !post) {
    return (
      <div className="post-detail-wrapper">
        <header className="post-detail-header fl-header">
          <Link to="/dashboard">← Back</Link>
          <h1 className="post-detail-title">Post</h1>
          <span />
        </header>
        <main className="post-detail-main">
          <div className="screen-error">{error || 'Post not found'}</div>
          <Link to="/dashboard">Back to dashboard</Link>
        </main>
      </div>
    )
  }

  const isOwnPost = currentUserId && post.postAuthor?._id === currentUserId
  const authorImg = post.postAuthor?.imageURL as { original?: string } | undefined
  const authorAvatar = authorImg?.original ? `${IMAGE_BASE}/${authorImg.original}` : ''

  return (
    <div className="post-detail-wrapper">
      <header className="post-detail-header fl-header">
        <Link to="/dashboard">← Back</Link>
        <h1 className="post-detail-title">Post</h1>
        <span />
      </header>
      <main className="post-detail-main">
        <article className="post-detail-card dashboard-person-post-wrap">
          <div className="post-detail-author dashboard-person-post">
            <Link to={`/profile/${post.postAuthor?._id}`} className="dashboard-post-author-avatar">
              <img src={authorAvatar} alt="" />
            </Link>
            <div className="dashboard-post-author-meta post-detail-meta">
              <Link to={`/profile/${post.postAuthor?._id}`} className="post-detail-author-name">
                {post.postAuthor?.fullName ?? 'Unknown'}
              </Link>
              <span className="dashboard-post-date">{formatDate(post.createdAt)}</span>
            </div>
            {isOwnPost && (
              <div className="dashboard-post-menu post-detail-actions-inline">
                <Link to={`/post/${post._id}/edit`} className="post-detail-edit">Edit</Link>
                <button type="button" className="post-detail-delete" onClick={handleDeletePost}>
                  Delete
                </button>
              </div>
            )}
          </div>
          <div className="dashboard-latest-post">
            {(post.postContent || post.postTitle) && (
              <p>{post.postContent || post.postTitle}</p>
            )}
            {post.imageURL?.original && (
              <img
                src={`${IMAGE_BASE}/${post.imageURL.original}`}
                alt=""
                className="dashboard-post-media-img"
              />
            )}
            {post.videoURL && (
              <video src={`${IMAGE_BASE}/${post.videoURL}`} controls className="dashboard-post-media-video" />
            )}
          </div>
          <div className="dashboard-likecomment-section">
            <div className="dashboard-like-part">
              <p>
                <span className="dashboard-like-icon">👍</span>
                {post.totalLike ?? 0}
              </p>
            </div>
            <div className="dashboard-comment-part">
              <p>{totalComment} Comments</p>
            </div>
          </div>
          <div className="dashboard-share">
            <button
              type="button"
              className={`dashboard-share-link post-detail-like-btn ${post.isLike ? 'active' : ''}`}
              onClick={handleLike}
              disabled={likeLoading}
            >
              👍 Like
            </button>
            <span className="dashboard-share-link" style={{ cursor: 'default' }}>
              💬 Comment
            </span>
          </div>
        </article>

        <section className="post-detail-comments fl-card">
          <h2 className="post-detail-comments-title">Comments</h2>
          <form onSubmit={handleSubmitComment} className="post-detail-comment-form">
            <input
              ref={commentInputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment…"
              className="post-detail-comment-input"
              minLength={2}
              maxLength={500}
            />
            <button type="submit" className="post-detail-comment-submit" disabled={commentLoading || newComment.trim().length < 2}>
              {commentLoading ? '…' : 'Comment'}
            </button>
          </form>
          <ul className="post-detail-comment-list">
            {comments.map((c) => (
              <li key={c._id ?? Math.random()} className="post-detail-comment-item">
                <img
                  src={
                    (c.commentAuthor?.imageURL as { original?: string } | undefined)?.original
                      ? `${IMAGE_BASE}/${(c.commentAuthor?.imageURL as { original?: string }).original}`
                      : ''
                  }
                  alt=""
                  className="post-detail-comment-avatar"
                />
                <div className="post-detail-comment-body">
                  <Link to={`/profile/${c.commentAuthor?._id}`} className="post-detail-comment-author">
                    {c.commentAuthor?.fullName ?? 'Unknown'}
                  </Link>
                  <p className="post-detail-comment-text">{c.commentText}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
