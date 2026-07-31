'use client'

import { useCallback, useEffect, useState } from 'react'

const PRESETS = [
  { label: 'All Primary', percent: 0, hint: 'Every image served from the primary account' },
  { label: '50 / 50 Split', percent: 50, hint: 'Halves the bandwidth used by each account' },
  { label: 'All Secondary', percent: 100, hint: 'Every image served from the secondary account' },
]

function pct(part, total) {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

function Bar({ distribution }) {
  const total = distribution?.total || 0
  const primary = pct(distribution?.primary || 0, total)
  const secondary = pct(distribution?.secondary || 0, total)
  const other = Math.max(100 - primary - secondary, 0)

  return (
    <div style={{ display: 'flex', height: 14, borderRadius: 8, overflow: 'hidden', background: '#eee' }}>
      <div style={{ width: `${primary}%`, background: '#2563eb' }} title={`Primary ${primary}%`} />
      <div style={{ width: `${secondary}%`, background: '#059669' }} title={`Secondary ${secondary}%`} />
      <div style={{ width: `${other}%`, background: '#cbd5e1' }} title={`Other ${other}%`} />
    </div>
  )
}

export default function StoragePanel() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [verify, setVerify] = useState(null)
  const [customPercent, setCustomPercent] = useState(50)

  const load = useCallback(async () => {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/storage')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
      setStatus(data)
      setCustomPercent(pct(data.distribution?.secondary || 0, data.distribution?.total || 0))
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const post = async (body, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)

      if (body.action === 'verify') {
        setVerify(data)
        setMsg({
          type: data.ready ? 'success' : 'error',
          text: data.ready
            ? `All ${data.checked} image files exist in the ${data.account} account.`
            : `${data.missing_count} of ${data.checked} files are missing from the ${data.account} account.`,
        })
      } else {
        setStatus((s) => ({ ...s, distribution: data.distribution, active: data.active }))
        setCustomPercent(pct(data.distribution?.secondary || 0, data.distribution?.total || 0))
        setMsg({
          type: 'success',
          text: `Updated ${data.updated} of ${data.total} image URLs. ${
            data.skipped ? `${data.skipped} non-Supabase URLs left unchanged.` : ''
          }`,
        })
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.message })
    } finally {
      setBusy(false)
    }
  }

  const secondary = status?.accounts?.find((a) => a.id === 'secondary')
  const d = status?.distribution || {}

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>Image Storage Accounts</h1>
      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>
        Product image files live in both Supabase projects under the same paths. Switching only
        re-points the URLs stored in the database — no files are copied or deleted.
      </p>

      {loading && <p>Loading…</p>}

      {msg && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 14,
            marginBottom: 18,
            background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: msg.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${msg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          {msg.text}
        </div>
      )}

      {status && (
        <>
          {secondary && !secondary.configured && (
            <div
              style={{
                padding: 16,
                borderRadius: 10,
                background: '#fffbeb',
                border: '1px solid #fde68a',
                marginBottom: 24,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              <strong>Secondary account not configured.</strong> Add these environment variables
              (locally in <code>.env.local</code> and in Vercel → Settings → Environment Variables),
              then redeploy:
              <ul style={{ margin: '10px 0 0 18px' }}>
                <li><code>SECONDARY_SUPABASE_URL</code> — e.g. https://abcdefgh.supabase.co</li>
                <li><code>SECONDARY_SUPABASE_SERVICE_ROLE_KEY</code> — Settings → API → service_role key</li>
                <li><code>SECONDARY_SUPABASE_BUCKET</code> — optional, only if the bucket name differs</li>
              </ul>
              {status.missing_env?.length > 0 && (
                <p style={{ margin: '10px 0 0' }}>Currently missing: {status.missing_env.join(', ')}</p>
              )}
              <div style={{ margin: '10px 0 0' }}>
                <strong>SECONDARY_* variables this deployment can see:</strong>
                {status.env_diagnostics?.length ? (
                  <ul style={{ margin: '6px 0 0 18px' }}>
                    {status.env_diagnostics.map((line) => (
                      <li key={line}><code>{line}</code></li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: '6px 0 0' }}>
                    None at all — the variables were not injected into this deployment.
                    Redeploy <em>without</em> the build cache, and confirm they were added to the
                    same Vercel project that serves this domain.
                  </p>
                )}
              </div>
            </div>
          )}

          <section style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: 28 }}>
            {status.accounts.map((a) => (
              <div
                key={a.id}
                style={{
                  border: `1px solid ${status.active === a.id ? '#2563eb' : '#e2e8f0'}`,
                  borderRadius: 10,
                  padding: 16,
                  background: status.active === a.id ? '#eff6ff' : '#fff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong style={{ fontSize: 15 }}>{a.label}</strong>
                  {status.active === a.id && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', padding: '2px 8px', borderRadius: 20 }}>
                      SERVING MOST
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', wordBreak: 'break-all', marginBottom: 6 }}>
                  {a.url || 'not set'}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Bucket: {a.bucket}</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 10 }}>
                  {d[a.id] ?? 0}
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                    {' '}
                    images ({pct(d[a.id] || 0, d.total || 0)}%)
                  </span>
                </div>
              </div>
            ))}
          </section>

          <section style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', marginBottom: 6 }}>
              <span>Current split of {d.total || 0} image URLs</span>
              {d.other > 0 && <span>{d.other} other / local URLs</span>}
            </div>
            <Bar distribution={d} />
          </section>

          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>Switch image source</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {PRESETS.map((p) => (
                <button
                  key={p.percent}
                  disabled={busy}
                  onClick={() =>
                    post(
                      { action: 'set-distribution', secondary_percent: p.percent },
                      `Re-point image URLs so ${p.percent}% are served by the secondary account?`
                    )
                  }
                  title={p.hint}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: busy ? 'not-allowed' : 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              <label style={{ fontSize: 14, color: '#334155' }}>Custom — secondary share:</label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={customPercent}
                onChange={(e) => setCustomPercent(Number(e.target.value))}
                style={{ flex: '1 1 200px' }}
              />
              <strong style={{ minWidth: 44 }}>{customPercent}%</strong>
              <button
                disabled={busy}
                onClick={() =>
                  post(
                    { action: 'set-distribution', secondary_percent: customPercent },
                    `Re-point image URLs so ${customPercent}% are served by the secondary account?`
                  )
                }
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#111827',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >
                {busy ? 'Applying…' : 'Apply'}
              </button>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>Before switching</h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 12px' }}>
              Check that every image file the database references actually exists in the target
              account. Anything listed as missing would show a broken image after a switch.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                disabled={busy}
                onClick={() => post({ action: 'verify', account: 'secondary' })}
                style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                Verify secondary account
              </button>
              <button
                disabled={busy}
                onClick={() => post({ action: 'verify', account: 'primary' })}
                style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                Verify primary account
              </button>
              <button
                disabled={busy || loading}
                onClick={load}
                style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                Refresh
              </button>
            </div>

            {verify && verify.missing?.length > 0 && (
              <div style={{ marginTop: 14, padding: 14, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca' }}>
                <strong style={{ fontSize: 14, color: '#991b1b' }}>
                  Missing from {verify.account} (showing up to 50):
                </strong>
                <ul style={{ margin: '8px 0 0 18px', fontSize: 12, color: '#7f1d1d', maxHeight: 220, overflow: 'auto' }}>
                  {verify.missing.map((p) => (
                    <li key={p} style={{ wordBreak: 'break-all' }}>{p}</li>
                  ))}
                </ul>
                <p style={{ fontSize: 12, color: '#7f1d1d', margin: '10px 0 0' }}>
                  Run <code>npm run storage:sync</code> to copy the missing files across.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
