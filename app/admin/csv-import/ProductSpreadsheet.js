'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

let rowKeyCounter = 0
function nextKey() {
  rowKeyCounter += 1
  return `row-${rowKeyCounter}`
}

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function productToRow(p) {
  return {
    _key: nextKey(),
    _dirty: false,
    _isNew: false,
    id: p.id,
    name: p.name || '',
    slug: p.slug || '',
    sku: p.sku || '',
    price: p.price === '' || p.price == null ? '' : String(p.price),
    discount_price: p.discount_price === '' || p.discount_price == null ? '' : String(p.discount_price),
    stock: p.stock ?? 0,
    is_active: p.is_active !== false,
    category_id: p.category_id || '',
    brand_id: p.brand_id || '',
  }
}

function emptyRow() {
  return {
    _key: nextKey(),
    _dirty: true,
    _isNew: true,
    id: null,
    name: '',
    slug: '',
    sku: '',
    price: '',
    discount_price: '',
    stock: 0,
    is_active: true,
    category_id: '',
    brand_id: '',
  }
}

const inputStyle = {
  width: '100%',
  padding: '6px 8px',
  border: '1px solid #ced4da',
  borderRadius: '4px',
  fontSize: '13px',
  boxSizing: 'border-box',
}

const selectStyle = { ...inputStyle, minWidth: '120px' }

export default function ProductSpreadsheet() {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ categories: [], brands: [] })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [syncResult, setSyncResult] = useState(null)
  const debounceRef = useRef(null)

  const dirtyCount = useMemo(() => rows.filter((r) => r._dirty).length, [rows])

  const loadProducts = useCallback(async (q = search, status = statusFilter) => {
    setLoading(true)
    setLoadError(null)
    try {
      const params = new URLSearchParams({ limit: '500' })
      if (q.trim()) params.set('q', q.trim())
      if (status !== 'all') params.set('status', status)

      const res = await fetch(`/api/admin/products/bulk?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load products')

      setRows((data.products || []).map(productToRow))
      setSyncResult(null)
    } catch (err) {
      setLoadError(err.message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetch('/api/admin/meta')
      .then((r) => r.json())
      .then((d) => setMeta({ categories: d.categories || [], brands: d.brands || [] }))
      .catch(() => {})
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      loadProducts(search, statusFilter)
    }, search.trim() ? 350 : 0)
    return () => clearTimeout(debounceRef.current)
  }, [search, statusFilter, loadProducts])

  const updateRow = (key, field, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r._key !== key) return r
        const next = { ...r, [field]: value, _dirty: true }
        if (field === 'name' && (r._isNew || !r.slug)) {
          next.slug = slugify(value)
        }
        return next
      })
    )
    setSyncResult(null)
  }

  const addRow = () => {
    setRows((prev) => [emptyRow(), ...prev])
    setSyncResult(null)
  }

  const removeRow = (key) => {
    setRows((prev) => prev.filter((r) => r._key !== key))
  }

  const handleSave = async () => {
    const dirtyRows = rows.filter((r) => r._dirty)
    if (dirtyRows.length === 0) {
      alert('No changes to save')
      return
    }

    if (!confirm(`Save ${dirtyRows.length} changed product(s) to the database?`)) return

    setSaving(true)
    setSyncResult(null)
    try {
      const payload = dirtyRows.map((r) => ({
        id: r.id,
        _isNew: r._isNew,
        name: r.name,
        slug: r.slug,
        sku: r.sku,
        price: r.price,
        discount_price: r.discount_price,
        stock: r.stock,
        is_active: r.is_active,
        category_id: r.category_id || null,
        brand_id: r.brand_id || null,
      }))

      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: payload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sync failed')

      setSyncResult(data)
      await loadProducts(search, statusFilter)
    } catch (err) {
      setSyncResult({ error: err.message })
    } finally {
      setSaving(false)
    }
  }

  const exportCsv = () => {
    const headers = ['name', 'slug', 'sku', 'price', 'discount_price', 'stock', 'is_active', 'category_id', 'brand_id']
    const lines = [headers.join(',')]
    for (const r of rows) {
      const vals = headers.map((h) => {
        const v = h === 'is_active' ? (r.is_active ? 'TRUE' : 'FALSE') : (r[h] ?? '')
        const s = String(v)
        return s.includes(',') ? `"${s.replace(/"/g, '""')}"` : s
      })
      lines.push(vals.join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, flex: '1 1 200px' }}>Product spreadsheet</h2>
        <button
          type="button"
          onClick={addRow}
          disabled={loading || saving}
          style={btnStyle('#007bff')}
        >
          + Add product
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || saving || dirtyCount === 0}
          style={btnStyle(dirtyCount === 0 ? '#ccc' : '#28a745')}
        >
          {saving ? 'Saving…' : `Save / Sync${dirtyCount > 0 ? ` (${dirtyCount})` : ''}`}
        </button>
        <button type="button" onClick={() => loadProducts(search, statusFilter)} disabled={loading || saving} style={btnStyle('#6c757d')}>
          Reload
        </button>
        <button type="button" onClick={exportCsv} disabled={rows.length === 0} style={btnStyle('#17a2b8')}>
          Export CSV
        </button>
      </div>

      <p style={{ fontSize: '14px', color: '#555', margin: '0 0 12px' }}>
        Edit products inline like a spreadsheet. Changed rows are highlighted. Click <strong>Save / Sync</strong> to update the database.
        New rows are created on save; existing rows are matched by ID or slug.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <input
          type="search"
          placeholder="Search name, slug, or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 220px', maxWidth: '360px' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...selectStyle, width: 'auto' }}
        >
          <option value="all">All products</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
        <span style={{ fontSize: '13px', color: '#666', alignSelf: 'center' }}>
          {loading ? 'Loading…' : `${rows.length} row(s)`}
        </span>
      </div>

      {loadError && (
        <div style={{ padding: '12px', background: '#f8d7da', color: '#842029', borderRadius: '6px', marginBottom: '12px' }}>
          {loadError}
        </div>
      )}

      {syncResult && (
        <div style={{
          padding: '12px',
          background: syncResult.error ? '#f8d7da' : '#d1e7dd',
          color: syncResult.error ? '#842029' : '#0f5132',
          borderRadius: '6px',
          marginBottom: '12px',
          fontSize: '14px',
        }}
        >
          {syncResult.error ? (
            <>Error: {syncResult.error}</>
          ) : (
            <>
              <strong>{syncResult.message}</strong>
              {syncResult.results?.errors?.length > 0 && (
                <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                  {syncResult.results.errors.map((e, i) => (
                    <li key={i}>{e.name}: {e.error}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      <div style={{ overflowX: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', background: '#fff' }}>
        <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Slug</th>
              <th style={thStyle}>SKU</th>
              <th style={{ ...thStyle, width: '90px' }}>Price (₹)</th>
              <th style={{ ...thStyle, width: '90px' }}>Sale (₹)</th>
              <th style={{ ...thStyle, width: '70px' }}>Stock</th>
              <th style={{ ...thStyle, width: '70px' }}>Active</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Brand</th>
              <th style={{ ...thStyle, width: '48px' }} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={10} style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                  No products found. Try a different search or click &quot;+ Add product&quot;.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row._key}
                style={{
                  borderBottom: '1px solid #eee',
                  background: row._dirty ? '#fffbeb' : row._isNew ? '#f0f7ff' : 'transparent',
                }}
              >
                <td style={tdStyle}>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => updateRow(row._key, 'name', e.target.value)}
                    style={inputStyle}
                    placeholder="Product name"
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    value={row.slug}
                    onChange={(e) => updateRow(row._key, 'slug', e.target.value)}
                    style={{ ...inputStyle, fontSize: '12px' }}
                    placeholder="auto-from-name"
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    value={row.sku}
                    onChange={(e) => updateRow(row._key, 'sku', e.target.value)}
                    style={inputStyle}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.price}
                    onChange={(e) => updateRow(row._key, 'price', e.target.value)}
                    style={inputStyle}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.discount_price}
                    onChange={(e) => updateRow(row._key, 'discount_price', e.target.value)}
                    style={inputStyle}
                    placeholder="—"
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    min="0"
                    value={row.stock}
                    onChange={(e) => updateRow(row._key, 'stock', e.target.value)}
                    style={inputStyle}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={row.is_active}
                    onChange={(e) => updateRow(row._key, 'is_active', e.target.checked)}
                    title={row.is_active ? 'Active' : 'Inactive'}
                  />
                </td>
                <td style={tdStyle}>
                  <select
                    value={row.category_id}
                    onChange={(e) => updateRow(row._key, 'category_id', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">—</option>
                    {meta.categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </td>
                <td style={tdStyle}>
                  <select
                    value={row.brand_id}
                    onChange={(e) => updateRow(row._key, 'brand_id', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">—</option>
                    {meta.brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </td>
                <td style={tdStyle}>
                  {row._isNew && (
                    <button
                      type="button"
                      onClick={() => removeRow(row._key)}
                      title="Remove new row"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontSize: '16px' }}
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function btnStyle(bg) {
  return {
    padding: '8px 16px',
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
  }
}

const thStyle = { padding: '10px 8px', whiteSpace: 'nowrap' }
const tdStyle = { padding: '6px 8px', verticalAlign: 'middle' }
