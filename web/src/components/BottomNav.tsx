import { Link, useLocation } from 'react-router-dom'

/**
 * Global bottom navigation bar. Matches RN tab order and targets.
 * Order: Home, Photo Library, My Friends, Notifications, Chat, Groups, Connect with Audio or Video Calls.
 */
const TABS: { path: string; icon: string; label: string }[] = [
  { path: '/dashboard', icon: 'home', label: 'Home' },
  { path: '/photo-library', icon: 'gallery', label: 'Photo Library' },
  { path: '/friends', icon: 'friend', label: 'My Friends' },
  { path: '/notifications', icon: 'bell', label: 'Notifications' },
  { path: '/chat', icon: 'chat', label: 'Chat' },
  { path: '/groups', icon: 'groups', label: 'Groups' },
  { path: '/schedule-calls', icon: 'call', label: 'Call' },
]

export default function BottomNav() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <nav className="app-bottom-nav" aria-label="Main navigation">
      {TABS.map(({ path, icon, label }) => {
        const isActive =
          path === '/dashboard'
            ? pathname === '/' || pathname === '/dashboard'
            : pathname === path || pathname.startsWith(path + '/')
        return (
          <Link
            key={path}
            to={path}
            className={`app-bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="app-bottom-nav-icon" data-icon={icon} aria-hidden />
            <span className="app-bottom-nav-label">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
