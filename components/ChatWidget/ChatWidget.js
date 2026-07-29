'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './ChatWidget.module.css'
import { CHAT_SESSION_STORAGE_KEY } from '../../lib/chatbot/constants'

const QUICK_PROMPTS = [
  'Show best sellers',
  'Current offers',
  'Sofa cum beds under ₹30000',
  'Store location & phone',
]

function createSessionId() {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function loadSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CHAT_SESSION_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveSession(session) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(CHAT_SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch (_) {}
}

function createFreshSession() {
  return {
    sessionId: createSessionId(),
    messages: [],
    createdAt: Date.now(),
  }
}

function formatInr(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}

function linkifyText(text) {
  if (!text) return null
  const urlPattern = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlPattern)
  return parts.map((part, i) =>
    part.startsWith('http') ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={styles.chatLink}>
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

function ProductCards({ products }) {
  if (!products?.length) return null
  return (
    <div className={styles.productGrid}>
      {products.map((p) => (
        <Link key={p.id} href={`/products/${p.slug}`} className={styles.productCard} target="_blank" rel="noopener noreferrer">
          <div className={styles.productImg}>
            <Image src={p.image_url} alt={p.name} fill quality={75} sizes="160px" style={{ objectFit: 'contain' }} />
          </div>
          <div className={styles.productBody}>
            <p className={styles.productName}>{p.name}</p>
            <div>
              <span className={styles.productPrice}>{formatInr(p.final_price)}</span>
              {p.discount_price != null && p.discount_price < p.price && (
                <span className={styles.productMrp}>{formatInr(p.price)}</span>
              )}
            </div>
            <div className={styles.productLink}>View product →</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [session, setSession] = useState(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const existing = loadSession()
    setSession(existing || createFreshSession())
  }, [])

  useEffect(() => {
    if (session) saveSession(session)
  }, [session])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages, loading, open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const startNewSession = useCallback(() => {
    setSession(createFreshSession())
    setError(null)
    setInput('')
  }, [])

  const sendMessage = useCallback(async (text) => {
    const message = (text || '').trim()
    if (!message || loading || !session) return

    setError(null)
    setLoading(true)

    const userMsg = { role: 'user', content: message, products: [] }
    const history = session.messages.map((m) => ({ role: m.role, content: m.content }))

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMsg],
    }))
    setInput('')

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 55000)

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send message')

      const botMsg = {
        role: 'assistant',
        content: data.reply,
        products: data.products || [],
      }

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, botMsg],
      }))
    } catch (err) {
      setError(err.name === 'AbortError' ? 'Still thinking — please wait a moment and try again.' : (err.message || 'Something went wrong'))
    } finally {
      setLoading(false)
    }
  }, [loading, session])

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const panelClass = [styles.panel, expanded ? styles.panelExpanded : ''].filter(Boolean).join(' ')

  if (!session) return null

  return (
    <div className={styles.chatRoot}>
      {!open && (
        <button
          type="button"
          className={styles.launcher}
          onClick={() => setOpen(true)}
          aria-label="Open chat assistant"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {open && (
        <div className={panelClass} role="dialog" aria-label="Spacecrafts shopping assistant">
          <header className={styles.header}>
            <div className={styles.headerInfo}>
              <h2 className={styles.headerTitle}>Spacecrafts Assistant</h2>
              <p className={styles.headerSub}>Ask about products, offers &amp; store</p>
            </div>
            <div className={styles.headerActions}>
              <button type="button" className={styles.iconBtn} onClick={startNewSession} title="New chat" aria-label="New chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setExpanded((v) => !v)}
                title={expanded ? 'Shrink' : 'Expand'}
                aria-label={expanded ? 'Shrink chat' : 'Expand chat'}
              >
                {expanded ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                )}
              </button>
              <button type="button" className={styles.iconBtn} onClick={() => { setOpen(false); setExpanded(false) }} title="Close" aria-label="Close chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </header>

          <div className={styles.messages}>
            {session.messages.length === 0 && (
              <div className={styles.welcome}>
                <strong>Hi! I&apos;m your Spacecrafts furniture guide.</strong>
                <p style={{ margin: '8px 0 0' }}>
                  Ask me about sofas, beds, offers, best sellers, or our Chennai store. I&apos;ll suggest real products from our catalog with links.
                </p>
                <div className={styles.quickChips}>
                  {QUICK_PROMPTS.map((q) => (
                    <button key={q} type="button" className={styles.chip} onClick={() => sendMessage(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {session.messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.messageRow} ${msg.role === 'user' ? styles.messageRowUser : styles.messageRowBot}`}
              >
                <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot}`}>
                  {msg.role === 'assistant' ? linkifyText(msg.content) : msg.content}
                </div>
                {msg.role === 'assistant' && msg.products?.length > 0 && (
                  <ProductCards products={msg.products} />
                )}
              </div>
            ))}

            {loading && <div className={styles.typing}>Thinking…</div>}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.inputArea} onSubmit={handleSubmit}>
            <div className={styles.inputRow}>
              <textarea
                ref={inputRef}
                className={styles.textInput}
                rows={1}
                placeholder="Ask about furniture, offers, store…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                disabled={loading}
                maxLength={1000}
              />
              <button type="submit" className={styles.sendBtn} disabled={loading || !input.trim()} aria-label="Send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
          </form>
        </div>
      )}
    </div>
  )
}
