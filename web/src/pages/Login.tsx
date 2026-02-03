import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import type { LoginPayload } from '../api/types'
import './Login.css'

const REMEMBERED_EMAIL_KEY = 'rememberedEmail'
const LOGGED_IN_USER_KEY = 'loggedInUser'

function generateGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY)
    if (saved) {
      setEmail(saved)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Email and Password are required.')
      return
    }
    if (rememberMe) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim())
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY)
    }

    const payload: LoginPayload = {
      email: email.trim(),
      password,
      deviceType: 'ANDROID',
      deviceToken: generateGuid(),
      latitude: 5,
      longitude: 5,
    }

    setLoading(true)
    try {
      const result = await login(payload)
      if (result && result.message === 'Success' && result.data?.customerData) {
        sessionStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(result.data.customerData))
        navigate('/dashboard', { replace: true })
      } else {
        setError(result?.message || 'Login failed.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Check the console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="logo-box">
          <img src="/friendlinq_logo.png" alt="Friendlinq" className="logo-img" />
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="login-error" role="alert">{error}</div>}
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="form-control"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group password-wrapper">
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="form-control"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle-eye"
              onClick={() => setPasswordVisible(!passwordVisible)}
              aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            >
              {passwordVisible ? '🙈' : '👁️'}
            </button>
          </div>

          <div className="options-row">
            <Link to="/forgotpassword" className="forgot-link">Forgot Password ?</Link>
            <div className="remember-me">
              <input
                type="checkbox"
                id="remMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remMe">Remember Me</label>
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-login" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
            <Link to="/signup" className="btn btn-signup">Sign Up</Link>
          </div>
        </form>

        <p className="footer-msg">Join others finding connections on Friendlinq</p>
      </div>
    </div>
  )
}
