import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Profile edit menu — UPPER RIGHT on Profile and every profile-editing page.
 * Order: Edit, Wallpapers, Profile video, Top four images, Top four friends, Profile photo, Profile banner photo, Cancel.
 * Cancel exits profile editor and returns to Profile page.
 */
export default function ProfilePageMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const close = () => setOpen(false)

  const go = (path: string) => {
    close()
    navigate(path)
  }

  const cancel = () => {
    close()
    navigate('/profile')
  }

  return (
    <div className="profile-page-menu-wrap" ref={containerRef}>
      <button
        type="button"
        className="profile-page-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Open profile menu"
      >
        &#9776;
      </button>
      {open && (
        <div className="profile-page-menu-dropdown" role="menu">
          <button type="button" className="profile-page-menu-item" role="menuitem" onClick={() => go('/profile/edit')}>
            Edit
          </button>
          <button type="button" className="profile-page-menu-item" role="menuitem" onClick={() => go('/wallpapers')}>
            Wallpapers
          </button>
          <button type="button" className="profile-page-menu-item" role="menuitem" onClick={() => go('/photo-library?from=profile&tab=videos')}>
            Profile video
          </button>
          <button type="button" className="profile-page-menu-item" role="menuitem" onClick={() => go('/photo-library?from=profile&tab=images')}>
            Top four images
          </button>
          <button type="button" className="profile-page-menu-item" role="menuitem" onClick={() => go('/friends?from=profile&mode=topFour')}>
            Top four friends
          </button>
          <button type="button" className="profile-page-menu-item" role="menuitem" onClick={() => go('/profile/photo')}>
            Profile photo
          </button>
          <button type="button" className="profile-page-menu-item" role="menuitem" onClick={() => go('/profile/banner')}>
            Profile banner photo
          </button>
          <button type="button" className="profile-page-menu-item profile-page-menu-cancel" role="menuitem" onClick={cancel}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
