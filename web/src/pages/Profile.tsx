import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import ProfilePageMenu from '../components/ProfilePageMenu'
import { getCurrentUser } from '../lib/devProfilePersistence'
import defaultAvatar from '../assets/images/user.jfif'
import './Profile.css'

const IMAGE_BASE = 'https://natural.selectnaturally.com'

export default function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<any>(null)
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null)
  const [bannerPhoto, setBannerPhoto] = useState<string | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [topFourImages, setTopFourImages] = useState<string[]>([])
  const [profileVideo, setProfileVideo] = useState<string | null>(null)
  const [topFourFriends, setTopFourFriends] = useState<any[]>([])

  useEffect(() => {
    // Single source of truth: read everything from the persistence layer
    const devUser = getCurrentUser() as any
    if (devUser) {
      setUser(devUser)

      // Wallpaper (color or base64 image)
      const wp = devUser.profileWallpaper || devUser.customWallpaper || null
      setWallpaperUrl(wp)

      // Banner photo
      setBannerPhoto(devUser.profileBannerPhoto || null)

      // Profile photo
      setProfilePhoto(devUser.profilePhoto || null)

      // Top four images
      setTopFourImages(Array.isArray(devUser.topFourImages) ? devUser.topFourImages : [])

      // Profile video
      setProfileVideo(devUser.profileVideo || null)

      // Top four friends
      setTopFourFriends(Array.isArray(devUser.topFourFriends) ? devUser.topFourFriends : [])
    }
  }, [location])

  // Wallpaper logic: color vs image
  const isColor = wallpaperUrl && wallpaperUrl.startsWith('#')
  const isImage = wallpaperUrl && !wallpaperUrl.startsWith('#')

  const dynamicWrapperStyle: React.CSSProperties = {
    minHeight: '100vh',
    width: '100%',
    backgroundImage: isImage ? `url(${wallpaperUrl})` : 'none',
    backgroundColor: isColor ? wallpaperUrl : isImage ? 'transparent' : '#f4f4f4',
    backgroundSize: isImage ? 'cover' : undefined,
    backgroundPosition: isImage ? 'center' : undefined,
    backgroundRepeat: isImage ? 'no-repeat' : undefined,
    display: 'flex',
    flexDirection: 'column',
  }

  const hasWallpaper = !!wallpaperUrl

  function friendAvatar(friend: any): string {
    const img = friend?.imageURL as { original?: string; thumbnail?: string } | undefined
    const path = img?.original ?? img?.thumbnail
    return path ? `${IMAGE_BASE}/${path}` : ''
  }

  // Semi-transparent card background so wallpaper shows through
  const cardBg = 'rgba(255, 255, 255, 0.85)'

  return (
    <div className="profile-wrapper" style={dynamicWrapperStyle}>
      {/* Header */}
      <header
        className="profile-header fl-header"
        style={{
          background: '#006B3F',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          color: 'white',
        }}
      >
        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>← Back</Link>
        <h1 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '1.2rem' }}>Profile</h1>
        <ProfilePageMenu />
      </header>

      <main className="profile-main" style={{ flex: 1, padding: '0 16px 20px' }}>

        {/* ============================================================
            BANNER + OVERLAPPING PROFILE PHOTO (RN-style layout)
            ============================================================ */}
        <div style={{ position: 'relative', marginBottom: '50px' }}>
          {/* Banner photo area */}
          <div
            style={{
              width: '100%',
              height: '200px',
              borderRadius: '0 0 12px 12px',
              overflow: 'hidden',
              background: bannerPhoto ? 'transparent' : (hasWallpaper ? 'rgba(255,255,255,0.2)' : '#ddd'),
            }}
          >
            {bannerPhoto ? (
              <img
                src={bannerPhoto}
                alt="Banner"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: hasWallpaper ? 'rgba(255,255,255,0.6)' : '#999', fontSize: '0.9rem',
              }}>
                No banner photo
              </div>
            )}
          </div>

          {/* Profile photo — overlapping bottom-left of the banner */}
          <div
            style={{
              position: 'absolute',
              bottom: '-40px',
              left: '16px',
            }}
          >
            <img
              src={profilePhoto || defaultAvatar}
              alt="Profile"
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                border: '4px solid white',
                boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                objectFit: 'cover',
                background: '#fff',
              }}
            />
          </div>
        </div>

        {/* User name */}
        <h2
          style={{
            margin: '0 0 16px 0',
            paddingLeft: '4px',
            color: hasWallpaper ? 'white' : '#333',
            textShadow: hasWallpaper ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none',
            fontSize: '1.3rem',
          }}
        >
          {user?.fullName || 'User'}
        </h2>

        {/* ============================================================
            PROFILE VIDEO
            ============================================================ */}
        {profileVideo && (
          <section style={{ background: cardBg, padding: '15px', borderRadius: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#006B3F' }}>
              Profile Video
            </h3>
            <video
              src={profileVideo}
              controls
              playsInline
              style={{
                width: '100%',
                maxHeight: '200px',
                borderRadius: '8px',
                background: '#000',
              }}
            />
          </section>
        )}

        {/* ============================================================
            TOP FOUR IMAGES
            ============================================================ */}
        {topFourImages.length > 0 && (
          <section style={{ background: cardBg, padding: '15px', borderRadius: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#006B3F' }}>
              Top Four Images
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {topFourImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* ============================================================
            TOP FOUR FRIENDS
            ============================================================ */}
        {topFourFriends.length > 0 && (
          <section style={{ background: cardBg, padding: '15px', borderRadius: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#006B3F' }}>
              Top Friends
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {topFourFriends.map((friend, idx) => (
                <div
                  key={friend._id || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: '8px',
                  }}
                >
                  <img
                    src={friendAvatar(friend) || defaultAvatar}
                    alt=""
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #006B3F',
                    }}
                    onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar }}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#333', textAlign: 'center' }}>
                    {friend.fullName || '—'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================
            STATUS
            ============================================================ */}
        <section style={{ background: cardBg, padding: '15px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
            <strong>Status</strong>
            <span style={{ color: '#006B3F' }}>Active</span>
          </div>
        </section>
      </main>
    </div>
  )
}