'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminReviewsPanel() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isAdmin = user?.email?.includes('@admin') || user?.email?.includes('admin@')

  useEffect(() => {
    if (!isAdmin) return
    fetchReviews()
  }, [isAdmin])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const { data, error: queryError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      setReviews(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const approveReview = async (reviewId) => {
    try {
      await supabase.from('reviews').update({ status: 'approved' }).eq('id', reviewId)
      fetchReviews()
    } catch (err) {
      alert(err.message)
    }
  }

  const rejectReview = async (reviewId) => {
    try {
      await supabase.from('reviews').update({ status: 'rejected' }).eq('id', reviewId)
      fetchReviews()
    } catch (err) {
      alert(err.message)
    }
  }

  const deleteReview = async (reviewId) => {
    if (!confirm('Are you sure?')) return
    try {
      await supabase.from('reviews').delete().eq('id', reviewId)
      fetchReviews()
    } catch (err) {
      alert(err.message)
    }
  }

  if (!isAdmin) {
    return <div style={{ padding: '20px', color: '#d32f2f' }}>Access Denied - Admin only</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin - Reviews Management</h1>
      
      {error && <div style={{ color: '#d32f2f', marginBottom: '20px' }}>{error}</div>}
      
      {loading ? (
        <div>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div>No reviews found</div>
      ) : (
        <div>
          {reviews.map(review => (
            <div key={review.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '4px' }}>
              <h3>{review.title}</h3>
              <p>Rating: {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} | Status: <strong>{review.status}</strong></p>
              <p>{review.body}</p>
              <div style={{ marginTop: '10px', gap: '10px', display: 'flex' }}>
                {review.status === 'pending' && (
                  <>
                    <button onClick={() => approveReview(review.id)} style={{ padding: '8px 16px', background: '#4caf50', color: 'white', border: 'none', cursor: 'pointer' }}>
                      Approve
                    </button>
                    <button onClick={() => rejectReview(review.id)} style={{ padding: '8px 16px', background: '#f44336', color: 'white', border: 'none', cursor: 'pointer' }}>
                      Reject
                    </button>
                  </>
                )}
                <button onClick={() => deleteReview(review.id)} style={{ padding: '8px 16px', background: '#757575', color: 'white', border: 'none', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
