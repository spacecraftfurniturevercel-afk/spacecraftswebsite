'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../app/providers/AuthProvider'
import { supabase } from '../lib/supabaseClient'
import styles from './ReviewsList.module.css'

export default function ReviewsList({ productId, refresh, onStatsChange }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [sortBy, setSortBy] = useState('recent')

  const limit = 10

  useEffect(() => {
    fetchReviews(0)
  }, [productId, refresh, sortBy])

  const fetchReviews = async (pageNum) => {
    try {
      setLoading(true)
      setError('')

      let query = supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('product_id', productId)
        .eq('status', 'approved')

      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'helpful') {
        query = query.order('helpful_count', { ascending: false })
      } else if (sortBy === 'highest') {
        query = query.order('rating', { ascending: false })
      } else if (sortBy === 'lowest') {
        query = query.order('rating', { ascending: true })
      }

      const { data, error: queryError, count } = await query
        .range(pageNum * limit, pageNum * limit + limit - 1)

      if (queryError) throw queryError

      const list = data || []
      setReviews(list)
      if (onStatsChange) {
        const avg = list.length > 0
          ? list.reduce((sum, r) => sum + r.rating, 0) / list.length
          : 0
        onStatsChange(Number(avg.toFixed(1)), list.length)
      }
      setPage(pageNum)
      setHasMore((pageNum + 1) * limit < (count || 0))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleHelpful = async (reviewId, isHelpful) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please sign in to vote')
        return
      }

      const { error } = await supabase
        .from('review_votes')
        .insert({
          review_id: reviewId,
          user_id: session.user.id,
          vote_type: isHelpful ? 'helpful' : 'unhelpful'
        })

      if (error && error.code !== 'PGRST130') throw error

      // Refresh reviews
      fetchReviews(page)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading && reviews.length === 0) {
    return <div className={styles.loading}>Loading reviews...</div>
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.stats}>
          <h3 className={styles.title}>Customer Reviews</h3>
          {reviews.length > 0 && (
            <div className={styles.rating}>
              <span className={styles.stars}>
                {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
              </span>
              <span className={styles.average}>{avgRating}</span>
              <span className={styles.count}>({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className={styles.sortControls}>
            <label htmlFor="sort">Sort by:</label>
            <select 
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {reviews.length === 0 ? (
        <div className={styles.noReviews}>
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <>
          <div className={styles.reviewsList}>
            {reviews.map(review => (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerInfo}>
                    <h4 className={styles.reviewTitle}>{review.title}</h4>
                    <div className={styles.reviewMeta}>
                      <span className={styles.rating}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                      <span className={styles.date}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <p className={styles.reviewBody}>{review.body}</p>

                <div className={styles.reviewFooter}>
                  <div className={styles.helpful}>
                    <button 
                      onClick={() => handleHelpful(review.id, true)}
                      className={styles.helpfulBtn}
                    >
                      👍 Helpful ({review.helpful_count})
                    </button>
                    <button 
                      onClick={() => handleHelpful(review.id, false)}
                      className={styles.helpfulBtn}
                    >
                      👎 ({review.unhelpful_count})
                    </button>
                  </div>
                  {review.verified_purchase && (
                    <span className={styles.verified}>✓ Verified Purchase</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => fetchReviews(page + 1)}
              className={styles.loadMore}
            >
              Load More Reviews
            </button>
          )}
        </>
      )}
    </div>
  )
}
