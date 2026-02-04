import { Link } from 'react-router-dom'

/**
 * Shown only for unknown paths (path="*").
 * We do NOT redirect to /dashboard here so that valid routes are never
 * mistaken for "unknown" and sent to dashboard.
 */
export default function NotFound() {
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h1>Page not found</h1>
      <p>The URL you opened is not a valid route.</p>
      <p>
        <Link to="/dashboard">Go to Dashboard</Link>
        {' · '}
        <Link to="/login">Go to Login</Link>
      </p>
    </div>
  )
}
