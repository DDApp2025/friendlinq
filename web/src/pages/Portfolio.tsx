import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getMyPortfolio, deleteMyPortfolio } from '../api/portfolio'
import type { PortfolioItem } from '../api/portfolio'
import './Portfolio.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'
const IMAGE_BASE = 'https://natural.selectnaturally.com'

function mediaUrl(path?: string): string {
  return path ? `${IMAGE_BASE}/${path}` : ''
}

export default function Portfolio() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw) {
      navigate('/login', { replace: true })
      return
    }
    try {
      const u = JSON.parse(raw) as { accessToken?: string }
      setToken(u.accessToken ?? null)
    } catch {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError(null)
    getMyPortfolio(0, 50, token)
      .then((res) => {
        if (res.message === 'Success' && res.data) {
          const list = (res.data as { myPortolio?: PortfolioItem[] }).myPortolio ?? []
          setItems(Array.isArray(list) ? list : [])
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [token])

  const handleDelete = (portfolioId: string) => {
    if (!token || !portfolioId || !window.confirm('Remove this from your portfolio?')) return
    setDeletingId(portfolioId)
    deleteMyPortfolio(portfolioId, token)
      .then((res) => {
        if (res.message === 'Success') {
          setItems((prev) => prev.filter((i) => i._id !== portfolioId))
        } else {
          setError(res.message || 'Failed to delete')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to delete'))
      .finally(() => setDeletingId(null))
  }

  if (!token) return null

  return (
    <div className="portfolio-wrapper">
      <header className="portfolio-header">
        <Link to="/profile">← Back</Link>
        <h1>Portfolio</h1>
      </header>
      <main className="portfolio-main">
        {error && (
          <div className="portfolio-error" role="alert">
            {error}
          </div>
        )}
        {loading ? (
          <p className="portfolio-loading">Loading…</p>
        ) : items.length === 0 ? (
          <p className="portfolio-placeholder">No portfolio items yet. Add photos or videos in a future update.</p>
        ) : (
          <ul className="portfolio-list">
            {items.map((item) => (
              <li key={item._id ?? ''} className="portfolio-item">
                <div className="portfolio-item-media">
                  {item.fileType === 2 ? (
                    <video src={mediaUrl(item.imageURL)} controls className="portfolio-media" />
                  ) : (
                    <img
                      src={mediaUrl(item.thumbnailURL || item.imageURL)}
                      alt=""
                      className="portfolio-media"
                    />
                  )}
                </div>
                {item.isSelected && <span className="portfolio-badge">Featured</span>}
                <button
                  type="button"
                  className="portfolio-delete"
                  onClick={() => handleDelete(item._id!)}
                  disabled={deletingId === item._id}
                >
                  {deletingId === item._id ? '…' : 'Remove'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
