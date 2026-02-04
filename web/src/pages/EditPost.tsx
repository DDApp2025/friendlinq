import { useEffect, useState } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { getPostDetail, editPost } from '../api/posts'
import './EditPost.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function EditPost() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [userAvatar, setUserAvatar] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  const token = (() => {
    if (!raw) return null
    try {
      const u = JSON.parse(raw) as { accessToken?: string; _id?: string }
      return u.accessToken ?? null
    } catch {
      return null
    }
  })()
  const currentUserId = raw ? (() => {
    try {
      const u = JSON.parse(raw) as { _id?: string }
      return u._id ?? null
    } catch {
      return null
    }
  })() : null

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
      if (!raw) return
      const u = JSON.parse(raw) as { imageURL?: { original?: string } }
      const path = u?.imageURL?.original
      setUserAvatar(path ? `https://natural.selectnaturally.com/${path}` : '')
    } catch {
      setUserAvatar('')
    }
  }, [])

  useEffect(() => {
    if (!token || !postId) {
      if (!token && !import.meta.env.DEV) navigate('/login', { replace: true })
      return
    }
    setLoading(true)
    getPostDetail(postId, token)
      .then((res) => {
        if (res.message === 'Success' && res.data?.postDetails) {
          const p = res.data.postDetails
          if (currentUserId && p.postAuthor?._id !== currentUserId) {
            setError('You can only edit your own post.')
            return
          }
          setTitle(p.postTitle ?? p.postContent ?? '')
          setContent(p.postContent ?? p.postTitle ?? '')
        } else {
          setError(res.message || 'Post not found')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [token, postId, currentUserId, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !postId) return
    const t = title.trim().slice(0, 100) || content.trim().slice(0, 100) || 'Post'
    if (t.length < 2) {
      setError('Title must be at least 2 characters.')
      return
    }
    setSaving(true)
    setError(null)
    const formData = new FormData()
    formData.append('postId', postId)
    formData.append('postTitle', t)
    formData.append('postContent', content.trim())
    formData.append('isMediaFileUploaded', 'false')
    formData.append('isMediaTypeVideo', 'false')
    editPost(formData, token)
      .then((res) => {
        if (res.message === 'Success') {
          navigate(`/post/${postId}`, { replace: true })
        } else {
          setError(res.message || 'Failed to update')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to update'))
      .finally(() => setSaving(false))
  }

  if (!token && !import.meta.env.DEV) return null
  if (loading && !title && !error) {
    return (
      <div className="edit-post-wrapper">
        <header className="edit-post-header fl-header">
          <Link to={postId ? `/post/${postId}` : '/dashboard'}>← Cancel</Link>
          <h1 className="edit-post-title">Edit Post</h1>
          <span />
        </header>
        <main className="edit-post-main"><p className="screen-loading">Loading…</p></main>
      </div>
    )
  }

  return (
    <div className="edit-post-wrapper">
      <header className="edit-post-header fl-header">
        <Link to={postId ? `/post/${postId}` : '/dashboard'}>← Cancel</Link>
        <h1 className="edit-post-title">Edit Post</h1>
        <span />
      </header>
      <main className="edit-post-main">
        <section className="edit-post-composer dashboard-composer">
          {error && (
            <div className="edit-post-error screen-error" role="alert">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="edit-post-form">
            <div className="dashboard-post-row edit-post-row">
              <div className="dashboard-composer-avatar">
                {userAvatar ? (
                  <img src={userAvatar} alt="" />
                ) : (
                  <div className="dashboard-avatar-placeholder" aria-hidden />
                )}
              </div>
              <div className="edit-post-fields">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="edit-post-input"
                  placeholder="Post title"
                  maxLength={200}
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="edit-post-textarea"
                  rows={4}
                  placeholder="What's on your mind?"
                  maxLength={5000}
                />
              </div>
            </div>
            <div className="edit-post-actions">
              <button type="submit" className="dashboard-post-btn edit-post-submit" disabled={saving || title.trim().length < 2}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
