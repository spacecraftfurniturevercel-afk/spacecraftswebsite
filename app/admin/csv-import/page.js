'use client'
import { useState } from 'react'
import { useAuth } from '../../providers/AuthProvider'

export default function CSVImport() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [tagging, setTagging] = useState(false)
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState(null) // live progress

  const handleTagRooms = async () => {
    setTagging(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/products/tag-rooms', { method: 'POST' })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ error: err.message })
    }
    setTagging(false)
  }

  const handleReset = async () => {
    if (!confirm('⚠️ This will DELETE all products, images, variants, specs, categories & brands, then re-seed the 7 main categories and Spacecrafts brand.\n\nAre you sure?')) return
    setResetting(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/products/reset', { method: 'DELETE' })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ error: err.message })
    }
    setResetting(false)
  }

  const handleImport = async () => {
    if (!file) {
      alert('Please select a CSV file')
      return
    }

    setUploading(true)
    setResult(null)
    setProgress(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const text = await response.text()
        try {
          setResult(JSON.parse(text))
        } catch {
          setResult({ error: text })
        }
        setUploading(false)
        return
      }

      // Read streaming response line by line
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let lastProgress = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const msg = JSON.parse(line)
            if (msg.type === 'heartbeat') continue // keepalive, ignore
            if (msg.type === 'progress' || msg.type === 'done' || msg.type === 'error' || msg.type === 'skip') {
              lastProgress = msg
              setProgress(msg)
            }
            if (msg.type === 'complete') {
              setResult(msg)
            }
          } catch {}
        }
      }
    } catch (err) {
      if (err.message?.includes('network') || err.name === 'TypeError') {
        setResult({ error: 'Network connection was interrupted. The import may still be running on the server. Please wait a moment and check the products page before retrying.' })
      } else {
        setResult({ error: err.message })
      }
    }

    setUploading(false)
    setProgress(null)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1>Import Products from CSV</h1>

      <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
        <strong>How it works:</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
          <li>Upload your CSV file with product data</li>
          <li>Slug is auto-generated from product name if empty</li>
          <li>Google Drive image links are downloaded and uploaded to storage automatically</li>
          <li>Existing products (matched by SKU or slug) are <strong>updated</strong>, new ones are <strong>created</strong></li>
          <li>Safe to re-run — no duplicates</li>
        </ul>
      </div>

      {/* Reset Section */}
      <div style={{ background: '#fff3cd', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffc107' }}>
        <strong>🔄 Reset &amp; Re-Import:</strong>
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#664d03' }}>
          If categories/brands are messed up, click Reset first to clean everything, then re-import your CSV.
          This deletes all products, re-seeds 7 main categories (Beds, Chairs, Dining Sets, Sofa Sets, Tables, Wardrobe &amp; Racks, Space Saving Furniture) and the Spacecrafts brand.
        </p>
        <button
          onClick={handleReset}
          disabled={resetting || uploading}
          style={{
            padding: '8px 20px',
            background: resetting ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: resetting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          {resetting ? 'Resetting...' : '⚠️ Reset All Products & Categories'}
        </button>
      </div>

      {/* Tag Rooms Section */}
      <div style={{ background: '#d1ecf1', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bee5eb' }}>
        <strong>🏷️ Tag Products for Homepage Tabs:</strong>
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#0c5460' }}>
          After importing products, run this to auto-assign room tags (Living Room, Bed Room, Dining Room, Study Room, Best Offers).
          This makes products appear in the &quot;Shop All Things Home&quot; section on the homepage.
        </p>
        <button
          onClick={handleTagRooms}
          disabled={tagging || uploading}
          style={{
            padding: '8px 20px',
            background: tagging ? '#ccc' : '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: tagging ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          {tagging ? 'Tagging...' : '🏷️ Tag Products for Homepage'}
        </button>
      </div>

      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Select CSV File:
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => { setFile(e.target.files[0]); setResult(null) }}
            disabled={uploading}
            style={{ padding: '10px' }}
          />
          {file && <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>{file.name}</small>}
        </div>

        <button
          onClick={handleImport}
          disabled={!file || uploading}
          style={{
            padding: '10px 24px',
            background: uploading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '15px',
          }}
        >
          {uploading ? 'Importing...' : 'Import Products'}
        </button>
      </div>

      {/* Live progress */}
      {uploading && progress && (
        <div style={{ background: '#e8f4fd', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bee5eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong>Processing: {progress.index} / {progress.total}</strong>
            <span style={{ fontSize: '13px', color: '#666' }}>{Math.round((progress.index / progress.total) * 100)}%</span>
          </div>
          <div style={{ background: '#dee2e6', borderRadius: '4px', height: '8px', marginBottom: '8px' }}>
            <div style={{
              background: '#007bff',
              height: '8px',
              borderRadius: '4px',
              width: `${(progress.index / progress.total) * 100}%`,
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: '14px' }}>
            <strong>{progress.name}</strong>
            {progress.step && <span style={{ color: '#666' }}> — {progress.step}</span>}
            {progress.type === 'done' && <span style={{ color: '#28a745' }}> ✓</span>}
            {progress.type === 'error' && <span style={{ color: '#d32f2f' }}> ✗ {progress.error}</span>}
          </div>
        </div>
      )}

      {result && (
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          {result.error ? (
            <p style={{ color: '#d32f2f' }}>Error: {result.error}</p>
          ) : (
            <>
              <h3 style={{ marginTop: 0 }}>{result.message}</h3>

              {result.results?.success?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: '#28a745' }}>Successful ({result.results.success.length})</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>Product</th>
                        <th style={{ padding: '8px' }}>Slug</th>
                        <th style={{ padding: '8px' }}>SKU</th>
                        <th style={{ padding: '8px' }}>Images</th>
                        <th style={{ padding: '8px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results.success.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '8px' }}>{item.name}</td>
                          <td style={{ padding: '8px', fontSize: '12px', color: '#666' }}>{item.slug}</td>
                          <td style={{ padding: '8px', fontSize: '12px', color: '#666' }}>{item.sku || '-'}</td>
                          <td style={{ padding: '8px' }}>{item.images || 0}</td>
                          <td style={{ padding: '8px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: item.action === 'created' ? '#d4edda' : '#fff3cd',
                              color: item.action === 'created' ? '#155724' : '#856404',
                              fontSize: '12px',
                            }}>
                              {item.action}
                            </span>
                            {item.imageErrors && (
                              <span style={{ color: '#d32f2f', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                                {item.imageErrors.join(', ')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {result.results?.errors?.length > 0 && (
                <div>
                  <h4 style={{ color: '#d32f2f' }}>Errors ({result.results.errors.length})</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>Product</th>
                        <th style={{ padding: '8px' }}>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results.errors.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '8px' }}>{item.name}</td>
                          <td style={{ padding: '8px', color: '#d32f2f' }}>{item.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
