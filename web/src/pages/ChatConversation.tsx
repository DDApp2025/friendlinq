import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { getChatMessages, sendChatMessage } from '../api/chat'
import { getProfileOfAnotherUser } from '../api/profile'
import type { ChatMessage } from '../api/chat'
import './ChatConversation.css'

const LOGGED_IN_USER_KEY = 'loggedInUser'
const IMAGE_BASE = 'https://natural.selectnaturally.com'

function formatTime(s?: string): string {
  if (!s) return ''
  try {
    return new Date(s).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  } catch {
    return s
  }
}

export default function ChatConversation() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [token, setToken] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [otherUser, setOtherUser] = useState<{ _id?: string; fullName?: string } | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(LOGGED_IN_USER_KEY)
    if (!raw && !import.meta.env.DEV) {
      navigate('/login', { replace: true })
      return
    }
    if (!raw) return
    try {
      const u = JSON.parse(raw) as { accessToken?: string; _id?: string }
      setToken(u.accessToken ?? null)
      setCurrentUserId(u._id ?? null)
    } catch {
      if (!import.meta.env.DEV) navigate('/login', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (!token || !userId) return
    setLoading(true)
    setError(null)
    Promise.all([
      getChatMessages(userId, 0, 100, token),
      getProfileOfAnotherUser(token, userId),
    ])
      .then(([msgRes, profileRes]) => {
        if (msgRes.message === 'Success' && msgRes.data) {
          setMessages(msgRes.data.chatData ?? [])
        }
        if (profileRes.message === 'Success' && profileRes.data?.customerData) {
          setOtherUser({
            _id: profileRes.data.customerData._id,
            fullName: profileRes.data.customerData.fullName as string,
          })
        } else {
          setOtherUser({ _id: userId })
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [token, userId])


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !userId || !input.trim()) return
    const text = input.trim()
    setInput('')
    setSending(true)
    sendChatMessage(userId, text, apiToken)
      .then((res) => {
        if (res.message === 'Success') {
          const chatData = res.data?.chatData
          if (chatData) {
            setMessages((prev) => [...prev, chatData])
          } else {
            setMessages((prev) => [...prev, {
              senderId: { _id: currentUserId ?? undefined },
              receiverId: { _id: userId },
              textMessage: text,
              createdAt: new Date().toISOString(),
            }])
          }
        }
      })
      .catch(() => setInput(text))
      .finally(() => setSending(false))
  }

  const apiToken: string = token ?? (import.meta.env.DEV ? 'dev-token' : '')
  if (!token && !import.meta.env.DEV) return null
  if (!userId) {
    navigate('/chat', { replace: true })
    return null
  }

  return (
    <div className="chat-conv-wrapper">
      <header className="chat-conv-header fl-header">
        <Link to="/chat">← Back</Link>
        <div className="chat-conv-header-center">
          <h1 className="chat-conv-header-title">Chat with {otherUser?.fullName ?? '…'}</h1>
        </div>
        <div className="chat-conv-calling-option">
          <Link to={`/schedule-calls`} className="chat-conv-header-icon" title="Call">📞</Link>
          <Link to={`/schedule-calls`} className="chat-conv-header-icon" title="Video">📹</Link>
        </div>
      </header>

      <main className="chat-conv-main">
        {error && <div className="chat-conv-error" role="alert">{error}</div>}
        {loading ? (
          <p className="chat-conv-loading">Loading messages…</p>
        ) : (
          <div className="chat-conv-messages">
            {messages.map((m) => {
              const isMe = m.senderId?._id === currentUserId || (typeof m.senderId === 'object' && (m.senderId as { _id?: string })?._id === currentUserId)
              return (
                <div key={m._id ?? `${m.createdAt}-${m.textMessage}`} className={`chat-conv-msg ${isMe ? 'me' : 'them'}`}>
                  <p className="chat-conv-msg-text">{m.textMessage}</p>
                  {m.imageURL?.original && (
                    <img src={`${IMAGE_BASE}/${m.imageURL.original}`} alt="" className="chat-conv-msg-img" />
                  )}
                  <span className="chat-conv-msg-time">{formatTime(m.createdAt)}</span>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}

        <form onSubmit={handleSend} className="chat-conv-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="chat-conv-input"
            maxLength={1000}
          />
          <button type="submit" className="chat-conv-send" disabled={sending || !input.trim()}>
            {sending ? '…' : 'Send'}
          </button>
        </form>
      </main>
    </div>
  )
}
