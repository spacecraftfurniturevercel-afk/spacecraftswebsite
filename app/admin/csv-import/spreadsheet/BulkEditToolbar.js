'use client'

import { useState } from 'react'
import { BULK_EDIT_FIELDS, OFFER_PRESETS } from '../../../../lib/admin/spreadsheetFields'

export default function BulkEditToolbar({
  selectedCount,
  totalMatching,
  onSelectPage,
  onSelectAllMatching,
  onDeselectAll,
  onApply,
  meta,
  disabled,
  selectingAll,
  bulkApplying,
}) {
  const [field, setField] = useState('is_active')
  const [value, setValue] = useState('true')

  const col = BULK_EDIT_FIELDS.find((c) => c.key === field) || BULK_EDIT_FIELDS[0]

  const handleApply = async () => {
    let parsed = value
    if (col.type === 'bool') parsed = value === 'true'
    else if (col.type === 'number') parsed = value
    else if (col.type === 'category') parsed = value
    else if (col.type === 'brand') parsed = value
    await onApply(field, parsed)
  }

  return (
    <div style={{
      padding: '12px',
      background: '#e8f4fd',
      border: '1px solid #bee5eb',
      borderRadius: '8px',
      marginBottom: '12px',
      fontSize: '14px',
    }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
        <strong>Selection:</strong>
        <span>{selectedCount} row(s) selected{totalMatching != null ? ` · ${totalMatching} match filter` : ''}</span>
        <button type="button" onClick={onSelectPage} disabled={disabled} style={btn('#6c757d')}>
          Select page
        </button>
        <button type="button" onClick={onSelectAllMatching} disabled={disabled || selectingAll || !totalMatching} style={btn('#0056b3')}>
          {selectingAll ? 'Selecting…' : `Select all (${totalMatching || 0})`}
        </button>
        <button type="button" onClick={onDeselectAll} disabled={disabled || selectedCount === 0} style={btn('#6c757d')}>
          Deselect all
        </button>
      </div>

      {selectedCount > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Bulk set field</label>
            <select
              value={field}
              onChange={(e) => {
                setField(e.target.value)
                const next = BULK_EDIT_FIELDS.find((c) => c.key === e.target.value)
                if (next?.type === 'bool') setValue('true')
                else setValue('')
              }}
              style={selectStyle}
            >
              {BULK_EDIT_FIELDS.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 180px', maxWidth: '280px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>New value</label>
            {col.type === 'bool' && (
              <select value={value} onChange={(e) => setValue(e.target.value)} style={selectStyle}>
                <option value="true">Yes / Active / True</option>
                <option value="false">No / Inactive / False</option>
              </select>
            )}
            {col.type === 'category' && (
              <select value={value} onChange={(e) => setValue(e.target.value)} style={selectStyle}>
                <option value="">— None —</option>
                {meta.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            {col.type === 'brand' && (
              <select value={value} onChange={(e) => setValue(e.target.value)} style={selectStyle}>
                <option value="">— None —</option>
                {meta.brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
            {col.type === 'offer' && (
              <>
                <select
                  value={OFFER_PRESETS.includes(value) ? value : ''}
                  onChange={(e) => { if (e.target.value) setValue(e.target.value) }}
                  style={{ ...selectStyle, marginBottom: '4px' }}
                >
                  <option value="">Preset…</option>
                  {OFFER_PRESETS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <input type="text" value={value} onChange={(e) => setValue(e.target.value)} style={selectStyle} placeholder="Offer name" />
              </>
            )}
            {!['bool', 'category', 'brand', 'offer'].includes(col.type) && (
              <input
                type={col.type === 'number' ? 'number' : 'text'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={selectStyle}
                placeholder={col.label}
              />
            )}
          </div>

          <button type="button" onClick={handleApply} disabled={disabled || bulkApplying} style={btn('#007bff')}>
            {bulkApplying ? 'Applying…' : `Apply to ${selectedCount} selected`}
          </button>
        </div>
      )}
    </div>
  )
}

function btn(bg) {
  return {
    padding: '6px 12px',
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  }
}

const selectStyle = {
  width: '100%',
  padding: '6px 8px',
  border: '1px solid #ced4da',
  borderRadius: '4px',
  fontSize: '13px',
}
