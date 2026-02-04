import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'

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
      <div className="auth-screen">
        <div className="auth-inner forgot">
          <h1>Forgot Password</h1>
          <p>We sent an OTP to your email. Redirecting to login…</p>
          <p><Link to="/login" className="fl-link">Back to Login</Link></p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-screen">
      <div className="auth-inner forgot">
        <form onSubmit={handleSubmit}>
          <h1>Forgot Password</h1>
          <p>Enter the email you used when you joined and we'll send you an otp to reset your password.</p>

          {error && <div className="form-error" role="alert">{error}</div>}

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group button-div">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending…' : 'Confirm'}
            </button>
          </div>
        </form>

        <div className="extra-text">
          <p><Link to="/login" className="fl-link">Back to Login</Link></p>
        </div>
      </div>
    </div>
  )
}
