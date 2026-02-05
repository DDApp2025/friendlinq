import { Link } from 'react-router-dom'
import './Gallery.css'

/** All 26 screens from the migration list, with route path and label. */
const PAGES: { path: string; label: string }[] = [
  { path: '/login', label: '1. Login' },
  { path: '/signup', label: '2. Signup' },
  { path: '/forgotpassword', label: '3. Forgot Password' },
  { path: '/dashboard', label: '4. Dashboard / Home Feed' },
  { path: '/profile', label: '5. User Profile (own)' },
  { path: '/profile/sample', label: "6. View Another User's Profile" },
  { path: '/friends', label: '7. Friend Suggestions' },
  { path: '/friends', label: '8. Friend Requests' },
  { path: '/friends', label: '9. Friends List' },
  { path: '/friends', label: '10. Search Users' },
  { path: '/create-post', label: '11. Create Post' },
  { path: '/post/sample', label: '12. Post Detail (comments, likes)' },
  { path: '/post/sample/edit', label: '13. Edit / Delete Post' },
  { path: '/chat', label: '14. Chat List' },
  { path: '/chat/sample', label: '15. Chat Conversation (1-on-1)' },
  { path: '/notifications', label: '16. Notifications' },
  { path: '/settings', label: '17. Settings' },
  { path: '/change-password', label: '18. Change Password' },
  { path: '/wallpapers', label: '19. Wallpapers' },
  { path: '/groups', label: '20. Groups List' },
  { path: '/groups/create', label: '21. Create Group' },
  { path: '/groups/sample', label: '22. Group Detail / Group Chat' },
  { path: '/groups/sample/members', label: '23. Group Members' },
  { path: '/portfolio', label: '24. Portfolio' },
  { path: '/nearby', label: '25. Nearby Users' },
  { path: '/schedule-calls', label: '26. Schedule Calls' },
  { path: '/photo-library', label: 'Photo Library' },
]

export default function Gallery() {
  return (
    <div className="gallery-wrapper">
      <header className="gallery-header fl-header">
        <Link to="/dashboard">← Back</Link>
        <h1 className="gallery-header-title">Gallery</h1>
        <span />
      </header>
      <main className="gallery-main">
        <p className="gallery-intro">Links to all 26 screens.</p>
        <ul className="gallery-list">
          {PAGES.map(({ path, label }, i) => (
            <li key={`${path}-${i}`} className="gallery-item">
              <Link to={path} className="gallery-link">
                {label}
              </Link>
              <span className="gallery-path">{path}</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
