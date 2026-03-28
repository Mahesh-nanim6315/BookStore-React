import React, { useEffect, useRef, useState } from 'react'
import { getAssistantHealth, sendAssistantMessage } from '../../api/assistant'
import { useAuth } from '../../contexts/AuthContext'
import ChatMessage from '../../components/chat/ChatMessage'
import DebugPanel from '../../components/chat/DebugPanel'

const createSessionId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `session-${Date.now()}`
}

const getStoredSessionId = () => {
  const existing = localStorage.getItem('assistant_session_id')
  if (existing) {
    return existing
  }

  const created = createSessionId()
  localStorage.setItem('assistant_session_id', created)
  return created
}

const AssistantPage = () => {
  const { user, isAuthenticated } = useAuth()
  const [sessionId] = useState(() => getStoredSessionId())
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Ask me to find books, review your cart, place orders, or explain subscription options.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debug, setDebug] = useState([])
  const [showDebug, setShowDebug] = useState(false)
  const [assistantStatus, setAssistantStatus] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    let active = true

    const loadAssistantHealth = async () => {
      try {
        const response = await getAssistantHealth()
        if (active) {
          setAssistantStatus(response?.llm || null)
        }
      } catch {
        if (active) {
          setAssistantStatus(null)
        }
      }
    }

    loadAssistantHealth()

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    const text = input.trim()
    if (!text || loading) {
      return
    }

    const nextUserMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: text,
    }

    setMessages((current) => [...current, nextUserMessage])
    setInput('')
    setError('')
    setLoading(true)

    try {
      const response = await sendAssistantMessage({
        sessionId,
        message: text,
        userId: user?.id ?? null,
      })

      if (!response.success) {
        throw new Error(response.message || 'Chat request failed')
      }

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: response.answer,
        },
      ])
      setDebug(response.debug || [])
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError.message ||
          'Something went wrong while contacting the AI assistant.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="assistant-shell">
      <div className="assistant-hero">
        <div>
          <span className="assistant-eyebrow">AI Concierge</span>
          <h1>Talk to your bookstore like it already knows what you need.</h1>
          <p>
            Search titles, add books to cart, place orders, and explore plans through
            natural conversation.
          </p>
        </div>

        <div className="assistant-hero__card">
          <strong>{isAuthenticated ? `Signed in as ${user?.name}` : 'Guest mode'}</strong>
          <span>
            {isAuthenticated
              ? 'Cart and order actions can use your current account context.'
              : 'Search works best right away. Sign in for cart and order actions.'}
          </span>
        </div>
      </div>

      <div className="assistant-layout">
        <div className="assistant-panel">
          <div className="assistant-toolbar">
            <div>
              <strong>Bookstore Assistant</strong>
              <span>{formatAssistantStatus(assistantStatus)}</span>
            </div>

            <button
              type="button"
              className="assistant-debug-toggle"
              onClick={() => setShowDebug((current) => !current)}
            >
              {showDebug ? 'Hide logs' : 'Show logs'}
            </button>
          </div>

          <div className="assistant-thread">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {loading && (
              <div className="assistant-message">
                <div className="assistant-message__meta">
                  <span>Bookstore AI</span>
                </div>
                <div className="assistant-message__bubble assistant-message__bubble--loading">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="assistant-composer">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for a sci-fi book under INR 500, add a title to cart, or place my order..."
              rows={3}
            />
            <div className="assistant-composer__footer">
              {error ? <p className="assistant-error">{error}</p> : <span />}
              <button type="submit" disabled={loading || !input.trim()}>
                {loading ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </form>
        </div>

        {showDebug && <DebugPanel debug={debug} />}
      </div>
    </section>
  )
}

const formatAssistantStatus = (status) => {
  if (!status?.provider) {
    return 'Powered by AI + MCP tools'
  }

  if (status.provider === 'gemini' && status.fallbackToOllama && status.fallbackModel) {
    return `Powered by Gemini with Ollama fallback (${status.fallbackModel})`
  }

  if (status.provider === 'gemini') {
    return 'Powered by Gemini + MCP tools'
  }

  return 'Powered by Ollama + MCP tools'
}

export default AssistantPage
