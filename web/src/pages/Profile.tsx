import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getProfile, saveProfileData, uploadProfilePic } from '../api/profile'
import { getMyPost } from '../api/posts'
import type { CustomerData, Post, SaveProfilePayload } from '../api/types'
import { COUNTRY_OPTIONS, GENDER_OPTIONS } from '../constants/profile'
import './Profile.css'

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

export default function Profile() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [form, setForm] = useState<SaveProfilePayload>({})
  const [saveLoading, setSaveLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)

  const token = (() => {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw) return null
    try {
      const u = JSON.parse(raw) as { accessToken?: string }
      return u.accessToken ?? null
    } catch {
      return null
    }
  })()

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
      return
    }
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CustomerData & { accessToken?: string }
        setUser(parsed)
      } catch {
        // ignore
      }
    }
    setLoading(true)
    setError(null)
    getProfile(token)
      .then((res) => {
        if (res.message === 'Success' && res.data?.customerData) {
          setUser((prev) => ({ ...res.data!.customerData, accessToken: prev?.accessToken ?? token }))
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false))

    getMyPost(0, 50, token)
      .then((res) => {
        if (res.message === 'Success' && res.data?.myPost) {
          setMyPosts(res.data.myPost)
        }
      })
      .catch(() => {})
      .finally(() => setPostsLoading(false))
  }, [navigate, token])

  const handleEdit = () => {
    setIsEdit(true)
    setForm({
      fullName: user?.fullName ?? '',
      country: (user?.country as string) ?? '',
      gender: (user?.gender as string) ?? '',
      state: (user?.state as string) ?? '',
      city: (user?.city as string) ?? '',
      phoneNumber: (user?.phoneNumber as string) ?? '',
    })
  }

  const handleCancel = () => {
    setIsEdit(false)
    setForm({})
  }

  const handleSave = () => {
    if (!token) return
    setSaveLoading(true)
    saveProfileData(token, form)
      .then((res) => {
        if (res.message === 'Success' && res.data?.customerData) {
          const updated = { ...res.data.customerData, accessToken: token }
          sessionStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(updated))
          setUser(updated)
          setIsEdit(false)
          setForm({})
        } else {
          setError(res.message || 'Save failed')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Save failed'))
      .finally(() => setSaveLoading(false))
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return
    e.target.value = ''
    setUploadLoading(true)
    uploadProfilePic(token, file)
      .then((res) => {
        if (res.message === 'Success' && res.data) {
          const updated = { ...res.data, accessToken: token }
          sessionStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(updated))
          setUser(updated)
        } else {
          setError(res.message || 'Upload failed')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Upload failed'))
      .finally(() => setUploadLoading(false))
  }

  const handleLogout = () => {
    sessionStorage.removeItem(LOGGED_IN_USER_KEY)
    navigate('/login', { replace: true })
  }

  if (!token) return null
  if (loading && !user) {
    return (
      <div className="profile-wrapper">
        <header className="profile-header">
          <Link to="/dashboard">← Back</Link>
          <h1>Profile</h1>
        </header>
        <main className="profile-main">
          <p className="profile-loading">Loading…</p>
        </main>
      </div>
    )
  }

  const photoUrl = avatarUrl(user ?? undefined)

  return (
    <div className="profile-wrapper">
      <header className="profile-header">
        <Link to="/dashboard">← Back</Link>
        <h1>Profile</h1>
      </header>

      <main className="profile-main">
        {error && (
          <div className="profile-error" role="alert">
            {error}
          </div>
        )}

        <div className="profile-banner">
          <div className="profile-banner-img-wrap">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="profile-banner-img" />
            ) : (
              <div className="profile-banner-placeholder" />
            )}
            <button
              type="button"
              className="profile-banner-upload"
              onClick={handlePhotoClick}
              disabled={uploadLoading}
              title="Change photo"
            >
              {uploadLoading ? '…' : '📷'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="profile-file-input"
            onChange={handlePhotoChange}
            aria-hidden
          />
        </div>

        <section className="profile-section">
          <h2 className="profile-section-title">General account settings</h2>
          <div className="profile-details-list">
            <div className="profile-detail-row">
              <span className="profile-detail-label">Name</span>
              {!isEdit ? (
                <span className="profile-detail-value">{user?.fullName ?? '—'}</span>
              ) : (
                <input
                  type="text"
                  value={form.fullName ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="profile-detail-input"
                  placeholder="Full name"
                />
              )}
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Location</span>
              {!isEdit ? (
                <span className="profile-detail-value">{(user?.country as string) ?? '—'}</span>
              ) : (
                <select
                  value={form.country ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  className="profile-detail-input"
                >
                  <option value="">Choose country</option>
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Gender</span>
              {!isEdit ? (
                <span className="profile-detail-value">{(user?.gender as string) ?? '—'}</span>
              ) : (
                <select
                  value={form.gender ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  className="profile-detail-input"
                >
                  <option value="">Choose gender</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">State</span>
              {!isEdit ? (
                <span className="profile-detail-value">{(user?.state as string) ?? '—'}</span>
              ) : (
                <input
                  type="text"
                  value={form.state ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  className="profile-detail-input"
                  placeholder="State"
                />
              )}
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">City</span>
              {!isEdit ? (
                <span className="profile-detail-value">{(user?.city as string) ?? '—'}</span>
              ) : (
                <input
                  type="text"
                  value={form.city ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="profile-detail-input"
                  placeholder="City"
                />
              )}
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Email</span>
              <span className="profile-detail-value">{user?.email ?? '—'}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Phone</span>
              {!isEdit ? (
                <span className="profile-detail-value">{(user?.phoneNumber as string) ?? '—'}</span>
              ) : (
                <input
                  type="text"
                  value={form.phoneNumber ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  className="profile-detail-input"
                  placeholder="Phone number"
                  maxLength={10}
                />
              )}
            </div>
            <div className="profile-detail-row profile-detail-actions">
              {!isEdit ? (
                <button type="button" className="profile-btn profile-btn-edit" onClick={handleEdit}>
                  Edit
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="profile-btn profile-btn-save"
                    onClick={handleSave}
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" className="profile-btn profile-btn-cancel" onClick={handleCancel}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="profile-section">
          <h2 className="profile-section-title">Posts</h2>
          {postsLoading ? (
            <p className="profile-posts-loading">Loading posts…</p>
          ) : myPosts.length === 0 ? (
            <p className="profile-posts-empty">No posts yet.</p>
          ) : (
            <ul className="profile-posts-list">
              {myPosts.map((post) => (
                <li key={post._id ?? Math.random()} className="profile-post-item">
                  <div className="profile-post-meta">
                    <span className="profile-post-author">{post.postAuthor?.fullName ?? 'Unknown'}</span>
                    <span className="profile-post-date">{formatDate(post.createdAt)}</span>
                  </div>
                  {post.postContent && <p className="profile-post-content">{post.postContent}</p>}
                  {post.imageURL?.original && (
                    <img
                      src={`${IMAGE_BASE}/${post.imageURL.original}`}
                      alt=""
                      className="profile-post-media"
                    />
                  )}
                  {post.videoURL && (
                    <video src={`${IMAGE_BASE}/${post.videoURL}`} controls className="profile-post-media" />
                  )}
                  <div className="profile-post-stats">
                    {post.totalLike ?? 0} likes · {post.totalComment ?? 0} comments
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="profile-actions-wrap">
          <Link to="/settings" className="profile-settings-link">Settings</Link>
          <button type="button" className="profile-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </main>
    </div>
  )
}
