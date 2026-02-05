import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileEditLayout from '../components/ProfileEditLayout'
import { getCurrentUser, updateCurrentUserProfile } from '../lib/devProfilePersistence'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

export default function ProfileVideo() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)

  useEffect(() => {
    const user = getCurrentUser() as any
    if (user?.profileVideo) {
      setCurrentVideo(user.profileVideo)
    }
  }, [])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('video/')) return
    e.target.value = ''
    setLoading(true)
    setError(null)
    try {
      const dataUrl = await fileToDataUrl(file)
      updateCurrentUserProfile({ profileVideo: dataUrl })
      navigate('/profile', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    updateCurrentUserProfile({ profileVideo: '' })
    setCurrentVideo(null)
  }

  return (
    <ProfileEditLayout title="Profile Video">
      {error && <div style={{ margin: '10px 16px', padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }} role="alert">{error}</div>}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#555', marginBottom: '20px' }}>
          Select a video to show on your profile.
        </p>

        {/* Current video preview */}
        {currentVideo && (
          <div style={{ marginBottom: '20px' }}>
            <video
              src={currentVideo}
              controls
              playsInline
              style={{
                width: '100%',
                maxHeight: '200px',
                borderRadius: '8px',
                background: '#000',
              }}
            />
            <button
              type="button"
              onClick={handleRemove}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '10px',
                background: 'transparent',
                border: '1px solid #ccc',
                borderRadius: '8px',
                color: '#666',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              ✕ Remove Video
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
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
          {loading ? 'Uploading…' : 'Choose Video'}
        </button>
      </div>
    </ProfileEditLayout>
  )
}