import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ProfileEditLayout from '../components/ProfileEditLayout'
import { getCurrentUser, updateCurrentUserProfile } from '../lib/devProfilePersistence'

type ActiveTab = 'images' | 'videos'

export default function PhotoLibrary() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultTab = (searchParams.get('tab') as ActiveTab) || 'images'

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<ActiveTab>(defaultTab)
  const [images, setImages] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])

  // Load saved data from persistence layer on mount
  useEffect(() => {
    const user = getCurrentUser() as any
    if (user) {
      if (Array.isArray(user.topFourImages)) {
        setImages(user.topFourImages)
      }
      if (Array.isArray(user.profileVideos)) {
        setVideos(user.profileVideos)
      } else if (user.profileVideo) {
        // Single video legacy support
        setVideos([user.profileVideo])
      }
    }
  }, [])

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        setImages((prev) => {
          if (prev.length >= 4) return prev
          return [...prev, reader.result as string]
        })
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleVideoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setVideos((prev) => [...prev, reader.result as string])
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleDeleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDeleteVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDone = () => {
    // Save through the persistence layer
    const user = getCurrentUser() as any
    if (user) {
      const next = {
        ...user,
        topFourImages: images,
        profileVideos: videos,
        profileVideo: videos.length > 0 ? videos[0] : '',
      }
      const s = JSON.stringify(next)
      sessionStorage.setItem('loggedInUser', s)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('friendlinq_dev_user', s)
      }
    }

    navigate('/profile')
  }

  return (
    <ProfileEditLayout title="Photo Library">
      <div style={{ padding: '16px' }}>
        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleImageAdd}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={handleVideoAdd}
        />

        {/* Add buttons */}
        <button
          onClick={() => imageInputRef.current?.click()}
          disabled={images.length >= 4}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '8px',
            backgroundColor: images.length >= 4 ? '#999' : '#006B3F',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: images.length >= 4 ? 'not-allowed' : 'pointer',
          }}
        >
          Add Image {images.length >= 4 ? '(Max 4)' : ''}
        </button>

        <button
          onClick={() => videoInputRef.current?.click()}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '12px',
            backgroundColor: '#006B3F',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Add Video
        </button>

        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.85rem', margin: '0 0 12px' }}>
          {activeTab === 'images'
            ? 'Select up to 4 images to show on your profile.'
            : 'Select a video to show on your profile.'}
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #ddd', marginBottom: '16px' }}>
          <button
            onClick={() => setActiveTab('images')}
            style={{
              flex: 1,
              padding: '10px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'images' ? '3px solid #006B3F' : '3px solid transparent',
              color: activeTab === 'images' ? '#006B3F' : '#999',
              fontWeight: activeTab === 'images' ? 'bold' : 'normal',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Images
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            style={{
              flex: 1,
              padding: '10px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'videos' ? '3px solid #006B3F' : '3px solid transparent',
              color: activeTab === 'videos' ? '#006B3F' : '#999',
              fontWeight: activeTab === 'videos' ? 'bold' : 'normal',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Videos
          </button>
        </div>

        {/* Images Grid */}
        {activeTab === 'images' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {images.map((img, idx) => (
              <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                <img
                  src={img}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  onClick={() => handleDeleteImage(idx)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            {images.length === 0 && (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999', padding: '20px 0' }}>
                No images added yet. Tap "Add Image" above.
              </p>
            )}
          </div>
        )}

        {/* Videos Grid */}
        {activeTab === 'videos' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {videos.map((vid, idx) => (
              <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', background: '#000' }}>
                <video
                  src={vid}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  muted
                  playsInline
                />
                {/* Play icon overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontSize: '28px',
                    pointerEvents: 'none',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  ▶
                </div>
                <button
                  onClick={() => handleDeleteVideo(idx)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            {videos.length === 0 && (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999', padding: '20px 0' }}>
                No videos added yet. Tap "Add Video" above.
              </p>
            )}
          </div>
        )}

        {/* Done button */}
        <button
          onClick={handleDone}
          style={{
            width: '100%',
            padding: '15px',
            background: '#006B3F',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Done
        </button>
      </div>
    </ProfileEditLayout>
  )
}