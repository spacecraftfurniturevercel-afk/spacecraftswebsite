'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  COLUMN_GROUPS,
  SPREADSHEET_COLUMNS,
  TRACKED_FIELD_KEYS,
  normalizeField,
  snapshotFromProduct,
  OFFER_PRESETS,
} from '../../../lib/admin/spreadsheetFields'
import ImageEditorModal from './spreadsheet/ImageEditorModal'
import BulkEditToolbar from './spreadsheet/BulkEditToolbar'

let rowKeyCounter = 0
function nextKey() {
  rowKeyCounter += 1
  return `row-${rowKeyCounter}`
}

function slugify(str) {
  return (str || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

function cacheKey(row) {
  return row.id ? `id-${row.id}` : row._key
}

function productToRow(p) {
  const base = snapshotFromProduct(p)
  return {
    _key: nextKey(),
    _isNew: false,
    id: p.id,
    ...base,
    image_count: p.image_count ?? 0,
    thumbnail_url: p.thumbnail_url || '',
    _original: { ...base },
  }
}

function emptyRow() {
  const base = snapshotFromProduct({})
  return {
    _key: nextKey(),
    _isNew: true,
    id: null,
    ...base,
    image_count: 0,
    thumbnail_url: '',
    _original: { ...base },
  }
}

function isFieldChanged(row, field) {
  if (field === 'image_count' || field === 'thumbnail_url') return false
  if (row._isNew) {
    const v = row[field]
    if (typeof v === 'boolean') return v === true && field !== 'is_active'
    return Boolean(String(v ?? '').trim())
  }
  if (!row._original) return false
  return normalizeField(field, row[field]) !== normalizeField(field, row._original[field])
}

function isRowDirty(row) {
  if (row._isNew) return true
  return TRACKED_FIELD_KEYS.some((f) => isFieldChanged(row, f))
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
  const col = SPREADSHEET_COLUMNS.find((c) => c.key === field)
  if (col?.type === 'bool') return val ? 'Yes' : 'No'
  if (field === 'category_id') return meta.categories.find((x) => String(x.id) === String(val))?.name || val || '—'
  if (field === 'brand_id') return meta.brands.find((x) => String(x.id) === String(val))?.name || val || '—'
  if (val === '' || val == null) return '—'
  const s = String(val)
  return s.length > 40 ? `${s.slice(0, 40)}…` : s
}

const inputStyle = {
  width: '100%', padding: '6px 8px', border: '1px solid #ced4da',
  borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box',
}
const changedInputStyle = {
  ...inputStyle, background: '#fff3cd', borderColor: '#e67e22',
  boxShadow: 'inset 0 0 0 1px rgba(230, 126, 34, 0.25)',
}
const selectStyle = { ...inputStyle, minWidth: '100px' }
const changedSelectStyle = { ...changedInputStyle, minWidth: '100px' }

function PaginationBar({ page, totalPages, total, pageSize, onPageChange, onPageSizeChange, disabled }) {
  const pages = buildPageNumbers(page, totalPages)
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center',
      justifyContent: 'space-between', padding: '12px 8px',
      borderTop: '1px solid #dee2e6', background: '#f8f9fa', fontSize: '14px',
    }}
    >
      <span style={{ color: '#555' }}>Showing {from}–{to} of {total}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        <button type="button" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)} style={pageBtnStyle(false, disabled || page <= 1)}>‹ Prev</button>
        {pages.map((p, i) => (p === '…' ? (
          <span key={`e-${i}`} style={{ padding: '0 4px', color: '#888' }}>…</span>
        ) : (
          <button key={p} type="button" disabled={disabled} onClick={() => onPageChange(p)} style={pageBtnStyle(p === page, disabled)}>{p}</button>
        )))}
        <button type="button" disabled={disabled || page >= totalPages} onClick={() => onPageChange(page + 1)} style={pageBtnStyle(false, disabled || page >= totalPages)}>Next ›</button>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555' }}>
        Per page
        <select value={pageSize} disabled={disabled} onChange={(e) => onPageSizeChange(Number(e.target.value))} style={{ ...selectStyle, width: 'auto' }}>
          {[25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
    </div>
  )
}

function ChangedWrap({ row, field, meta, children }) {
  if (!isFieldChanged(row, field)) return children
  const original = row._isNew ? '(new)' : formatOriginal(field, row._original?.[field], meta)
  return (
    <div>
      {children}
      <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px' }}>was: {original}</div>
    </div>
  )
}

function CellEditor({ col, row, meta, onChange }) {
  const changed = isFieldChanged(row, col.key)
  const istyle = changed ? changedInputStyle : inputStyle
  const sstyle = changed ? changedSelectStyle : selectStyle

  if (col.type === 'images') {
    return (
      <button type="button" onClick={() => onChange('__images__', row)} style={{ fontSize: '12px', padding: '4px 8px', cursor: 'pointer' }}>
        {row.image_count || 0} 📷
      </button>
    )
  }

  if (col.type === 'bool') {
    return (
      <ChangedWrap row={row} field={col.key} meta={meta}>
        <input type="checkbox" checked={!!row[col.key]} onChange={(e) => onChange(col.key, e.target.checked)} />
      </ChangedWrap>
    )
  }

  if (col.type === 'category') {
    return (
      <ChangedWrap row={row} field={col.key} meta={meta}>
        <select value={row.category_id} onChange={(e) => onChange('category_id', e.target.value)} style={sstyle}>
          <option value="">—</option>
          {meta.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </ChangedWrap>
    )
  }

  if (col.type === 'brand') {
    return (
      <ChangedWrap row={row} field={col.key} meta={meta}>
        <select value={row.brand_id} onChange={(e) => onChange('brand_id', e.target.value)} style={sstyle}>
          <option value="">—</option>
          {meta.brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </ChangedWrap>
    )
  }

  if (col.type === 'textarea') {
    return (
      <ChangedWrap row={row} field={col.key} meta={meta}>
        <textarea rows={2} value={row[col.key] || ''} onChange={(e) => onChange(col.key, e.target.value)} style={{ ...istyle, minHeight: '48px', resize: 'vertical' }} />
      </ChangedWrap>
    )
  }

  if (col.type === 'offer') {
    return (
      <ChangedWrap row={row} field={col.key} meta={meta}>
        <input list={`offer-${row._key}`} value={row.offer_name || ''} onChange={(e) => onChange('offer_name', e.target.value)} style={istyle} placeholder="Offer name" />
        <datalist id={`offer-${row._key}`}>
          {OFFER_PRESETS.map((n) => <option key={n} value={n} />)}
        </datalist>
      </ChangedWrap>
    )
  }

  return (
    <ChangedWrap row={row} field={col.key} meta={meta}>
      <input
        type={col.type === 'number' ? 'number' : 'text'}
        value={row[col.key] ?? ''}
        onChange={(e) => onChange(col.key, e.target.value)}
        style={istyle}
        min={col.type === 'number' ? 0 : undefined}
        step={col.key.includes('price') || col.key === 'shipping_weight' ? '0.01' : undefined}
      />
    </ChangedWrap>
  )
}

export default function ProductSpreadsheet() {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ categories: [], brands: [] })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewFilter, setViewFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [changedPage, setChangedPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [syncResult, setSyncResult] = useState(null)
  const [imageRow, setImageRow] = useState(null)
  const [visibleGroups, setVisibleGroups] = useState(() =>
    Object.fromEntries(Object.entries(COLUMN_GROUPS).map(([k, v]) => [k, v.default]))
  )
  const debounceRef = useRef(null)
  const editCache = useRef(new Map())
  const selectedKeys = useRef(new Set())
  const [editRevision, setEditRevision] = useState(0)
  const [selectionRevision, setSelectionRevision] = useState(0)

  const visibleColumns = useMemo(
    () => SPREADSHEET_COLUMNS.filter((c) => visibleGroups[c.group]),
    [visibleGroups]
  )

  const allDirtyRows = useMemo(
    () => Array.from(editCache.current.values()).filter(isRowDirty),
    [rows, editRevision, syncResult]
  )

  const selectedCount = useMemo(() => {
    void selectionRevision
    return selectedKeys.current.size
  }, [selectionRevision, rows])

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
      const params = new URLSearchParams({ page: String(pageNum), pageSize: String(size) })
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
    fetch('/api/admin/meta').then((r) => r.json()).then((d) => setMeta({ categories: d.categories || [], brands: d.brands || [] })).catch(() => {})
  }, [])

  useEffect(() => {
    if (viewFilter !== 'all') return undefined
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      loadProducts({ q: search, status: statusFilter, pg: page, ps: pageSize })
    }, search.trim() ? 350 : 0)
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

  const isSelected = (row) => selectedKeys.current.has(cacheKey(row))

  const toggleSelect = (row) => {
    const key = cacheKey(row)
    if (selectedKeys.current.has(key)) selectedKeys.current.delete(key)
    else selectedKeys.current.add(key)
    setSelectionRevision((v) => v + 1)
  }

  const selectPage = () => {
    displayRows.forEach((r) => selectedKeys.current.add(cacheKey(r)))
    setSelectionRevision((v) => v + 1)
  }

  const deselectAll = () => {
    selectedKeys.current.clear()
    setSelectionRevision((v) => v + 1)
  }

  const updateRow = (rowKey, field, value) => {
    if (field === '__images__') {
      setImageRow(value)
      return
    }

    let target = null
    for (const row of editCache.current.values()) {
      if (row._key === rowKey) { target = row; break }
    }
    if (!target) target = rows.find((r) => r._key === rowKey)
    if (!target) return

    const next = { ...target, [field]: value }
    if (field === 'name' && (target._isNew || !target.slug)) next.slug = slugify(value)
    if (field === 'tags' && typeof value === 'string') next.tags = value

    editCache.current.set(cacheKey(next), next)
    setRows((prev) => prev.map((r) => (r._key === rowKey ? next : r)))
    setEditRevision((v) => v + 1)
    setSyncResult(null)
  }

  const applyBulkField = (field, value) => {
    const keys = Array.from(selectedKeys.current)
    if (!keys.length) return

    for (const selKey of keys) {
      let row = editCache.current.get(selKey)
      if (!row) {
        row = rows.find((r) => cacheKey(r) === selKey)
      }
      if (!row) continue
      const next = { ...row, [field]: value }
      editCache.current.set(cacheKey(next), next)
    }

    setRows((prev) => prev.map((r) => {
      const key = cacheKey(r)
      if (!selectedKeys.current.has(key)) return r
      const cached = editCache.current.get(key)
      return cached || r
    }))
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
    for (const row of editCache.current.values()) {
      if (row._key === rowKey) {
        selectedKeys.current.delete(cacheKey(row))
        editCache.current.delete(cacheKey(row))
        break
      }
    }
    setRows((prev) => prev.filter((r) => r._key !== rowKey))
    setEditRevision((v) => v + 1)
    setSelectionRevision((v) => v + 1)
  }

  const handleReload = () => {
    if (dirtyCount > 0 && !confirm(`You have ${dirtyCount} unsaved change(s). Reload anyway?`)) return
    editCache.current.clear()
    selectedKeys.current.clear()
    setChangedPage(1)
    setPage(1)
    loadProducts({ q: search, status: statusFilter, pg: 1, ps: pageSize })
  }

  const handleSave = async () => {
    const dirtyRows = allDirtyRows
    if (!dirtyRows.length) { alert('No changes to save'); return }
    if (!confirm(`Save ${dirtyRows.length} changed product(s) to the database?`)) return

    setSaving(true)
    setSyncResult(null)
    try {
      const payload = dirtyRows.map((r) => ({
        id: r.id,
        _isNew: r._isNew,
        ...TRACKED_FIELD_KEYS.reduce((acc, k) => ({ ...acc, [k]: r[k] }), {}),
      }))

      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: payload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sync failed')

      editCache.current.clear()
      selectedKeys.current.clear()
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

  const toggleGroup = (group) => {
    setVisibleGroups((g) => ({ ...g, [group]: !g[group] }))
  }

  const allPageSelected = displayRows.length > 0 && displayRows.every((r) => isSelected(r))

  const toggleSelectAllPage = () => {
    if (allPageSelected) {
      displayRows.forEach((r) => selectedKeys.current.delete(cacheKey(r)))
    } else {
      displayRows.forEach((r) => selectedKeys.current.add(cacheKey(r)))
    }
    setSelectionRevision((v) => v + 1)
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, flex: '1 1 200px' }}>Product spreadsheet</h2>
        <button type="button" onClick={addRow} disabled={loading || saving} style={btnStyle('#007bff')}>+ Add product</button>
        <button type="button" onClick={handleSave} disabled={loading || saving || dirtyCount === 0} style={btnStyle(dirtyCount === 0 ? '#ccc' : '#28a745')}>
          {saving ? 'Saving…' : `Save / Sync${dirtyCount > 0 ? ` (${dirtyCount})` : ''}`}
        </button>
        <button type="button" onClick={handleReload} disabled={loading || saving} style={btnStyle('#6c757d')}>Reload</button>
      </div>

      <p style={{ fontSize: '14px', color: '#555', margin: '0 0 12px' }}>
        Excel-style editor: select rows, bulk-edit fields, orange cells = unsaved changes.
        Images use dual Supabase storage (same as CMS).
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        {Object.entries(COLUMN_GROUPS).map(([key, g]) => (
          <label key={key} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input type="checkbox" checked={visibleGroups[key]} onChange={() => toggleGroup(key)} />
            {g.label} columns
          </label>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Search name, slug, SKU, description, material, offer…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          disabled={viewFilter !== 'all'}
          style={{ ...inputStyle, flex: '1 1 260px', maxWidth: '400px' }}
        />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} disabled={viewFilter !== 'all'} style={{ ...selectStyle, width: 'auto' }}>
          <option value="all">All products</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
        <select value={viewFilter} onChange={(e) => { setViewFilter(e.target.value); setChangedPage(1) }} style={{ ...selectStyle, width: 'auto', fontWeight: 600 }}>
          <option value="all">Show: All rows</option>
          <option value="changed">Show: Changed only ({changedCount})</option>
          <option value="new">Show: New only ({newCount})</option>
        </select>
        <span style={{ fontSize: '13px', color: '#666' }}>
          {loading ? 'Loading…' : `${displayTotal} row(s) · page ${displayPage}/${displayTotalPages}`}
          {dirtyCount > 0 && <span style={{ color: '#b45309', fontWeight: 600, marginLeft: 8 }}>{dirtyCount} unsaved</span>}
        </span>
      </div>

      <BulkEditToolbar
        selectedCount={selectedCount}
        onSelectPage={selectPage}
        onDeselectAll={deselectAll}
        onApply={applyBulkField}
        meta={meta}
        disabled={loading || saving}
      />

      {loadError && <div style={{ padding: '12px', background: '#f8d7da', color: '#842029', borderRadius: '6px', marginBottom: '12px' }}>{loadError}</div>}

      {syncResult && (
        <div style={{ padding: '12px', background: syncResult.error ? '#f8d7da' : '#d1e7dd', color: syncResult.error ? '#842029' : '#0f5132', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' }}>
          {syncResult.error ? `Error: ${syncResult.error}` : <strong>{syncResult.message}</strong>}
        </div>
      )}

      {viewFilter === 'all' && total > 0 && (
        <PaginationBar page={displayPage} totalPages={displayTotalPages} total={displayTotal} pageSize={pageSize}
          onPageChange={(p) => (viewFilter === 'all' ? setPage(p) : setChangedPage(p))}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); setChangedPage(1) }}
          disabled={loading || saving}
        />
      )}

      <div style={{ overflowX: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', background: '#fff' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '13px', minWidth: '100%' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ ...thStyle, width: 36, position: 'sticky', left: 0, background: '#f8f9fa', zIndex: 2 }}>
                <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAllPage} title="Select all on this page" />
              </th>
              {visibleColumns.map((col) => (
                <th key={col.key} style={{ ...thStyle, minWidth: col.width }}>{col.label}</th>
              ))}
              <th style={{ ...thStyle, width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 && !loading && (
              <tr><td colSpan={visibleColumns.length + 2} style={{ padding: '24px', textAlign: 'center', color: '#666' }}>No products found.</td></tr>
            )}
            {displayRows.map((row) => (
              <tr key={row._key} style={{
                borderBottom: '1px solid #eee',
                background: isSelected(row) ? '#e8f4fd' : row._isNew ? '#f0f7ff' : isRowDirty(row) ? '#fffbeb' : 'transparent',
              }}
              >
                <td style={{ ...tdStyle, position: 'sticky', left: 0, background: isSelected(row) ? '#e8f4fd' : '#fff', zIndex: 1 }}>
                  <input type="checkbox" checked={isSelected(row)} onChange={() => toggleSelect(row)} />
                </td>
                {visibleColumns.map((col) => (
                  <td key={col.key} style={tdStyle}>
                    <CellEditor col={col} row={row} meta={meta} onChange={(f, v) => updateRow(row._key, f, v)} />
                  </td>
                ))}
                <td style={tdStyle}>
                  {row._isNew && (
                    <button type="button" onClick={() => removeRow(row._key)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '16px' }}>×</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(viewFilter !== 'all' || total > 0) && (
          <PaginationBar page={displayPage} totalPages={displayTotalPages} total={displayTotal} pageSize={pageSize}
            onPageChange={(p) => (viewFilter === 'all' ? setPage(p) : setChangedPage(p))}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); setChangedPage(1) }}
            disabled={loading || saving}
          />
        )}
      </div>

      {imageRow && (
        <ImageEditorModal
          row={imageRow}
          onClose={() => setImageRow(null)}
          onUpdated={() => {
            setEditRevision((v) => v + 1)
            if (viewFilter === 'all') loadProducts({ q: search, status: statusFilter, pg: page, ps: pageSize })
          }}
        />
      )}
    </div>
  )
}

function btnStyle(bg) {
  return { padding: '8px 16px', background: bg, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }
}

function pageBtnStyle(active, disabled) {
  return {
    minWidth: '36px', padding: '6px 10px', background: active ? '#007bff' : '#fff',
    color: active ? '#fff' : '#333', border: `1px solid ${active ? '#007bff' : '#ced4da'}`,
    borderRadius: '4px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, fontSize: '13px',
  }
}

const thStyle = { padding: '10px 8px', whiteSpace: 'nowrap', textAlign: 'left' }
const tdStyle = { padding: '6px 8px', verticalAlign: 'top' }
