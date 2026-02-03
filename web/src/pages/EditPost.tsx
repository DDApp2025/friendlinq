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
    if (!token || !postId) {
      if (!token) navigate('/login', { replace: true })
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

  if (!token) return null
  if (loading && !title && !error) {
    return (
      <div className="edit-post-wrapper">
        <header className="edit-post-header">
          <Link to="/dashboard">← Back</Link>
          <h1>Edit Post</h1>
        </header>
        <main className="edit-post-main"><p>Loading…</p></main>
      </div>
    )
  }

  return (
    <div className="edit-post-wrapper">
      <header className="edit-post-header">
        <Link to={postId ? `/post/${postId}` : '/dashboard'}>← Cancel</Link>
        <h1>Edit Post</h1>
      </header>
      <main className="edit-post-main">
        {error && (
          <div className="edit-post-error" role="alert">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="edit-post-form">
          <label className="edit-post-label">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="edit-post-input"
            placeholder="Post title"
            maxLength={200}
          />
          <label className="edit-post-label">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="edit-post-textarea"
            rows={4}
            maxLength={5000}
          />
          <button type="submit" className="edit-post-submit" disabled={saving || title.trim().length < 2}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </main>
    </div>
  )
}
