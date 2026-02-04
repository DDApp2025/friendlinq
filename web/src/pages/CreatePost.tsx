import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createPost } from '../api/posts'
import './Dashboard.css'
import './CreatePost.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'
const IMAGE_BASE = 'https://natural.selectnaturally.com'

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

export default function CreatePost() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [content, setContent] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [isVideo, setIsVideo] = useState(false)
  const [userAvatar, setUserAvatar] = useState('')
  const [audience, setAudience] = useState<'FRIEND_ONLY' | 'Public'>('FRIEND_ONLY')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  const token = (() => {
    if (!raw) return null
    try {
      const u = JSON.parse(raw) as { accessToken?: string }
      return u.accessToken ?? null
    } catch {
      return null
    }
  })()
  const apiToken = token ?? (import.meta.env.DEV ? 'dev-token' : '')

  useEffect(() => {
    setUserAvatar(getCurrentUserAvatar())
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const isVideoFile = file.type.startsWith('video/')
    setMediaFile(file)
    setIsVideo(isVideoFile)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token && !import.meta.env.DEV) {
      navigate('/login', { replace: true })
      return
    }
    const title = content.trim().slice(0, 100) || 'New post'
    if (title.length < 2) {
      setError('Post content must be at least 2 characters.')
      return
    }
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('postTitle', title)
    formData.append('postContent', content.trim())
    formData.append('postType', 'FRIEND_ONLY')
    formData.append('isMediaFileUploaded', mediaFile ? 'true' : 'false')
    formData.append('isMediaTypeVideo', isVideo ? 'true' : 'false')
    if (mediaFile) {
      formData.append('mediaFile', mediaFile)
    }
    createPost(formData, apiToken)
      .then((res) => {
        if (res.message === 'Success') {
          navigate('/dashboard', { replace: true })
        } else {
          setError(res.message || 'Failed to create post')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to create post'))
      .finally(() => setLoading(false))
  }

  if (!token && !import.meta.env.DEV) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="create-post-wrapper">
      <header className="create-post-header fl-header">
        <Link to="/dashboard">← Cancel</Link>
        <h1 className="create-post-title">New Post</h1>
        <span />
      </header>
      <main className="create-post-main">
        <section className="create-post-composer dashboard-composer">
          {error && (
            <div className="create-post-error screen-error" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="create-post-form">
            <div className="dashboard-post-row create-post-row">
              <Link to="/profile" className="dashboard-composer-avatar">
                {userAvatar ? (
                  <img src={userAvatar} alt="" />
                ) : (
                  <div className="dashboard-avatar-placeholder" aria-hidden />
                )}
              </Link>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind."
                className="dashboard-composer-input create-post-textarea"
                rows={3}
                maxLength={5000}
              />
              <button
                type="submit"
                className="dashboard-post-btn"
                disabled={loading || (content.trim().length < 2 && !mediaFile)}
              >
                {loading ? 'Posting…' : 'Post'}
              </button>
            </div>
            <div className="dashboard-post-public create-post-audience">
              <label className="dashboard-radio-label">
                <input
                  type="radio"
                  name="audience"
                  checked={audience === 'FRIEND_ONLY'}
                  onChange={() => setAudience('FRIEND_ONLY')}
                />
                <span>Friends</span>
              </label>
              <label className="dashboard-radio-label">
                <input
                  type="radio"
                  name="audience"
                  checked={audience === 'Public'}
                  onChange={() => setAudience('Public')}
                />
                <span>Community</span>
              </label>
            </div>
            {mediaFile && (
              <div className="create-post-preview">
                {isVideo ? (
                  <video src={URL.createObjectURL(mediaFile)} controls className="create-post-preview-media" />
                ) : (
                  <img src={URL.createObjectURL(mediaFile)} alt="" className="create-post-preview-media" />
                )}
                <button
                  type="button"
                  className="create-post-remove-media"
                  onClick={() => setMediaFile(null)}
                >
                  Remove
                </button>
              </div>
            )}
            <div className="dashboard-public-post create-post-media-row">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="create-post-file-input"
                aria-hidden
              />
              <button
                type="button"
                className="dashboard-media-option dashboard-icon-photo"
                onClick={() => fileInputRef.current?.click()}
              >
                Photo
              </button>
              <button
                type="button"
                className="dashboard-media-option dashboard-icon-video"
                onClick={() => fileInputRef.current?.click()}
              >
                Video
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
