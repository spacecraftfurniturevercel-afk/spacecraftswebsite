'use client'

import { useCallback, useEffect, useState } from 'react'

export default function ImageEditorModal({ row, onClose, onUpdated }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadTo, setUploadTo] = useState('both')
  const [urlAccount, setUrlAccount] = useState('active')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const loadImages = useCallback(async () => {
    if (!row?.id) {
      setImages([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/products/${row.id}/images`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load images')
      setImages(data.images || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [row?.id])

  useEffect(() => {
    loadImages()
  }, [loadImages])

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    if (!row?.id) {
      setError('Save the product first before uploading images.')
      return
    }

    setUploading(true)
    setError(null)
    setMessage(null)
    try {
      const fd = new FormData()
      files.forEach((f) => fd.append('file', f))
      fd.append('product_id', String(row.id))
      fd.append('upload_to', uploadTo)
      fd.append('url_account', urlAccount)

      const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setMessage(`${data.count} image(s) uploaded to ${(data.uploaded_to || []).join(' + ')}, served from ${data.served_by}.`)
      await loadImages()
      onUpdated?.({ image_count: images.length + data.count })
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (imageId) => {
    if (!confirm('Remove this image from the product?')) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/products/${row.id}/images?imageId=${imageId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      await loadImages()
      onUpdated?.()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!row) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '10px',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Images — {row.name || 'New product'}</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
              Dual storage: upload to both Supabase accounts; URL follows your active image source.
            </p>
          </div>
          <button type="button" onClick={onClose} style={ghostBtn}>✕</button>
        </div>

        {!row.id && (
          <div style={{ padding: '12px', background: '#fff3cd', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' }}>
            Save this new product first (Save / Sync), then reopen images to upload.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Upload file to</label>
            <select value={uploadTo} onChange={(e) => setUploadTo(e.target.value)} style={inputStyle} disabled={!row.id}>
              <option value="both">Both accounts (recommended)</option>
              <option value="primary">Primary only</option>
              <option value="secondary">Secondary only</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Serve URL from</label>
            <select value={urlAccount} onChange={(e) => setUrlAccount(e.target.value)} style={inputStyle} disabled={!row.id}>
              <option value="active">Match current site source</option>
              <option value="primary">Primary account</option>
              <option value="secondary">Secondary account</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Add images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={!row.id || uploading}
            onChange={handleUpload}
          />
          <p style={{ fontSize: '12px', color: '#888', margin: '6px 0 0' }}>
            Same path is written to each account — switch all URLs later in{' '}
            <a href="/admin/storage" target="_blank" rel="noreferrer">Admin → Image Storage</a>.
          </p>
        </div>

        {uploading && <p style={{ color: '#007bff' }}>Uploading…</p>}
        {message && <p style={{ color: '#0f5132', background: '#d1e7dd', padding: '8px', borderRadius: '4px' }}>{message}</p>}
        {error && <p style={{ color: '#842029', background: '#f8d7da', padding: '8px', borderRadius: '4px' }}>{error}</p>}

        {loading ? (
          <p>Loading images…</p>
        ) : images.length === 0 ? (
          <p style={{ color: '#666' }}>No images yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
            {images.map((img, i) => (
              <div key={img.id} style={{ border: '1px solid #dee2e6', borderRadius: '6px', overflow: 'hidden' }}>
                <img src={img.url} alt={img.alt || `Image ${i + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                <div style={{ padding: '6px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>#{i + 1}</span>
                  <button type="button" onClick={() => handleDelete(img.id)} style={{ ...ghostBtn, color: '#dc3545', fontSize: '12px' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }
const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px' }
const ghostBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px 8px' }
