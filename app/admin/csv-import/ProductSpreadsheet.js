'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

let rowKeyCounter = 0
function nextKey() {
  rowKeyCounter += 1
  return `row-${rowKeyCounter}`
}

const TRACKED_FIELDS = ['name', 'slug', 'sku', 'price', 'discount_price', 'stock', 'is_active', 'category_id', 'brand_id']
const PAGE_SIZE_OPTIONS = [25, 50, 100]

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function snapshotRow(row) {
  return {
    name: row.name || '',
    slug: row.slug || '',
    sku: row.sku || '',
    price: row.price === '' || row.price == null ? '' : String(row.price),
    discount_price: row.discount_price === '' || row.discount_price == null ? '' : String(row.discount_price),
    stock: row.stock ?? 0,
    is_active: row.is_active !== false,
    category_id: row.category_id || '',
    brand_id: row.brand_id || '',
  }
}

function cacheKey(row) {
  return row.id ? `id-${row.id}` : row._key
}

function normalizeField(field, val) {
  if (field === 'is_active') return !!val
  if (field === 'category_id' || field === 'brand_id') {
    return val === '' || val == null ? '' : String(val)
  }
  if (field === 'stock') return String(parseInt(val, 10) || 0)
  if (field === 'price' || field === 'discount_price') {
    if (val === '' || val == null) return ''
    const n = parseFloat(val)
    return Number.isNaN(n) ? '' : String(n)
  }
  return String(val ?? '').trim()
}

function isFieldChanged(row, field) {
  if (row._isNew) return Boolean(String(row[field] ?? '').trim()) || field === 'is_active'
  if (!row._original) return false
  return normalizeField(field, row[field]) !== normalizeField(field, row._original[field])
}

function isRowDirty(row) {
  if (row._isNew) return true
  return TRACKED_FIELDS.some((f) => isFieldChanged(row, f))
}

function productToRow(p) {
  const base = snapshotRow({
    name: p.name || '',
    slug: p.slug || '',
    sku: p.sku || '',
    price: p.price === '' || p.price == null ? '' : String(p.price),
    discount_price: p.discount_price === '' || p.discount_price == null ? '' : String(p.discount_price),
    stock: p.stock ?? 0,
    is_active: p.is_active !== false,
    category_id: p.category_id || '',
    brand_id: p.brand_id || '',
  })
  return {
    _key: nextKey(),
    _isNew: false,
    id: p.id,
    ...base,
    _original: { ...base },
  }
}

function emptyRow() {
  const base = snapshotRow({
    name: '',
    slug: '',
    sku: '',
    price: '',
    discount_price: '',
    stock: 0,
    is_active: true,
    category_id: '',
    brand_id: '',
  })
  return {
    _key: nextKey(),
    _isNew: true,
    id: null,
    ...base,
    _original: { ...base },
  }
}

function buildPageNumbers(current, total) {
  if (total <= 1) return [1]
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = [1]
  if (current > 3) pages.push('…')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i += 1) pages.push(i)

  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}

function formatOriginal(field, val, meta) {
  if (field === 'is_active') return val ? 'Active' : 'Inactive'
  if (field === 'category_id') {
    const c = meta.categories.find((x) => String(x.id) === String(val))
    return c?.name || val || '—'
  }
  if (field === 'brand_id') {
    const b = meta.brands.find((x) => String(x.id) === String(val))
    return b?.name || val || '—'
  }
  if (val === '' || val == null) return '—'
  return String(val)
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

const changedInputStyle = {
  ...inputStyle,
  background: '#fff3cd',
  borderColor: '#e67e22',
  boxShadow: 'inset 0 0 0 1px rgba(230, 126, 34, 0.25)',
}

const changedSelectStyle = { ...changedInputStyle, minWidth: '120px' }

function ChangedCell({ row, field, meta, children }) {
  const changed = isFieldChanged(row, field)
  if (!changed) return children

  const original = row._isNew
    ? '(new)'
    : formatOriginal(field, row._original?.[field], meta)

  return (
    <div>
      {children}
      <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px', lineHeight: 1.2 }}>
        was: {original}
      </div>
    </div>
  )
}

function PaginationBar({ page, totalPages, total, pageSize, onPageChange, onPageSizeChange, disabled }) {
  const pages = buildPageNumbers(page, totalPages)
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 8px',
      borderTop: '1px solid #dee2e6',
      background: '#f8f9fa',
      fontSize: '14px',
    }}
    >
      <span style={{ color: '#555' }}>
        Showing {from}–{to} of {total}
      </span>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={pageBtnStyle(false, disabled || page <= 1)}
        >
          ‹ Prev
        </button>

        {pages.map((p, i) => (
          p === '…' ? (
            <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: '#888' }}>…</span>
          ) : (
            <button
              key={p}
              type="button"
              disabled={disabled}
              onClick={() => onPageChange(p)}
              style={pageBtnStyle(p === page, disabled)}
            >
              {p}
            </button>
          )
        ))}

        <button
          type="button"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={pageBtnStyle(false, disabled || page >= totalPages)}
        >
          Next ›
        </button>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555' }}>
        Per page
        <select
          value={pageSize}
          disabled={disabled}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{ ...selectStyle, width: 'auto' }}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default function ProductSpreadsheet() {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ categories: [], brands: [] })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewFilter, setViewFilter] = useState('all') // all | changed | new
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [changedPage, setChangedPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [syncResult, setSyncResult] = useState(null)
  const debounceRef = useRef(null)
  const editCache = useRef(new Map())
  const [editRevision, setEditRevision] = useState(0)

  const allDirtyRows = useMemo(
    () => Array.from(editCache.current.values()).filter(isRowDirty),
    [rows, editRevision, syncResult]
  )

  const dirtyCount = allDirtyRows.length
  const changedCount = allDirtyRows.filter((r) => !r._isNew).length
  const newCount = allDirtyRows.filter((r) => r._isNew).length

  const mergeFromCache = useCallback((apiProducts) => {
    return apiProducts.map((p) => {
      const key = `id-${p.id}`
      const cached = editCache.current.get(key)
      if (cached) return cached
      return productToRow(p)
    })
  }, [])

  const loadProducts = useCallback(async ({ q, status, pg, ps } = {}) => {
    const query = q ?? search
    const statusVal = status ?? statusFilter
    const pageNum = pg ?? page
    const size = ps ?? pageSize

    setLoading(true)
    setLoadError(null)
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        pageSize: String(size),
      })
      if (query.trim()) params.set('q', query.trim())
      if (statusVal !== 'all') params.set('status', statusVal)

      const res = await fetch(`/api/admin/products/bulk?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load products')

      setRows(mergeFromCache(data.products || []))
      setTotal(data.total ?? 0)
      setTotalPages(data.totalPages ?? 1)
      setPage(data.page ?? pageNum)
      setSyncResult(null)
    } catch (err) {
      setLoadError(err.message)
      setRows([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page, pageSize, mergeFromCache])

  useEffect(() => {
    fetch('/api/admin/meta')
      .then((r) => r.json())
      .then((d) => setMeta({ categories: d.categories || [], brands: d.brands || [] }))
      .catch(() => {})
  }, [])

  // Single fetch effect — avoids race that reset page back to 1
  useEffect(() => {
    if (viewFilter !== 'all') return undefined

    clearTimeout(debounceRef.current)
    const delay = search.trim() ? 350 : 0
    debounceRef.current = setTimeout(() => {
      loadProducts({ q: search, status: statusFilter, pg: page, ps: pageSize })
    }, delay)

    return () => clearTimeout(debounceRef.current)
  }, [search, statusFilter, page, pageSize, viewFilter, loadProducts])

  const filteredChangedRows = useMemo(() => {
    if (viewFilter === 'new') return allDirtyRows.filter((r) => r._isNew)
    if (viewFilter === 'changed') return allDirtyRows.filter((r) => !r._isNew)
    return rows
  }, [viewFilter, allDirtyRows, rows])

  const changedTotalPages = Math.max(Math.ceil(filteredChangedRows.length / pageSize), 1)
  const displayRows = viewFilter === 'all'
    ? rows
    : filteredChangedRows.slice((changedPage - 1) * pageSize, changedPage * pageSize)

  const displayTotal = viewFilter === 'all' ? total : filteredChangedRows.length
  const displayPage = viewFilter === 'all' ? page : changedPage
  const displayTotalPages = viewFilter === 'all' ? totalPages : changedTotalPages

  const updateRow = (key, field, value) => {
    let target = null
    for (const row of editCache.current.values()) {
      if (row._key === key) {
        target = row
        break
      }
    }
    if (!target) target = rows.find((r) => r._key === key)
    if (!target) return

    const next = { ...target, [field]: value }
    if (field === 'name' && (target._isNew || !target.slug)) {
      next.slug = slugify(value)
    }

    editCache.current.set(cacheKey(next), next)
    setRows((prev) => prev.map((r) => (r._key === key ? next : r)))
    setEditRevision((v) => v + 1)
    setSyncResult(null)
  }

  const addRow = () => {
    const row = emptyRow()
    editCache.current.set(cacheKey(row), row)
    setViewFilter('new')
    setChangedPage(1)
    setEditRevision((v) => v + 1)
    setSyncResult(null)
  }

  const removeRow = (rowKey) => {
    let target = null
    for (const row of editCache.current.values()) {
      if (row._key === rowKey) {
        target = row
        break
      }
    }
    if (target) editCache.current.delete(cacheKey(target))
    setRows((prev) => prev.filter((r) => r._key !== rowKey))
    setEditRevision((v) => v + 1)
  }

  const handleReload = () => {
    if (dirtyCount > 0 && !confirm(`You have ${dirtyCount} unsaved change(s). Reload anyway?`)) return
    editCache.current.clear()
    setChangedPage(1)
    setPage(1)
    loadProducts({ q: search, status: statusFilter, pg: 1, ps: pageSize })
  }

  const handleSave = async () => {
    const dirtyRows = allDirtyRows
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

      editCache.current.clear()
      setSyncResult(data)
      setViewFilter('all')
      setChangedPage(1)
      setPage(1)
      await loadProducts({ q: search, status: statusFilter, pg: 1, ps: pageSize })
    } catch (err) {
      setSyncResult({ error: err.message })
    } finally {
      setSaving(false)
    }
  }

  const exportCsv = () => {
    const exportRows = dirtyCount > 0 ? allDirtyRows : rows
    const headers = ['name', 'slug', 'sku', 'price', 'discount_price', 'stock', 'is_active', 'category_id', 'brand_id']
    const lines = [headers.join(',')]
    for (const r of exportRows) {
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

  const handlePageChange = (nextPage) => {
    if (viewFilter === 'all') {
      setPage(nextPage)
    } else {
      setChangedPage(nextPage)
    }
  }

  const handlePageSizeChange = (nextSize) => {
    setPageSize(nextSize)
    setPage(1)
    setChangedPage(1)
  }

  const handleViewFilterChange = (value) => {
    setViewFilter(value)
    setChangedPage(1)
    if (value === 'all') setPage(1)
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, flex: '1 1 200px' }}>Product spreadsheet</h2>
        <button type="button" onClick={addRow} disabled={loading || saving} style={btnStyle('#007bff')}>
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
        <button type="button" onClick={handleReload} disabled={loading || saving} style={btnStyle('#6c757d')}>
          Reload
        </button>
        <button type="button" onClick={exportCsv} disabled={rows.length === 0 && dirtyCount === 0} style={btnStyle('#17a2b8')}>
          Export CSV
        </button>
      </div>

      <p style={{ fontSize: '14px', color: '#555', margin: '0 0 12px' }}>
        Changed cells turn <span style={{ background: '#fff3cd', padding: '1px 6px', borderRadius: '3px', border: '1px solid #e67e22' }}>orange</span> and show the previous value.
        Use <strong>Show: Changed only</strong> to review edits before saving. Edits are kept when you switch pages.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Search name, slug, or SKU…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          disabled={viewFilter !== 'all'}
          style={{ ...inputStyle, flex: '1 1 220px', maxWidth: '360px', opacity: viewFilter !== 'all' ? 0.6 : 1 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          disabled={viewFilter !== 'all'}
          style={{ ...selectStyle, width: 'auto', opacity: viewFilter !== 'all' ? 0.6 : 1 }}
        >
          <option value="all">All products</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
        <select
          value={viewFilter}
          onChange={(e) => handleViewFilterChange(e.target.value)}
          style={{ ...selectStyle, width: 'auto', fontWeight: 600, borderColor: viewFilter !== 'all' ? '#e67e22' : '#ced4da' }}
        >
          <option value="all">Show: All rows</option>
          <option value="changed">Show: Changed only ({changedCount})</option>
          <option value="new">Show: New only ({newCount})</option>
        </select>
        <span style={{ fontSize: '13px', color: '#666' }}>
          {loading ? 'Loading…' : (
            <>
              {dirtyCount > 0 && (
                <span style={{ color: '#b45309', fontWeight: 600, marginRight: '8px' }}>
                  {dirtyCount} unsaved
                </span>
              )}
              {displayTotal} row(s) · page {displayPage} of {displayTotalPages}
            </>
          )}
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

      {viewFilter === 'all' && total > 0 && (
        <PaginationBar
          page={displayPage}
          totalPages={displayTotalPages}
          total={displayTotal}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          disabled={loading || saving}
        />
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
            {displayRows.length === 0 && !loading && (
              <tr>
                <td colSpan={10} style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                  {viewFilter === 'changed' && dirtyCount === 0
                    ? 'No unsaved changes. Edit a product to see it here.'
                    : viewFilter === 'new' && newCount === 0
                      ? 'No new products. Click "+ Add product".'
                      : 'No products found. Try a different search or click "+ Add product".'}
                </td>
              </tr>
            )}
            {displayRows.map((row) => {
              const rowDirty = isRowDirty(row)
              return (
                <tr
                  key={row._key}
                  style={{
                    borderBottom: '1px solid #eee',
                    background: row._isNew ? '#f0f7ff' : rowDirty ? '#fffbeb' : 'transparent',
                  }}
                >
                  <td style={tdStyle}>
                    <ChangedCell row={row} field="name" meta={meta}>
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(row._key, 'name', e.target.value)}
                        style={isFieldChanged(row, 'name') ? changedInputStyle : inputStyle}
                        placeholder="Product name"
                      />
                    </ChangedCell>
                  </td>
                  <td style={tdStyle}>
                    <ChangedCell row={row} field="slug" meta={meta}>
                      <input
                        type="text"
                        value={row.slug}
                        onChange={(e) => updateRow(row._key, 'slug', e.target.value)}
                        style={isFieldChanged(row, 'slug') ? changedInputStyle : { ...inputStyle, fontSize: '12px' }}
                        placeholder="auto-from-name"
                      />
                    </ChangedCell>
                  </td>
                  <td style={tdStyle}>
                    <ChangedCell row={row} field="sku" meta={meta}>
                      <input
                        type="text"
                        value={row.sku}
                        onChange={(e) => updateRow(row._key, 'sku', e.target.value)}
                        style={isFieldChanged(row, 'sku') ? changedInputStyle : inputStyle}
                      />
                    </ChangedCell>
                  </td>
                  <td style={tdStyle}>
                    <ChangedCell row={row} field="price" meta={meta}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.price}
                        onChange={(e) => updateRow(row._key, 'price', e.target.value)}
                        style={isFieldChanged(row, 'price') ? changedInputStyle : inputStyle}
                      />
                    </ChangedCell>
                  </td>
                  <td style={tdStyle}>
                    <ChangedCell row={row} field="discount_price" meta={meta}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.discount_price}
                        onChange={(e) => updateRow(row._key, 'discount_price', e.target.value)}
                        style={isFieldChanged(row, 'discount_price') ? changedInputStyle : inputStyle}
                        placeholder="—"
                      />
                    </ChangedCell>
                  </td>
                  <td style={tdStyle}>
                    <ChangedCell row={row} field="stock" meta={meta}>
                      <input
                        type="number"
                        min="0"
                        value={row.stock}
                        onChange={(e) => updateRow(row._key, 'stock', e.target.value)}
                        style={isFieldChanged(row, 'stock') ? changedInputStyle : inputStyle}
                      />
                    </ChangedCell>
                  </td>
                  <td style={tdStyle}>
                    <ChangedCell row={row} field="is_active" meta={meta}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="checkbox"
                          checked={row.is_active}
                          onChange={(e) => updateRow(row._key, 'is_active', e.target.checked)}
                          style={isFieldChanged(row, 'is_active') ? { outline: '2px solid #e67e22' } : undefined}
                        />
                        <span style={{ fontSize: '12px', color: isFieldChanged(row, 'is_active') ? '#b45309' : '#666' }}>
                          {row.is_active ? 'Yes' : 'No'}
                        </span>
                      </label>
                    </ChangedCell>
                  </td>
                  <td style={tdStyle}>
                    <ChangedCell row={row} field="category_id" meta={meta}>
                      <select
                        value={row.category_id}
                        onChange={(e) => updateRow(row._key, 'category_id', e.target.value)}
                        style={isFieldChanged(row, 'category_id') ? changedSelectStyle : selectStyle}
                      >
                        <option value="">—</option>
                        {meta.categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </ChangedCell>
                  </td>
                  <td style={tdStyle}>
                    <ChangedCell row={row} field="brand_id" meta={meta}>
                      <select
                        value={row.brand_id}
                        onChange={(e) => updateRow(row._key, 'brand_id', e.target.value)}
                        style={isFieldChanged(row, 'brand_id') ? changedSelectStyle : selectStyle}
                      >
                        <option value="">—</option>
                        {meta.brands.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </ChangedCell>
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
              )
            })}
          </tbody>
        </table>

        {(viewFilter !== 'all' || total > 0) && (
          <PaginationBar
            page={displayPage}
            totalPages={displayTotalPages}
            total={displayTotal}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            disabled={loading || saving}
          />
        )}
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

function pageBtnStyle(active, disabled) {
  return {
    minWidth: '36px',
    padding: '6px 10px',
    background: active ? '#007bff' : '#fff',
    color: active ? '#fff' : '#333',
    border: `1px solid ${active ? '#007bff' : '#ced4da'}`,
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
  }
}

const thStyle = { padding: '10px 8px', whiteSpace: 'nowrap' }
const tdStyle = { padding: '6px 8px', verticalAlign: 'top' }
