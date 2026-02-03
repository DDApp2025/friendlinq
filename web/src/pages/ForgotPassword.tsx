import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'
import './ForgotPassword.css'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const emailTrim = email.trim()
    if (!emailTrim) {
      setError('Please enter your email.')
      return
    }

    setLoading(true)
    try {
      const result = await forgotPassword(emailTrim)
      if (result && result.message === 'Success') {
        setSuccess(true)
        setTimeout(() => navigate('/login', { replace: true }), 2000)
      } else {
        setError(result?.message || 'Request failed. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="forgot-wrapper">
        <div className="forgot-container">
          <h1 className="forgot-title">Check your email</h1>
          <p>We sent an OTP to your email. Redirecting to login…</p>
          <Link to="/login" className="forgot-link">Back to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="forgot-wrapper">
      <div className="forgot-container">
        <h1 className="forgot-title">Forgot Password</h1>
        <p className="forgot-subtitle">
          Enter the email you used when you joined and we'll send you an OTP to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div className="forgot-error" role="alert">{error}</div>}

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
              autoComplete="email"
            />
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-forgot-submit" disabled={loading}>
              {loading ? 'Sending…' : 'Confirm'}
            </button>
          </div>
        </form>

        <p className="extra-text">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}
