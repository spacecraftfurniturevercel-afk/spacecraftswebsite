'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../app/providers/AuthProvider'
import { supabase } from '../lib/supabaseClient'
import styles from './AdminPanel.module.css'

export default function AdminReviewsPanel() {
  const { user, profile } = useAuth()
  const [reviews, setReviews] = useState([])
  const [qaItems, setQaItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('reviews')
  const [error, setError] = useState('')
  const [selectedReview, setSelectedReview] = useState(null)
  const [selectedQA, setSelectedQA] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Check if user is admin
  const isAdmin = user?.email?.includes('@admin') || user?.email?.includes('admin@')

  useEffect(() => {
    if (!isAdmin) return
    fetchData()
  }, [isAdmin, activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      if (activeTab === 'reviews') {
        const { data, error: queryError } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false })

        if (queryError) throw queryError
        setReviews(data || [])
      } else {
        const { data, error: queryError } = await supabase
          .from('product_qa')
          .select(`
            *,
            user:user_id(full_name, email),
            answerer:answer_by(full_name)
          `)
          .order('created_at', { ascending: false })

        if (queryError) throw queryError
        setQaItems(data || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const approveReview = async (reviewId) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId)

      if (error) throw error
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  const rejectReview = async (reviewId) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'rejected' })
        .eq('id', reviewId)

      if (error) throw error
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  const deleteReview = async (reviewId) => {
    if (!confirm('Are you sure?')) return
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  const replyToQuestion = async (qaId) => {
    if (!replyText.trim()) {
      alert('Please enter a reply')
      return
    }

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('product_qa')
        .update({
          answer: replyText,
          answer_by: user.id,
          answered_at: new Date()
        })
        .eq('id', qaId)

      if (error) throw error

      setReplyText('')
      setSelectedQA(null)
      fetchData()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const hideQuestion = async (qaId) => {
    try {
      const { error } = await supabase
        .from('product_qa')
        .update({ status: 'hidden' })
        .eq('id', qaId)

      if (error) throw error
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  if (!isAdmin) {
    return (
      <div className={styles.accessDenied}>
        <h2>Access Denied</h2>
        <p>Only admins can access this panel.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Panel - Reviews & Q&A</h1>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'reviews' ? styles.active : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews ({reviews.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'qa' ? styles.active : ''}`}
          onClick={() => setActiveTab('qa')}
        >
          Questions & Answers ({qaItems.length})
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          {activeTab === 'reviews' && (
            <div className={styles.reviewsSection}>
              {reviews.length === 0 ? (
                <p className={styles.empty}>No reviews</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className={styles.item}>
                    <div className={styles.itemHeader}>
                      <div>
                        <h3>{review.title}</h3>
                        <p className={styles.meta}>
                          ⭐ {review.rating}/5 | Product ID: {review.product_id} | {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`${styles.badge} ${styles[review.status]}`}>
                        {review.status}
                      </span>
                    </div>

                    <p className={styles.reviewBody}>{review.body}</p>

                    <div className={styles.actions}>
                      {review.status === 'pending' && (
                        <>
                          <button
                            className={styles.approveBtn}
                            onClick={() => approveReview(review.id)}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => rejectReview(review.id)}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      <button
                        className={styles.deleteBtn}
                        onClick={() => deleteReview(review.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'qa' && (
            <div className={styles.qaSection}>
              {qaItems.length === 0 ? (
                <p className={styles.empty}>No questions</p>
              ) : (
                qaItems.map(qa => (
                  <div key={qa.id} className={styles.item}>
                    <div className={styles.itemHeader}>
                      <div>
                        <h3>Q: {qa.question}</h3>
                        <p className={styles.meta}>
                          By User | Product ID: {qa.product_id} | {new Date(qa.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`${styles.badge} ${qa.answer ? styles.answered : styles.unanswered}`}>
                        {qa.answer ? 'Answered' : 'Unanswered'}
                      </span>
                    </div>

                    {qa.answer && (
                      <div className={styles.answer}>
                        <p className={styles.answerLabel}>Answer by {qa.answerer?.full_name}:</p>
                        <p>{qa.answer}</p>
                      </div>
                    )}

                    <div className={styles.actions}>
                      {selectedQA !== qa.id ? (
                        <>
                          {!qa.answer && (
                            <button
                              className={styles.replyBtn}
                              onClick={() => setSelectedQA(qa.id)}
                            >
                              Reply
                            </button>
                          )}
                          <button
                            className={styles.deleteBtn}
                            onClick={() => hideQuestion(qa.id)}
                          >
                            {qa.status === 'hidden' ? 'Show' : 'Hide'}
                          </button>
                        </>
                      ) : (
                        <div className={styles.replyForm}>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your answer..."
                            rows={4}
                          />
                          <div className={styles.formButtons}>
                            <button
                              onClick={() => replyToQuestion(qa.id)}
                              disabled={submitting}
                              className={styles.submitBtn}
                            >
                              {submitting ? 'Submitting...' : 'Post Answer'}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedQA(null)
                                setReplyText('')
                              }}
                              className={styles.cancelBtn}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
