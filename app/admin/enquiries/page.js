'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const TYPE_COLORS = {
  product:    { bg: '#e3f2fd', text: '#1565c0', label: 'Product' },
  franchise:  { bg: '#f3e5f5', text: '#6a1b9a', label: 'Franchise' },
  bulk_order: { bg: '#fff3e0', text: '#e65100', label: 'Bulk Order' },
  contact:    { bg: '#e8f5e9', text: '#2e7d32', label: 'Contact' },
}

const STATUS_COLORS = {
  new:           { bg: '#fff8e1', text: '#f57f17', label: 'New' },
  acknowledged:  { bg: '#e8f5e9', text: '#2e7d32', label: 'Acknowledged' },
  in_progress:   { bg: '#e3f2fd', text: '#1565c0', label: 'In Progress' },
  closed:        { bg: '#f5f5f5', text: '#616161', label: 'Closed' },
}

const SOURCE_COLORS = {
  form:      { bg: '#e8eaf6', text: '#283593', label: 'Form' },
  whatsapp:  { bg: '#e8f5e9', text: '#1b5e20', label: 'WhatsApp' },
}

function Badge({ type, map }) {
  const c = map[type] || { bg: '#f5f5f5', text: '#333', label: type }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
      background: c.bg, color: c.text, textTransform: 'capitalize',
    }}>{c.label}</span>
  )
}

function EnquiryDetail({ enquiry: initial, onClose, onUpdate }) {
  const [enq, setEnq]       = useState(initial)
  const [notes, setNotes]   = useState(initial.admin_notes || '')
  const [status, setStatus] = useState(initial.status)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState(null)

  const save = async () => {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: enq.id, status, admin_notes: notes }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const data = await res.json()
      setEnq(data.enquiry || { ...enq, status, admin_notes: notes })
      setMsg({ type: 'success', text: 'Saved successfully.' })
      onUpdate({ ...enq, status, admin_notes: notes })
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    }
    setSaving(false)
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

  // Build field rows based on type
  const fieldRows = []
  if (enq.name)  fieldRows.push(['Name', enq.name])
  if (enq.email) fieldRows.push(['Email', enq.email])
  if (enq.phone) fieldRows.push(['Phone', enq.phone])
  if (enq.type === 'franchise') {
    if (enq.company_name)    fieldRows.push(['Company', enq.company_name])
    if (enq.gst_number)      fieldRows.push(['GST', enq.gst_number])
    if (enq.city)            fieldRows.push(['City', enq.city])
    if (enq.state)           fieldRows.push(['State', enq.state])
    if (enq.investment_range) fieldRows.push(['Investment Range', enq.investment_range])
    if (enq.space_available) fieldRows.push(['Space Available', `${enq.space_available} sq. ft.`])
  }
  if (enq.type === 'bulk_order') {
    if (enq.product_type)    fieldRows.push(['Product / Category', enq.product_type])
    if (enq.quantity)        fieldRows.push(['Quantity Required', enq.quantity])
    if (enq.company_name)    fieldRows.push(['Company', enq.company_name])
    if (enq.gst_number)      fieldRows.push(['GST', enq.gst_number])
  }
  if (enq.type === 'product') {
    if (enq.product_name)    fieldRows.push(['Product', enq.product_name])
    if (enq.product_price)   fieldRows.push(['Price', `₹${enq.product_price}`])
  }
  if (enq.type === 'contact') {
    if (enq.subject)         fieldRows.push(['Subject', enq.subject])
  }
  if (enq.message) fieldRows.push(['Message', enq.message])
  fieldRows.push(['Received', fmtDate(enq.created_at)])
  if (enq.acknowledged_at) fieldRows.push(['Acknowledged', `${fmtDate(enq.acknowledged_at)} by ${enq.acknowledged_by || '—'}`])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 580, height: '100vh', overflowY: 'auto',
        background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        padding: '28px 28px 40px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Enquiry #{enq.id}</h2>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <Badge type={enq.type} map={TYPE_COLORS} />
              <Badge type={enq.source} map={SOURCE_COLORS} />
              <Badge type={enq.status} map={STATUS_COLORS} />
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#666' }}>✕</button>
        </div>

        {/* Details */}
        <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {fieldRows.map(([label, value], i) => (
                <tr key={i} style={{ borderBottom: i < fieldRows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td style={{ padding: '7px 0', color: '#888', width: 150, verticalAlign: 'top' }}>{label}</td>
                  <td style={{ padding: '7px 0', color: '#1a1a1a', wordBreak: 'break-word' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Admin actions */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
            {Object.entries(STATUS_COLORS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Admin Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Add internal notes about this enquiry…"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        <button onClick={save} disabled={saving} style={{
          width: '100%', padding: '11px', background: '#1a1a1a', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? 'wait' : 'pointer',
        }}>{saving ? 'Saving…' : 'Save Changes'}</button>

        {msg && (
          <p style={{ marginTop: 10, fontSize: 13, color: msg.type === 'error' ? '#c62828' : '#2e7d32' }}>{msg.text}</p>
        )}

        {/* Quick reply link if email present */}
        {enq.email && (
          <a href={`mailto:${enq.email}?subject=Re: Your ${TYPE_COLORS[enq.type]?.label || enq.type} Enquiry – Spacecrafts Furniture`}
            style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 13, color: '#1565c0', textDecoration: 'underline' }}>
            Reply via Email →
          </a>
        )}
      </div>
    </div>
  )
}

const TABS = [
  { key: '', label: 'All' },
  { key: 'franchise', label: 'Franchise' },
  { key: 'bulk_order', label: 'Bulk Orders' },
  { key: 'product', label: 'Product' },
  { key: 'contact', label: 'Contact' },
]

export default function AdminEnquiriesPage() {
  const router = useRouter()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [tab, setTab]             = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)
  const [selected, setSelected]   = useState(null)
  const LIMIT = 40

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: p, limit: LIMIT })
      if (tab) params.set('type', tab)
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/admin/enquiries?${params}`)
      if (res.status === 401) { router.push('/login?redirect=/admin/enquiries'); return }
      if (res.status === 403) { setError('Admin access required.'); setLoading(false); return }
      if (!res.ok) throw new Error((await res.json()).error)
      const data = await res.json()
      setEnquiries(data.enquiries || [])
      setTotal(data.total || 0)
      setPage(p)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }, [tab, statusFilter, router])

  useEffect(() => { load(1) }, [tab, statusFilter])

  const handleUpdate = (updated) => {
    setEnquiries(prev => prev.map(e => e.id === updated.id ? updated : e))
    if (selected?.id === updated.id) setSelected(updated)
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'
  const totalPages = Math.ceil(total / LIMIT)

  // Count new (unread) in current list
  const newCount = enquiries.filter(e => e.status === 'new').length

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      {/* Nav */}
      <header style={{ background: '#1a1a1a', padding: '16px 28px', display: 'flex', gap: 24, alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>Admin</h1>
        {[
        //   { href: '/admin/orders', label: 'Orders' },
        //   { href: '/admin/enquiries', label: 'Enquiries' },
        //   { href: '/admin/shipping', label: 'Shipping' },
        //   { href: '/admin/products', label: 'Products' },
        ].map(l => (
          <a key={l.href} href={l.href} style={{
            color: l.href === '/admin/enquiries' ? '#fff' : 'rgba(255,255,255,0.6)',
            textDecoration: 'none', fontSize: 13, fontWeight: l.href === '/admin/enquiries' ? 700 : 400,
            borderBottom: l.href === '/admin/enquiries' ? '2px solid #fff' : '2px solid transparent',
            paddingBottom: 2,
          }}>{l.label}</a>
        ))}
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
              Enquiries
              {newCount > 0 && (
                <span style={{ marginLeft: 10, background: '#f44336', color: '#fff', borderRadius: 20, fontSize: 12, padding: '2px 9px', verticalAlign: 'middle' }}>
                  {newCount} new
                </span>
              )}
            </h2>
            {!loading && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>{total} total</p>}
          </div>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}>
            <option value="">All Statuses</option>
            {Object.entries(STATUS_COLORS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Type Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e0e0e0', paddingBottom: 0 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? '#1a1a1a' : '#888',
              borderBottom: tab === t.key ? '2px solid #1a1a1a' : '2px solid transparent',
              marginBottom: -1,
            }}>{t.label}</button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fce4ec', color: '#b71c1c', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{error}</div>
        )}

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 14 }}>Loading enquiries…</div>
          ) : enquiries.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 14 }}>No enquiries found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #eee' }}>
                  {['#', 'Type', 'Source', 'Name', 'Contact', 'Subject / Product / Location', 'Date', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#666', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enquiries.map(enq => {
                  const subject =
                    enq.type === 'franchise'  ? enq.city || enq.company_name || '—' :
                    enq.type === 'bulk_order' ? enq.product_type || '—' :
                    enq.type === 'product'    ? enq.product_name || '—' :
                    enq.subject || '—'

                  const isNew = enq.status === 'new'

                  return (
                    <tr key={enq.id}
                      onClick={() => setSelected(enq)}
                      style={{
                        borderBottom: '1px solid #f5f5f5', cursor: 'pointer',
                        background: isNew ? '#fffde7' : '#fff',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = isNew ? '#fffde7' : '#fff'}
                    >
                      <td style={{ padding: '11px 14px', fontWeight: 600, color: '#888' }}>#{enq.id}</td>
                      <td style={{ padding: '11px 14px' }}><Badge type={enq.type} map={TYPE_COLORS} /></td>
                      <td style={{ padding: '11px 14px' }}><Badge type={enq.source} map={SOURCE_COLORS} /></td>
                      <td style={{ padding: '11px 14px', fontWeight: isNew ? 700 : 400 }}>{enq.name || '—'}</td>
                      <td style={{ padding: '11px 14px', color: '#666' }}>
                        <div>{enq.email || ''}</div>
                        <div>{enq.phone || ''}</div>
                      </td>
                      <td style={{ padding: '11px 14px', color: '#555', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {subject}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#888', whiteSpace: 'nowrap' }}>{fmtDate(enq.created_at)}</td>
                      <td style={{ padding: '11px 14px' }}><Badge type={enq.status} map={STATUS_COLORS} /></td>
                      <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                        <span style={{ color: '#1a1a1a', fontSize: 18 }}>›</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            <button onClick={() => load(page - 1)} disabled={page <= 1}
              style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>
              ← Prev
            </button>
            <span style={{ padding: '8px 16px', fontSize: 13, color: '#666' }}>Page {page} of {totalPages}</span>
            <button onClick={() => load(page + 1)} disabled={page >= totalPages}
              style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 8, background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>
              Next →
            </button>
          </div>
        )}
      </main>

      {selected && (
        <EnquiryDetail
          enquiry={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
