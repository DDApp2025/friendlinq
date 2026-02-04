import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createGroup } from '../api/groups'
import './CreateGroup.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'

export default function CreateGroup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
  const token = raw ? (() => { try { return (JSON.parse(raw) as { accessToken?: string }).accessToken ?? null; } catch { return null; } })() : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !name.trim()) return
    setLoading(true)
    setError(null)
    createGroup(name.trim(), token)
      .then((res) => {
        if (res.message === 'Success') {
          navigate('/groups', { replace: true })
        } else {
          setError(res.message || 'Failed to create group')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to create'))
      .finally(() => setLoading(false))
  }

  if (!token && !import.meta.env.DEV) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="create-group-wrapper">
      <header className="create-group-header fl-header">
        <Link to="/groups">← Cancel</Link>
        <h1 className="create-group-header-title">Create Group</h1>
        <span />
      </header>
      <main className="create-group-main">
        {error && <div className="create-group-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Group name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} className="create-group-input" />
          <button type="submit" className="create-group-submit" disabled={loading}>{loading ? 'Creating…' : 'Create'}</button>
        </form>
      </main>
    </div>
  )
}
