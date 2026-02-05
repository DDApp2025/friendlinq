import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileEditLayout from '../components/ProfileEditLayout'
import { getProfile, saveProfileData } from '../api/profile'
import type { CustomerData, SaveProfilePayload } from '../api/types'
import { COUNTRY_OPTIONS, GENDER_OPTIONS } from '../constants/profile'
import { LOGGED_IN_USER_KEY } from '../constants/devUser'
import './Profile.css'

export default function ProfileEdit() {
  const navigate = useNavigate()
  const [, setUser] = useState<CustomerData | null>(null)
  const [form, setForm] = useState<SaveProfilePayload>({})
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const token = (() => {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw) return null
    try {
      return (JSON.parse(raw) as { accessToken?: string }).accessToken ?? null
    } catch {
      return null
    }
  })()
  const apiToken = token ?? (import.meta.env.DEV ? 'dev-token' : '')

  useEffect(() => {
    if (!token && !import.meta.env.DEV) {
      navigate('/login', { replace: true })
      return
    }
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CustomerData & { accessToken?: string }
        setUser(parsed)
        setForm({
          fullName: parsed.fullName,
          country: parsed.country as string,
          gender: parsed.gender as string,
          state: parsed.state as string,
          city: parsed.city as string,
          phoneNumber: parsed.phoneNumber as string,
        })
      } catch {
        // ignore
      }
    }
    if (import.meta.env.DEV) {
      setLoading(false)
      return
    }
    getProfile(apiToken)
      .then((res) => {
        if (res.message === 'Success' && res.data?.customerData) {
          const u = res.data.customerData
          setUser(u)
          setForm({
            fullName: u.fullName,
            country: u.country as string,
            gender: u.gender as string,
            state: u.state as string,
            city: u.city as string,
            phoneNumber: u.phoneNumber as string,
          })
        }
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [token, apiToken, navigate])

  const handleSave = () => {
    if (!apiToken) return
    setSaveLoading(true)
    setError(null)
    saveProfileData(apiToken, form)
      .then((res) => {
        if (res.message === 'Success' && res.data?.customerData) {
          sessionStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify({ ...res.data!.customerData, accessToken: apiToken }))
          navigate('/profile', { replace: true })
        } else {
          setError(res.message || 'Save failed')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Save failed'))
      .finally(() => setSaveLoading(false))
  }

  if (!token && !import.meta.env.DEV) return null

  return (
    <ProfileEditLayout title="Edit">
      {error && <div className="profile-error" role="alert">{error}</div>}
      {loading ? (
        <p className="screen-loading">Loading…</p>
      ) : (
        <section className="profile-section">
          <h2 className="profile-section-title">General account settings</h2>
          <div className="profile-details-list">
            <div className="profile-detail-row">
              <span className="profile-detail-label">Name</span>
              <input
                type="text"
                value={form.fullName ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className="profile-detail-input"
                placeholder="Full name"
              />
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Location</span>
              <select
                value={form.country ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className="profile-detail-input"
              >
                <option value="">Choose country</option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Gender</span>
              <select
                value={form.gender ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                className="profile-detail-input"
              >
                <option value="">Choose gender</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">State</span>
              <input
                type="text"
                value={form.state ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className="profile-detail-input"
                placeholder="State"
              />
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">City</span>
              <input
                type="text"
                value={form.city ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="profile-detail-input"
                placeholder="City"
              />
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Phone</span>
              <input
                type="text"
                value={form.phoneNumber ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                className="profile-detail-input"
                placeholder="Phone number"
                maxLength={10}
              />
            </div>
            <div className="profile-detail-row profile-detail-actions">
              <button type="button" className="profile-btn profile-btn-save" onClick={handleSave} disabled={saveLoading}>
                {saveLoading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </section>
      )}
    </ProfileEditLayout>
  )
}
