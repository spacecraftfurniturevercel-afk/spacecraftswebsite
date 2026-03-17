'use client'
import { useState } from 'react'
import { useAuth } from '../app/providers/AuthProvider'
import { supabase } from '../lib/supabaseClient'
import styles from './ReviewForm.module.css'

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const { user, isAuthenticated } = useAuth()
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      setError('Please sign in to write a review')
      return
    }

    if (!title.trim() || !body.trim()) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      setError('')

      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`/api/reviews/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          title,
          body,
          rating: parseInt(rating)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit review')
      }

      setSuccess(true)
      setTitle('')
      setBody('')
      setRating(5)
      
      setTimeout(() => setSuccess(false), 3000)
      onReviewSubmitted?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.notAuthenticated}>
        <p>Sign in to write a review</p>
        <a href="/login">Sign In</a>
      </div>
    )
  }

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.title}>Write a Review</h3>
      
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>Review submitted successfully! It will appear after approval.</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="rating">Rating</label>
          <div className={styles.ratingSelect}>
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                type="button"
                className={`${styles.star} ${rating >= num ? styles.active : ''}`}
                onClick={() => setRating(num)}
                title={`${num} stars`}
              >
                ★
              </button>
            ))}
            <span className={styles.ratingValue}>{rating} out of 5</span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="title">Review Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience (e.g., 'Great quality and comfort')"
            maxLength={100}
            required
          />
          <small>{title.length}/100</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="body">Review Details *</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience with this product. What did you like? Any issues? Would you recommend it?"
            rows={6}
            maxLength={2000}
            required
          />
          <small>{body.length}/2000</small>
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}
