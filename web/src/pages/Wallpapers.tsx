import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileEditLayout from '../components/ProfileEditLayout'
import { getCurrentUser, updateCurrentUserProfile } from '../lib/devProfilePersistence'
import './Wallpapers.css'

/**
 * Built-in solid-color wallpapers (always available, cannot be deleted).
 * The "src" is a CSS color string, NOT an image path.
 */
const PRESET_COLORS = [
  { id: 'marble',     color: '#ecf0f1' },
  { id: 'red',        color: '#e74c3c' },
  { id: 'sky',        color: '#3498db' },
  { id: 'orange',     color: '#e67e22' },
  { id: 'blue',       color: '#2980b9' },
  { id: 'green',      color: '#27ae60' },
  { id: 'light-blue', color: '#a2d9ce' },
  { id: 'prism',      color: '#9b59b6' },
  { id: 'cats',       color: '#f1c40f' },
  { id: 'peach',      color: '#ffccbc' },
  { id: 'purple',     color: '#8e44ad' },
  { id: 'sage',       color: '#a9dfbf' },
]

export default function Wallpapers() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Which wallpaper value is currently selected (color string or base64 data URL)
  const [selectedValue, setSelectedValue] = useState<string | null>(null)

  // User-uploaded wallpaper images stored as base64 data URLs
  const [customImages, setCustomImages] = useState<string[]>([])

  // Track which custom image is being held for delete confirmation
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  // Load saved state from persistence layer on mount
  useEffect(() => {
    const user = getCurrentUser() as any
    if (user) {
      // Load previously selected wallpaper
      const wp = user.profileWallpaper || user.customWallpaper || null
      if (wp) setSelectedValue(wp)

      // Load user's custom uploaded wallpapers
      if (Array.isArray(user.wallpaperGallery)) {
        setCustomImages(user.wallpaperGallery)
      }
    }
  }, [])

  const handleDone = () => {
    // Save selected wallpaper (could be a color string or a base64 image)
    updateCurrentUserProfile({
      profileWallpaper: selectedValue || '',
      customWallpaper: selectedValue || '',
    })

    // Also persist the custom gallery so uploaded images survive across sessions
    const user = getCurrentUser() as any
    if (user) {
      const next = { ...user, wallpaperGallery: customImages, profileWallpaper: selectedValue || '', customWallpaper: selectedValue || '' }
      const s = JSON.stringify(next)
      sessionStorage.setItem('loggedInUser', s)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('friendlinq_dev_user', s)
      }
    }

    navigate('/profile')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setCustomImages((prev) => [...prev, base64])
      setSelectedValue(base64)
    }
    reader.readAsDataURL(file)
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  const handleDeleteCustom = (index: number) => {
    const removed = customImages[index]
    const updated = customImages.filter((_, i) => i !== index)
    setCustomImages(updated)
    // If the deleted image was selected, clear selection
    if (selectedValue === removed) {
      setSelectedValue(null)
    }
    setDeleteIndex(null)
  }

  const handleClearWallpaper = () => {
    setSelectedValue(null)
  }

  return (
    <ProfileEditLayout title="Wallpapers">
      <div className="wallpapers-wrapper" style={{ padding: '10px' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Clear wallpaper button */}
        {selectedValue && (
          <button
            onClick={handleClearWallpaper}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              background: 'transparent',
              border: '1px solid #ccc',
              borderRadius: '8px',
              color: '#666',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            ✕ Remove Wallpaper
          </button>
        )}

        {/* Section: Preset solid colors */}
        <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#666', fontWeight: 600 }}>
          Solid Colors
        </p>
        <div
          className="wallpapers-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '16px' }}
        >
          {PRESET_COLORS.map((opt) => (
            <div
              key={opt.id}
              onClick={() => setSelectedValue(opt.color)}
              style={{
                aspectRatio: '1',
                backgroundColor: opt.color,
                position: 'relative',
                cursor: 'pointer',
                border: selectedValue === opt.color ? '4px solid #006B3F' : '1px solid #ddd',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              {selectedValue === opt.color && (
                <div
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,107,63,0.2)', color: 'white', fontSize: '24px',
                  }}
                >
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Section: User-uploaded images */}
        <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#666', fontWeight: 600 }}>
          My Wallpapers
        </p>
        <div
          className="wallpapers-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '16px' }}
        >
          {customImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedValue(img)}
              onContextMenu={(e) => { e.preventDefault(); setDeleteIndex(idx) }}
              style={{
                aspectRatio: '1',
                position: 'relative',
                cursor: 'pointer',
                border: selectedValue === img ? '4px solid #006B3F' : '1px solid #ddd',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <img
                src={img}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {selectedValue === img && (
                <div
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,107,63,0.2)', color: 'white', fontSize: '24px',
                  }}
                >
                  ✓
                </div>
              )}
              {/* Delete button (shows on right-click / long-press) */}
              {deleteIndex === idx && (
                <div
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.6)', gap: '8px',
                  }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteCustom(idx) }}
                    style={{
                      padding: '8px 16px', background: '#e74c3c', color: 'white',
                      border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteIndex(null) }}
                    style={{
                      padding: '6px 14px', background: 'rgba(255,255,255,0.3)', color: 'white',
                      border: 'none', borderRadius: '6px', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add (+) button */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              aspectRatio: '1',
              background: '#f8f8f8',
              border: '1px dashed #ccc',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '30px', color: '#999' }}>+</span>
          </div>
        </div>

        {/* Done button */}
        <div style={{ marginTop: '20px' }}>
          <button
            className="wallpapers-done-btn"
            style={{
              width: '100%',
              padding: '15px',
              background: '#006B3F',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            onClick={handleDone}
          >
            Done
          </button>
        </div>
      </div>
    </ProfileEditLayout>
  )
}