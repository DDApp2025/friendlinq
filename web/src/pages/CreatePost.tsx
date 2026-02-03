import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createPost } from '../api/posts'
import './CreatePost.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function CreatePost() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [content, setContent] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [isVideo, setIsVideo] = useState(false)
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
    if (!token) {
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
    createPost(formData, token)
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

  if (!token) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="create-post-wrapper">
      <header className="create-post-header">
        <Link to="/dashboard">← Cancel</Link>
        <h1>New Post</h1>
      </header>
      <main className="create-post-main">
        <form onSubmit={handleSubmit} className="create-post-form">
          {error && (
            <div className="create-post-error" role="alert">
              {error}
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="create-post-textarea"
            rows={4}
            maxLength={5000}
          />
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
          <div className="create-post-actions">
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
              className="create-post-add-media"
              onClick={() => fileInputRef.current?.click()}
            >
              📷 Photo / Video
            </button>
            <button
              type="submit"
              className="create-post-submit"
              disabled={loading || (content.trim().length < 2 && !mediaFile)}
            >
              {loading ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
