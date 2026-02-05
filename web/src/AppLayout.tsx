import { Outlet, useLocation } from 'react-router-dom'
import HamburgerMenu from './components/HamburgerMenu'
import BottomNav from './components/BottomNav'

/**
 * Layout for app screens: profile menu (top-right), page content, global bottom nav.
 * On Profile page and all Profile edit screens: hide global profile-photo menu; only the profile hamburger menu is shown (upper right).
 * /photo-library and /friends count as profile-edit when from=profile (query).
 */
export default function AppLayout() {
  const location = useLocation()
  const path = location.pathname
  const fromProfile = new URLSearchParams(location.search).get('from') === 'profile'
  const isProfileRoute =
    path === '/profile' ||
    path.startsWith('/profile/') ||
    path === '/wallpapers' ||
    path === '/profile-video' ||
    (path === '/photo-library' && fromProfile) ||
    (path === '/friends' && fromProfile)

  return (
    <>
      {!isProfileRoute && <HamburgerMenu />}
      <div className="app-layout-content">
        <Outlet />
      </div>
      <BottomNav />
    </>
  )
}
