import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup as signupApi } from '../api/auth'
import type { SignupPayload } from '../api/types'

function generateGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function Signup() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPasswordMismatch(false)

    const name = fullName.trim()
    const emailTrim = email.trim()
    if (!name || !emailTrim || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 5) {
      setError('Password must be at least 5 characters.')
      return
    }
    if (password !== confirmPassword) {
      setPasswordMismatch(true)
      setError('Passwords do not match.')
      return
    }

    const payload: SignupPayload = {
      fullName: name,
      email: emailTrim,
      password,
      deviceType: 'ANDROID',
      deviceToken: generateGuid(),
      country: 'US',
      age: 0,
      gender: '',
    }

    setLoading(true)
    try {
      const result = await signupApi(payload)
      if (result && result.message === 'Success') {
        navigate('/login', { replace: true })
      } else {
        setError(result?.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-inner">
        <div className="logo-icon">
          <img src="/friendlinq_logo.png" alt="Friendlinq" />
        </div>

        <form onSubmit={handleSubmit}>
          <h1>Create Your FriendLinq Account</h1>

          {error && <div className="form-error" role="alert">{error}</div>}

          <div className="form-group">
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-control"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
              minLength={5}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setPasswordMismatch(false)
              }}
              className="form-control"
              required
              autoComplete="new-password"
            />
            {passwordMismatch && (
              <span className="password-mismatch">Passwords do not match</span>
            )}
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating account…' : 'Next'}
            </button>
          </div>

          <div className="extra-text">
            <p>Already have an account? <span><Link to="/login" className="fl-link">Login</Link></span></p>
          </div>
        </form>
      </div>
    </div>
  )
}
