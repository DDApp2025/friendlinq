import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileEditLayout from '../components/ProfileEditLayout'
import { uploadBannerPic } from '../api/profile'
import { LOGGED_IN_USER_KEY } from '../constants/devUser'
import { updateCurrentUserProfile } from '../lib/devProfilePersistence'
import './Profile.css'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

export default function ProfileBanner() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  const token = raw ? (() => { try { return (JSON.parse(raw) as { accessToken?: string }).accessToken ?? null; } catch { return null; } })() : null
  const apiToken = token ?? (import.meta.env.DEV ? 'dev-token' : '')

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    e.target.value = ''
    setLoading(true)
    setError(null)
    if (import.meta.env.DEV) {
      try {
        const dataUrl = await fileToDataUrl(file)
        updateCurrentUserProfile({ profileBannerPhoto: dataUrl })
        navigate('/profile', { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setLoading(false)
      }
      return
    }
    uploadBannerPic(apiToken, file)
      .then((res) => {
        if (res.message === 'Success' && res.data) {
          sessionStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify({ ...res.data, accessToken: apiToken }))
          navigate('/profile', { replace: true })
        } else {
          setError(res.message || 'Upload failed')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Upload failed'))
      .finally(() => setLoading(false))
  }

  if (!token && !import.meta.env.DEV) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <ProfileEditLayout title="Profile Banner Photo">
      {error && <div className="profile-error" role="alert">{error}</div>}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#555', marginBottom: '20px' }}>Choose a new banner photo.</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ display: 'none' }}
          aria-hidden
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            background: '#006B3F',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Uploading…' : 'Choose Banner'}
        </button>
      </div>
    </ProfileEditLayout>
  )
}