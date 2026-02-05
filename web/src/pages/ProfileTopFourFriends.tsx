import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * ProfileTopFourFriends — redirects to the Friends page in topFour mode.
 * The actual friend selection UI lives in Friends.tsx with ?from=profile&mode=topFour.
 * This route exists as a direct entry point.
 */
export default function ProfileTopFourFriends() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to Friends page with the correct query params for top four selection
    navigate('/friends?from=profile&mode=topFour', { replace: true })
  }, [navigate])

  return null
}