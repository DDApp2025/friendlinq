import { Link } from 'react-router-dom'
import ProfilePageMenu from './ProfilePageMenu'

/**
 * Shared wrapper for Profile edit screens only.
 * Back button LEFT (always to /profile); menu icon UPPER RIGHT; same dropdown on every edit screen.
 */
interface ProfileEditLayoutProps {
  title: string
  children: React.ReactNode
}

export default function ProfileEditLayout({ title, children }: ProfileEditLayoutProps) {
  return (
    <div className="profile-edit-layout">
      <header className="profile-edit-header fl-header">
        <Link to="/profile" className="profile-edit-back">
          ← Back
        </Link>
        <h1 className="profile-edit-title">{title}</h1>
        <ProfilePageMenu />
      </header>
      <main className="profile-edit-main">
        {children}
      </main>
    </div>
  )
}
