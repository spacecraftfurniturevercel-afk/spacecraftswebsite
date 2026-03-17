'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../app/providers/AuthProvider'
import { supabase } from '../lib/supabaseClient'
import styles from './ProductQA.module.css'

export default function ProductQA({ productId }) {
  const { user, isAuthenticated } = useAuth()
  const [qaList, setQaList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [question, setQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchQA()
  }, [productId])

  const fetchQA = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error: queryError } = await supabase
        .from('product_qa')
        .select(`
          *,
          user:user_id(full_name, avatar_url),
          answerer:answer_by(full_name)
        `)
        .eq('product_id', productId)
        .eq('status', 'published')
        .order('answer', { ascending: true, nullsLast: true })
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      setQaList(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      alert('Please sign in to ask a question')
      return
    }

    if (!question.trim() || question.trim().length < 10) {
      setError('Question must be at least 10 characters')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/qa/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ question: question.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to post question')
      }

      const newQA = await response.json()
      setQaList([newQA, ...qaList])
      setQuestion('')
      setShowForm(false)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading questions and answers...</div>
  }

  const answeredCount = qaList.filter(qa => qa.answer).length
  const unansweredCount = qaList.length - answeredCount

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Questions & Answers</h3>
        {qaList.length > 0 && (
          <div className={styles.stats}>
            <span>{qaList.length} questions</span>
            {answeredCount > 0 && <span>{answeredCount} answered</span>}
          </div>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {!showForm && (
        isAuthenticated ? (
          <button 
            onClick={() => setShowForm(true)}
            className={styles.askButton}
          >
            + Ask a Question
          </button>
        ) : (
          <div className={styles.authPrompt}>
            <a href="/login" className={styles.askButton}>Sign in to ask a question</a>
          </div>
        )
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.questionForm}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What would you like to know about this product? (minimum 10 characters)"
            rows={4}
            maxLength={500}
          />
          <small>{question.length}/500</small>
          
          <div className={styles.formButtons}>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Question'}
            </button>
            <button 
              type="button"
              onClick={() => {
                setShowForm(false)
                setQuestion('')
                setError('')
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {qaList.length === 0 ? (
        <div className={styles.noQA}>
          <p>No questions yet. Be the first to ask about this product!</p>
        </div>
      ) : (
        <div className={styles.qaList}>
          {qaList.map(qa => (
            <div key={qa.id} className={styles.qaItem}>
              <button
                className={styles.qaQuestion}
                onClick={() => setExpandedId(expandedId === qa.id ? null : qa.id)}
              >
                <span className={styles.icon}>
                  {expandedId === qa.id ? '▼' : '▶'} Q:
                </span>
                <span className={styles.questionText}>{qa.question}</span>
                {!qa.answer && <span className={styles.unanswered}>Unanswered</span>}
              </button>

              {expandedId === qa.id && (
                <div className={styles.qaContent}>
                  <div className={styles.questionDetail}>
                    <span className={styles.asker}>
                      Asked by {qa.user?.full_name || 'Anonymous'} on{' '}
                      {new Date(qa.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {qa.answer ? (
                    <div className={styles.answer}>
                      <span className={styles.answerBadge}>A: (Answer by {qa.answerer?.full_name || 'Admin'})</span>
                      <p>{qa.answer}</p>
                      {qa.answered_at && (
                        <small>Answered on {new Date(qa.answered_at).toLocaleDateString()}</small>
                      )}
                    </div>
                  ) : (
                    <div className={styles.noAnswer}>
                      <p>This question hasn't been answered yet. We'll reply soon!</p>
                    </div>
                  )}

                  {qa.is_helpful_for_others && (
                    <div className={styles.helpful}>
                      ⭐ This answer was helpful for others
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
