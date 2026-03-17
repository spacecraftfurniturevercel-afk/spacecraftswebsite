'use client'
import { useState } from 'react'
import { useAuth } from '../../providers/AuthProvider'

export default function BulkImageUpload() {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [productId, setProductId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState([])
  const [results, setResults] = useState([])

  const isAdmin = user?.email?.includes('@admin') || user?.email?.includes('admin@')

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files))
    setProgress([])
    setResults([])
  }

  const handleUpload = async () => {
    if (!files.length) {
      alert('Please select at least one image')
      return
    }

    setUploading(true)
    setResults([])

    const uploadResults = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('file', file)
      if (productId) formData.append('productId', productId)
      formData.append('folder', 'products')

      try {
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()

        if (response.ok) {
          uploadResults.push({
            filename: file.name,
            success: true,
            url: data.url,
            message: data.message
          })
        } else {
          uploadResults.push({
            filename: file.name,
            success: false,
            error: data.error
          })
        }

        setProgress([...uploadResults])
      } catch (error) {
        uploadResults.push({
          filename: file.name,
          success: false,
          error: error.message
        })
        setProgress([...uploadResults])
      }
    }

    setResults(uploadResults)
    setUploading(false)
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: '20px', color: '#d32f2f' }}>
        <h2>Access Denied</h2>
        <p>Only admins can access this page.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Bulk Image Upload</h1>

      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Upload Images</h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Select Images (JPG, PNG, WebP):
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ padding: '10px' }}
          />
          <small style={{ color: '#666' }}>
            Max 5MB per image. {files.length} file(s) selected.
          </small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Product ID (Optional - to link images to product):
          </label>
          <input
            type="number"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="e.g., 57"
            disabled={uploading}
            style={{ padding: '8px', width: '100%', maxWidth: '200px' }}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!files.length || uploading}
          style={{
            padding: '10px 20px',
            background: uploading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
      </div>

      {progress.length > 0 && (
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Progress ({progress.length}/{files.length})</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {progress.map((item, idx) => (
              <li
                key={idx}
                style={{
                  padding: '8px',
                  borderBottom: '1px solid #ccc',
                  color: item.success ? '#2e7d32' : '#d32f2f'
                }}
              >
                {item.success ? '✓' : '✗'} {item.filename}
                {item.success && (
                  <div style={{ fontSize: '12px', color: '#1976d2', marginTop: '4px', wordBreak: 'break-all' }}>
                    {item.url}
                  </div>
                )}
                {item.error && (
                  <div style={{ fontSize: '12px', color: '#d32f2f', marginTop: '4px' }}>
                    Error: {item.error}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ background: '#f0f4c3', padding: '15px', borderRadius: '8px' }}>
          <h3>Summary</h3>
          <p>
            <strong>Successfully uploaded:</strong> {results.filter(r => r.success).length}/{results.length}
          </p>
          {results.filter(r => r.success).length > 0 && (
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer' }}>View URLs</summary>
              <ul style={{ fontSize: '12px', marginTop: '10px' }}>
                {results
                  .filter(r => r.success)
                  .map((r, idx) => (
                    <li key={idx} style={{ wordBreak: 'break-all', marginBottom: '5px' }}>
                      <code>{r.url}</code>
                    </li>
                  ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
