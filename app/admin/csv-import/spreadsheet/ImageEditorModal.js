'use client'

import { useCallback, useEffect, useState } from 'react'

export default function ImageEditorModal({ row, onClose, onUpdated }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadTo, setUploadTo] = useState('both')
  const [urlAccount, setUrlAccount] = useState('active')
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [driveLinks, setDriveLinks] = useState('')
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

  const importFromUrls = async (urls) => {
    if (!urls.length) return
    if (!row?.id) {
      setError('Save the product first before adding images.')
      return
    }

    setUploading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/products/${row.id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls,
          upload_to: uploadTo,
          url_account: urlAccount,
          replace: replaceExisting,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')

      let msg = `${data.count} image(s) imported (served from ${data.served_by}).`
      if (data.errors?.length) {
        msg += ` ${data.errors.length} link(s) failed.`
      }
      setMessage(msg)
      setDriveLinks('')
      setReplaceExisting(false)
      await loadImages()
      onUpdated?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async (e) => {
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

      setMessage(`${data.count} file(s) uploaded to ${(data.uploaded_to || []).join(' + ')}, served from ${data.served_by}.`)
      await loadImages()
      onUpdated?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDriveImport = () => {
    const urls = driveLinks
      .split(/[\n|,]/)
      .map((s) => s.trim())
      .filter(Boolean)
    importFromUrls(urls)
  }

  const handleDelete = async (imageId) => {
    if (!confirm('Remove this image from the product?')) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/products/${row.id}/images?imageId=${imageId}`, { method: 'DELETE' })
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
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Images — {row.name || 'New product'}</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
              Upload files or paste Google Drive / image URLs (multiple). Dual Supabase storage supported.
            </p>
          </div>
          <button type="button" onClick={onClose} style={ghostBtn}>✕</button>
        </div>

        {!row.id && (
          <div style={warnBox}>Save this product first (Save / Sync), then add images.</div>
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
          <label style={labelStyle}>Upload image files (multiple)</label>
          <input type="file" accept="image/*" multiple disabled={!row.id || uploading} onChange={handleFileUpload} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Google Drive / image links (one per line or comma-separated)</label>
          <textarea
            rows={4}
            value={driveLinks}
            onChange={(e) => setDriveLinks(e.target.value)}
            disabled={!row.id || uploading}
            placeholder={'https://drive.google.com/file/d/FILE_ID/view\nhttps://drive.google.com/file/d/FILE_ID_2/view'}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              disabled={!row.id || uploading}
            />
            Replace existing images (otherwise append)
          </label>
          <button
            type="button"
            onClick={handleDriveImport}
            disabled={!row.id || uploading || !driveLinks.trim()}
            style={{ ...primaryBtn, marginTop: '8px' }}
          >
            Import links
          </button>
        </div>

        {uploading && <p style={{ color: '#007bff' }}>Processing images…</p>}
        {message && <p style={successBox}>{message}</p>}
        {error && <p style={errorBox}>{error}</p>}

        {loading ? (
          <p>Loading images…</p>
        ) : images.length === 0 ? (
          <p style={{ color: '#666' }}>No images yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
            {images.map((img, i) => (
              <div key={img.id} style={{ border: '1px solid #dee2e6', borderRadius: '6px', overflow: 'hidden' }}>
                <img src={img.url} alt={img.alt || `Image ${i + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                <div style={{ padding: '6px', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>#{i + 1}</span>
                  <button type="button" onClick={() => handleDelete(img.id)} style={{ ...ghostBtn, color: '#dc3545', fontSize: '12px' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
const modalStyle = { background: '#fff', borderRadius: '10px', maxWidth: '760px', width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }
const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px', boxSizing: 'border-box' }
const ghostBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px 8px' }
const primaryBtn = { padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }
const warnBox = { padding: '12px', background: '#fff3cd', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' }
const successBox = { color: '#0f5132', background: '#d1e7dd', padding: '8px', borderRadius: '4px' }
const errorBox = { color: '#842029', background: '#f8d7da', padding: '8px', borderRadius: '4px' }
