import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileEditLayout from '../components/ProfileEditLayout'
import { getCurrentUser, updateCurrentUserProfile } from '../lib/devProfilePersistence'

export default function ProfileTopFourImages() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<string[]>([])

  // Load existing images from persistence layer
  useEffect(() => {
    const user = getCurrentUser() as any
    if (user && Array.isArray(user.topFourImages)) {
      setImages(user.topFourImages)
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

  const handleDelete = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDone = () => {
    updateCurrentUserProfile({ topFourImages: images })
    navigate('/profile')
  }

  return (
    <ProfileEditLayout title="Top Four Images">
      <div style={{ padding: '20px' }}>
        <p style={{ textAlign: 'center', color: '#555', marginBottom: '20px' }}>
          Choose up to 4 images to show on your profile.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleImageAdd}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= 4}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: images.length >= 4 ? '#999' : '#006B3F',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: images.length >= 4 ? 'not-allowed' : 'pointer',
          }}
        >
          Add Image {images.length >= 4 ? '(Max 4)' : `(${images.length}/4)`}
        </button>

        {/* Image grid with delete */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          {images.map((img, idx) => (
            <div key={idx} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #ddd' }}>
              <img
                src={img}
                alt=""
                style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
              />
              <button
                onClick={() => handleDelete(idx)}
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
        </div>

        {images.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', marginBottom: '20px' }}>
            No images selected yet.
          </p>
        )}

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