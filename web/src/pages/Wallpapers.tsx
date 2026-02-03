import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { updateWallpaper } from '../api/profile'
import './Wallpapers.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'
const WALLPAPER_OPTIONS = [
  { id: 'default', label: 'Default' },
  { id: 'dark', label: 'Dark' },
  { id: 'nature', label: 'Nature' },
  { id: 'minimal', label: 'Minimal' },
]

export default function Wallpapers() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('default')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  const token = raw ? (() => { try { return (JSON.parse(raw) as { accessToken?: string }).accessToken ?? null; } catch { return null; } })() : null

  const handleSave = () => {
    if (!token) {
      navigate('/login', { replace: true })
      return
    }
    setLoading(true)
    setError(null)
    updateWallpaper(selected, token)
      .then((res) => {
        if (res.message === 'Success') {
          setError(null)
        } else {
          setError(res.message || 'Failed to save')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to save'))
      .finally(() => setLoading(false))
  }

  if (!token) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="wallpapers-wrapper">
      <header className="wallpapers-header">
        <Link to="/settings">← Back</Link>
        <h1>Wallpapers</h1>
      </header>
      <main className="wallpapers-main">
        {error && <div className="wallpapers-error" role="alert">{error}</div>}
        <p className="wallpapers-intro">Choose a wallpaper theme.</p>
        <ul className="wallpapers-list">
          {WALLPAPER_OPTIONS.map((opt) => (
            <li key={opt.id}>
              <label className="wallpapers-option">
                <input type="radio" name="wallpaper" value={opt.id} checked={selected === opt.id} onChange={() => setSelected(opt.id)} />
                <span>{opt.label}</span>
              </label>
            </li>
          ))}
        </ul>
        <button type="button" className="wallpapers-save" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </button>
      </main>
    </div>
  )
}
