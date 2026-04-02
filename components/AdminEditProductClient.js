"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PRESET_TAGS = [
  // Room / Style
  { slug: 'living-room', label: 'Living Room', group: 'Room & Style' },
  { slug: 'bedroom', label: 'Bed Room', group: 'Room & Style' },
  { slug: 'dining-room', label: 'Dining Room', group: 'Room & Style' },
  { slug: 'study-room', label: 'Study Room', group: 'Room & Style' },
  { slug: 'best-offers', label: 'Best Offers', group: 'Room & Style' },
  { slug: 'solid-wood', label: 'Solid Wood', group: 'Room & Style' },
  { slug: 'engineered-wood', label: 'Engineered Wood', group: 'Room & Style' },
  { slug: 'luxury-furniture', label: 'Luxury Furniture', group: 'Room & Style' },
  // Product Type
  { slug: '2-seater', label: '2 Seater', group: 'Product Type' },
  { slug: '3-1-1-sofas', label: '3+1+1 Sofas', group: 'Product Type' },
  { slug: 'book-racks', label: 'Book Racks', group: 'Product Type' },
  { slug: 'book-shelves', label: 'Book Shelves', group: 'Product Type' },
  { slug: 'bunk-beds', label: 'Bunk Beds', group: 'Product Type' },
  { slug: 'coffee-tables', label: 'Coffee Tables', group: 'Product Type' },
  { slug: 'corner-sofas', label: 'Corner Sofas', group: 'Product Type' },
  { slug: 'cushion-sofas', label: 'Cushion Sofas', group: 'Product Type' },
  { slug: 'diwans', label: 'Diwans', group: 'Product Type' },
  { slug: 'diwan-cum-beds', label: 'Diwan Cum Beds', group: 'Product Type' },
  { slug: 'dining-sets', label: 'Dining Sets', group: 'Product Type' },
  { slug: 'dressing-tables', label: 'Dressing Tables', group: 'Product Type' },
  { slug: 'foldable-chairs', label: 'Foldable Chairs', group: 'Product Type' },
  { slug: 'foldable-tables', label: 'Foldable Tables', group: 'Product Type' },
  { slug: 'folding-beds', label: 'Folding Beds', group: 'Product Type' },
  { slug: 'folding-dinings', label: 'Folding Dinings', group: 'Product Type' },
  { slug: 'futon-beds', label: 'Futon Beds', group: 'Product Type' },
  { slug: 'lazy-chairs', label: 'Lazy Chairs', group: 'Product Type' },
  { slug: 'metal-cots', label: 'Metal Cots', group: 'Product Type' },
  { slug: 'office-chairs', label: 'Office Chairs', group: 'Product Type' },
  { slug: 'recliner-folding-beds', label: 'Recliner Folding Beds', group: 'Product Type' },
  { slug: 'recliner-sofas', label: 'Recliner Sofas', group: 'Product Type' },
  { slug: 'rocking-chairs', label: 'Rocking Chairs', group: 'Product Type' },
  { slug: 'shoe-racks', label: 'Shoe Racks', group: 'Product Type' },
  { slug: 'sofa-beds', label: 'Sofa Beds', group: 'Product Type' },
  { slug: 'sofa-cum-beds', label: 'Sofa Cum Beds', group: 'Product Type' },
  { slug: 'space-saving-furniture', label: 'Space Saving Furniture', group: 'Product Type' },
  { slug: 'study-chairs', label: 'Study Chairs', group: 'Product Type' },
  { slug: 'study-tables', label: 'Study Tables', group: 'Product Type' },
  { slug: 'tv-racks', label: 'TV Racks', group: 'Product Type' },
  { slug: 'wardrobes', label: 'Wardrobes', group: 'Product Type' },
  { slug: 'wooden-beds', label: 'Wooden Beds', group: 'Product Type' },
  { slug: 'wooden-dinings', label: 'Wooden Dinings', group: 'Product Type' },
  // Badges
  { slug: 'bestseller', label: 'Bestseller', group: 'Badges' },
  { slug: 'trending', label: 'Trending', group: 'Badges' },
  { slug: 'new-arrival', label: 'New Arrival', group: 'Badges' },
]

const GROUPS = ['Room & Style', 'Product Type', 'Badges']

export default function AdminEditProductClient({ product }) {
  const router = useRouter()
  const [form, setForm] = useState({ ...product })
  const [tags, setTags] = useState(Array.isArray(product.tags) ? product.tags : [])
  const [customTagInput, setCustomTagInput] = useState('')
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [meta, setMeta] = useState({ categories: [], brands: [] })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetch('/api/admin/meta')
      .then(r => r.json())
      .then(json => setMeta(json))
      .catch(() => {})
  }, [])

  const toggleTag = (slug) => {
    setTags(prev =>
      prev.includes(slug) ? prev.filter(t => t !== slug) : [...prev, slug]
    )
  }

  const removeTag = (slug) => {
    setTags(prev => prev.filter(t => t !== slug))
  }

  const addCustomTag = () => {
    const val = customTagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (!val || tags.includes(val)) return
    setTags(prev => [...prev, val])
    setCustomTagInput('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/products/${product.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: { ...form, tags } })
      })
      if (!res.ok) throw new Error('Save failed')
      if (files.length) {
        const fd = new FormData()
        files.forEach(f => fd.append('file', f))
        fd.append('product_id', product.id)
        await fetch('/api/upload-image', { method: 'POST', body: fd })
      }
      setMessage({ type: 'success', text: 'Product updated successfully!' })
      setTimeout(() => router.push('/admin/products'), 1200)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleFiles = (e) => {
    const f = Array.from(e.target.files)
    setFiles(f)
    setPreviews(f.map(file => ({ name: file.name, url: URL.createObjectURL(file) })))
  }

  const presetSlugs = new Set(PRESET_TAGS.map(t => t.slug))
  const customTags = tags.filter(t => !presetSlugs.has(t))

  return (
    <form onSubmit={submit} style={{ maxWidth: 860, padding: '24px 0', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 20,
          background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          fontWeight: 500,
          fontSize: 14
        }}>
          {message.text}
        </div>
      )}

      <div style={sectionStyle}>
        <h3 style={sectionTitle}>Basic Info</h3>
        <div style={rowStyle}>
          <label style={labelStyle}>Product Name</label>
          <input style={inputStyle} value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div style={rowStyle}>
          <label style={labelStyle}>Slug</label>
          <input style={inputStyle} value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={rowStyle}>
            <label style={labelStyle}>Category</label>
            <select style={inputStyle} value={form.category_id || ''} onChange={e => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Select Category</option>
              {meta.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Brand</label>
            <select style={inputStyle} value={form.brand_id || ''} onChange={e => setForm({ ...form, brand_id: e.target.value })}>
              <option value="">Select Brand</option>
              {meta.brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>
        <div style={rowStyle}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>

      {/* Tags Section */}
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>Tags</h3>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
          Tags control which filters a product appears in (Room & Style, Product Type, Badges) and which nav section links show it.
        </p>

        {/* Current tags */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#999', marginBottom: 8 }}>
            Applied Tags ({tags.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 38, padding: '8px 12px', background: '#fafafa', borderRadius: 8, border: '1px solid #e5e5e5' }}>
            {tags.length === 0 && <span style={{ fontSize: 13, color: '#bbb' }}>No tags added yet</span>}
            {tags.map(tag => (
              <span key={tag} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', background: '#1a1a1a', color: '#fff',
                borderRadius: 100, fontSize: 12, fontWeight: 500
              }}>
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14 }}
                  aria-label={`Remove tag ${tag}`}
                >×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Preset tag groups */}
        {GROUPS.map(group => {
          const groupTags = PRESET_TAGS.filter(t => t.group === group)
          return (
            <div key={group} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#999', marginBottom: 8 }}>
                {group}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {groupTags.map(tag => {
                  const active = tags.includes(tag.slug)
                  return (
                    <button
                      key={tag.slug}
                      type="button"
                      onClick={() => toggleTag(tag.slug)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: active ? '1px solid #1a1a1a' : '1px solid #ddd',
                        background: active ? '#1a1a1a' : '#f7f7f7',
                        color: active ? '#fff' : '#555',
                        transition: 'all 0.15s',
                        display: 'inline-flex', alignItems: 'center', gap: 4
                      }}
                    >
                      {active && <span style={{ fontSize: 10 }}>✓</span>}
                      {tag.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Custom tag input */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#999', marginBottom: 8 }}>
            Add Custom Tag
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={customTagInput}
              onChange={e => setCustomTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag() } }}
              placeholder="e.g. sale, new-arrival, featured"
              style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
            />
            <button
              type="button"
              onClick={addCustomTag}
              style={{ padding: '8px 18px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Add
            </button>
          </div>
          {customTags.length > 0 && (
            <p style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
              Custom: {customTags.join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Images */}
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>Images</h3>
        <input type="file" multiple accept="image/*" onChange={handleFiles} style={{ fontSize: 13 }} />
        {previews.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {previews.map(p => (
              <img key={p.name} src={p.url} alt={p.name} width={100} height={100} style={{ objectFit: 'cover', border: '1px solid #eee', borderRadius: 6 }} />
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        style={{
          padding: '12px 36px',
          background: saving ? '#999' : '#1a1a1a',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s'
        }}
      >
        {saving ? 'Saving…' : 'Save Product'}
      </button>
    </form>
  )
}

const sectionStyle = {
  background: '#fff',
  border: '1px solid #eee',
  borderRadius: 10,
  padding: '20px 24px',
  marginBottom: 20,
}

const sectionTitle = {
  fontSize: 15,
  fontWeight: 700,
  color: '#1a1a1a',
  margin: '0 0 16px',
  paddingBottom: 12,
  borderBottom: '1px solid #f0f0f0',
}

const rowStyle = {
  marginBottom: 14,
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#555',
  marginBottom: 5,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #ddd',
  borderRadius: 8,
  fontSize: 13,
  color: '#333',
  background: '#fafafa',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
}

