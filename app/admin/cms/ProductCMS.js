'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const EMPTY_FORM = {
  name: '', slug: '', price: '', discount_price: '', stock: '0',
  description: '', short_description: '',
  category_id: '', brand_id: '',
  is_active: true, is_featured: false, is_best_seller: false, is_new_arrival: false,
  sku: '', meta_title: '', meta_description: '',
  shipping_weight: '', shipping_length: '', shipping_width: '', shipping_height: '',
  shipping_box_count: '1',
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductCMS() {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [meta, setMeta] = useState({ categories: [], brands: [] })

  // Editor state
  const [mode, setMode] = useState(null) // null | 'edit' | 'new'
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null) // { type: 'success'|'error', text }
  const [activeTab, setActiveTab] = useState('basic')

  // Image upload
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [uploading, setUploading] = useState(false)

  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  // Load meta (categories + brands) once
  useEffect(() => {
    fetch('/api/admin/meta')
      .then(r => r.json())
      .then(d => setMeta(d))
      .catch(() => {})
    loadProducts('', true)
  }, [])

  // Debounced product search
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      loadProducts(searchQuery)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchQuery])

  const loadProducts = async (q = '', all = false) => {
    setLoading(true)
    setLoadError(null)
    try {
      const params = new URLSearchParams({ limit: '60' })
      if (all || !q.trim()) params.set('all', 'true')
      else params.set('q', q.trim())
      const res = await fetch(`/api/admin/products/search?${params}`)
      const data = await res.json()
      if (!res.ok) {
        console.error('[ProductCMS] search API error:', data)
        setLoadError(data.error || `API error ${res.status}`)
        setProducts([])
      } else {
        setProducts(data.products || [])
      }
    } catch (e) {
      console.error('[ProductCMS] fetch failed:', e)
      setLoadError(e.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (product) => {
    setSelectedProduct(product)
    setForm({
      name: product.name || '',
      slug: product.slug || '',
      price: product.price ?? '',
      discount_price: product.discount_price ?? '',
      stock: product.stock ?? '0',
      description: product.description || '',
      short_description: product.short_description || '',
      category_id: product.category_id || '',
      brand_id: product.brand_id || '',
      is_active: product.is_active !== false,
      is_featured: product.is_featured || false,
      is_best_seller: product.is_best_seller || false,
      is_new_arrival: product.is_new_arrival || false,
      sku: product.sku || '',
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
      shipping_weight: product.shipping_weight ?? '',
      shipping_length: product.shipping_length ?? '',
      shipping_width: product.shipping_width ?? '',
      shipping_height: product.shipping_height ?? '',
      shipping_box_count: product.shipping_box_count ?? '1',
    })
    setImageFiles([])
    setImagePreviews([])
    setMode('edit')
    setActiveTab('basic')
    setSaveMsg(null)
  }

  const openNew = () => {
    setSelectedProduct(null)
    setForm({ ...EMPTY_FORM })
    setImageFiles([])
    setImagePreviews([])
    setMode('new')
    setActiveTab('basic')
    setSaveMsg(null)
  }

  const closeEditor = () => {
    setMode(null)
    setSelectedProduct(null)
    setSaveMsg(null)
  }

  const field = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => {
      const next = { ...f, [key]: val }
      // Auto-generate slug from name only in new mode
      if (key === 'name' && mode === 'new') {
        next.slug = slugify(val)
      }
      return next
    })
  }

  const handleImageFiles = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles(files)
    setImagePreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setSaveMsg({ type: 'error', text: 'Name is required' }); return }
    if (!form.slug.trim()) { setSaveMsg({ type: 'error', text: 'Slug is required' }); return }
    if (!form.price) { setSaveMsg({ type: 'error', text: 'Price is required' }); return }

    setSaving(true)
    setSaveMsg(null)
    try {
      let productId = selectedProduct?.id

      if (mode === 'new') {
        const res = await fetch('/api/admin/products/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ form }),
        })
        const data = await res.json()
        if (!res.ok) { setSaveMsg({ type: 'error', text: data.error || 'Failed to create product' }); return }
        productId = data.id
        setSelectedProduct(data.product)
        setMode('edit')
      } else {
        const res = await fetch(`/api/admin/products/${productId}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ form }),
        })
        const data = await res.json()
        if (!res.ok) { setSaveMsg({ type: 'error', text: data.error || 'Failed to update product' }); return }
        setSelectedProduct(data.product)
      }

      // Upload images if any
      if (imageFiles.length > 0) {
        setUploading(true)
        const fd = new FormData()
        imageFiles.forEach(f => fd.append('file', f))
        fd.append('product_id', productId)
        await fetch('/api/upload-image', { method: 'POST', body: fd })
        setImageFiles([])
        setImagePreviews([])
        setUploading(false)
      }

      setSaveMsg({ type: 'success', text: mode === 'new' ? 'Product created!' : 'Product saved!' })
      loadProducts(searchQuery || '', !searchQuery)
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message || 'Something went wrong' })
    } finally {
      setSaving(false)
    }
  }

  // Quick toggle is_active directly from the product list
  const handleToggleActive = async (product, e) => {
    e.stopPropagation()
    const newActive = !product.is_active
    try {
      const res = await fetch(`/api/admin/products/${product.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: { ...product, is_active: newActive } }),
      })
      if (res.ok) {
        setProducts(ps => ps.map(p => p.id === product.id ? { ...p, is_active: newActive } : p))
        // If this product is open in editor, sync form
        if (selectedProduct?.id === product.id) {
          setForm(f => ({ ...f, is_active: newActive }))
          setSelectedProduct(sp => ({ ...sp, is_active: newActive }))
        }
      }
    } catch (e) { console.error(e) }
  }

  return (
    <div className="cms-root">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="cms-sidebar">
        <div className="cms-sidebar-header">
          <h1 className="cms-title">Product CMS</h1>
          <button className="cms-new-btn" onClick={openNew}>+ New Product</button>
        </div>

        <div className="cms-search-wrap">
          <svg className="cms-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            ref={searchRef}
            className="cms-search"
            type="text"
            placeholder="Search by name or slug…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="cms-search-clear" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        <div className="cms-product-list">
          {loading && <div className="cms-loading"><span className="cms-spin" />Loading…</div>}
          {!loading && loadError && (
            <div className="cms-error">
              <strong>Error loading products</strong>
              <span>{loadError}</span>
              <button onClick={() => loadProducts('', true)}>Retry</button>
            </div>
          )}
          {!loading && !loadError && products.length === 0 && (
            <div className="cms-empty">No products found</div>
          )}
          {products.map(p => (
            <div
              key={p.id}
              className={`cms-product-item ${selectedProduct?.id === p.id ? 'active' : ''} ${!p.is_active ? 'inactive' : ''}`}
              onClick={() => openEdit(p)}
            >
              <div className="cpi-main">
                <span className="cpi-name">{p.name}</span>
                <span className="cpi-slug">{p.slug}</span>
              </div>
              <div className="cpi-right">
                <span className="cpi-price">₹{Number(p.discount_price || p.price).toLocaleString('en-IN')}</span>
                <button
                  className={`cpi-toggle ${p.is_active ? 'on' : 'off'}`}
                  onClick={(e) => handleToggleActive(p, e)}
                  title={p.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                >
                  {p.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Editor ──────────────────────────────────────── */}
      <main className="cms-editor">
        {!mode ? (
          <div className="cms-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <p>Select a product to edit, or create a new one</p>
            <button className="cms-new-btn" onClick={openNew}>+ New Product</button>
          </div>
        ) : (
          <>
            {/* Editor header */}
            <div className="cms-editor-header">
              <div className="ceh-left">
                <button className="ceh-back" onClick={closeEditor}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                </button>
                <div>
                  <h2 className="ceh-title">{mode === 'new' ? 'New Product' : (form.name || 'Edit Product')}</h2>
                  {mode === 'edit' && selectedProduct && (
                    <span className="ceh-sub">ID: {selectedProduct.id} · <a href={`/products/${form.slug}`} target="_blank" rel="noreferrer" className="ceh-link">View live ↗</a></span>
                  )}
                </div>
              </div>
              <div className="ceh-right">
                {/* Active toggle in header */}
                <label className="cms-active-toggle">
                  <input type="checkbox" checked={form.is_active} onChange={field('is_active')} />
                  <span className="cat-track"><span className="cat-thumb" /></span>
                  <span className="cat-label">{form.is_active ? 'Active' : 'Inactive'}</span>
                </label>
                <button className="cms-save-btn" onClick={handleSave} disabled={saving || uploading}>
                  {saving ? 'Saving…' : uploading ? 'Uploading…' : (mode === 'new' ? 'Create Product' : 'Save Changes')}
                </button>
              </div>
            </div>

            {/* Save message */}
            {saveMsg && (
              <div className={`cms-msg ${saveMsg.type}`}>
                {saveMsg.type === 'success' ? '✓' : '✕'} {saveMsg.text}
              </div>
            )}

            {/* Tabs */}
            <div className="cms-tabs">
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'description', label: 'Description' },
                { id: 'flags', label: 'Badges & Flags' },
                { id: 'shipping', label: 'Shipping' },
                { id: 'seo', label: 'SEO' },
                { id: 'images', label: 'Images' },
              ].map(t => (
                <button
                  key={t.id}
                  className={`cms-tab ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="cms-tab-body">

              {/* ── Basic Info ─────────────────────────────── */}
              {activeTab === 'basic' && (
                <div className="cms-form-grid">
                  <div className="cfg-full">
                    <label>Product Name *</label>
                    <input value={form.name} onChange={field('name')} placeholder="e.g. Oakwood Dining Table" />
                  </div>
                  <div className="cfg-full">
                    <label>Slug * <span className="cfg-hint">(used in URL: /products/<strong>{form.slug || '…'}</strong>)</span></label>
                    <input value={form.slug} onChange={field('slug')} placeholder="oakwood-dining-table" />
                  </div>
                  <div>
                    <label>SKU</label>
                    <input value={form.sku} onChange={field('sku')} placeholder="e.g. SC-DT-001" />
                  </div>
                  <div>
                    <label>Stock</label>
                    <input type="number" min="0" value={form.stock} onChange={field('stock')} />
                  </div>
                  <div>
                    <label>Price (₹) *</label>
                    <input type="number" min="0" step="0.01" value={form.price} onChange={field('price')} placeholder="14999" />
                  </div>
                  <div>
                    <label>Discount Price (₹) <span className="cfg-hint">leave blank if no discount</span></label>
                    <input type="number" min="0" step="0.01" value={form.discount_price} onChange={field('discount_price')} placeholder="11999" />
                  </div>
                  <div>
                    <label>Category</label>
                    <select value={form.category_id} onChange={field('category_id')}>
                      <option value="">— Select Category —</option>
                      {meta.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Brand</label>
                    <select value={form.brand_id} onChange={field('brand_id')}>
                      <option value="">— Select Brand —</option>
                      {meta.brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* ── Description ────────────────────────────── */}
              {activeTab === 'description' && (
                <div className="cms-form-col">
                  <div>
                    <label>Short Description <span className="cfg-hint">(shown on product card)</span></label>
                    <textarea
                      rows={3}
                      value={form.short_description}
                      onChange={field('short_description')}
                      placeholder="One-line summary of the product"
                    />
                  </div>
                  <div>
                    <label>Full Description</label>
                    <textarea
                      rows={12}
                      value={form.description}
                      onChange={field('description')}
                      placeholder="Detailed product description. Supports plain text."
                    />
                  </div>
                </div>
              )}

              {/* ── Badges & Flags ──────────────────────────── */}
              {activeTab === 'flags' && (
                <div className="cms-flags">
                  <p className="cms-flags-hint">These flags control badges and sections shown on the storefront.</p>
                  {[
                    { key: 'is_active', label: 'Active', desc: 'Product is visible to customers. Turn off to hide without deleting.' },
                    { key: 'is_featured', label: 'Featured', desc: 'Shows in the Featured Products section on the home page.' },
                    { key: 'is_best_seller', label: 'Best Seller', desc: 'Shows the "Best Seller" badge and appears in Best Sellers section.' },
                    { key: 'is_new_arrival', label: 'New Arrival', desc: 'Shows the "New" badge and appears in New Arrivals section.' },
                  ].map(flag => (
                    <label key={flag.key} className="cms-flag-row">
                      <div className="cfr-info">
                        <strong>{flag.label}</strong>
                        <span>{flag.desc}</span>
                      </div>
                      <div className={`cms-flag-toggle ${form[flag.key] ? 'on' : 'off'}`} onClick={() => setForm(f => ({ ...f, [flag.key]: !f[flag.key] }))}>
                        <div className="cft-thumb" />
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* ── Shipping ───────────────────────────────── */}
              {activeTab === 'shipping' && (
                <div className="cms-form-col">
                  <p className="cms-section-note">
                    These values are sent to <strong>BigShip /api/calculator</strong> to calculate shipping cost before payment.
                    <br/>Leave blank to use system defaults.
                  </p>
                  <div className="cms-form-grid">
                    <div>
                      <label>Dead Weight (kg)</label>
                      <input type="number" min="0" step="0.01" value={form.shipping_weight} onChange={field('shipping_weight')} placeholder="e.g. 15" />
                    </div>
                    <div>
                      <label>Boxes per Unit</label>
                      <input type="number" min="1" value={form.shipping_box_count} onChange={field('shipping_box_count')} placeholder="1" />
                      <span className="cfg-hint">Total boxes = boxes × quantity ordered</span>
                    </div>
                    <div>
                      <label>Length (cm)</label>
                      <input type="number" min="0" value={form.shipping_length} onChange={field('shipping_length')} placeholder="e.g. 120" />
                    </div>
                    <div>
                      <label>Width (cm)</label>
                      <input type="number" min="0" value={form.shipping_width} onChange={field('shipping_width')} placeholder="e.g. 60" />
                    </div>
                    <div>
                      <label>Height (cm)</label>
                      <input type="number" min="0" value={form.shipping_height} onChange={field('shipping_height')} placeholder="e.g. 80" />
                    </div>
                    <div className="cfg-full">
                      <div className="cms-shipping-preview">
                        <strong>Preview:</strong>&nbsp;
                        {form.shipping_weight ? `${form.shipping_weight} kg` : '—'},{' '}
                        {form.shipping_length && form.shipping_width && form.shipping_height
                          ? `${form.shipping_length}×${form.shipping_width}×${form.shipping_height} cm`
                          : '— dimensions'},{' '}
                        {form.shipping_box_count || 1} box{parseInt(form.shipping_box_count) > 1 ? 'es' : ''} per unit
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SEO ─────────────────────────────────────── */}
              {activeTab === 'seo' && (
                <div className="cms-form-col">
                  <div>
                    <label>Meta Title <span className="cfg-hint">({(form.meta_title || form.name || '').length}/60 chars)</span></label>
                    <input
                      value={form.meta_title}
                      onChange={field('meta_title')}
                      placeholder={form.name || 'Page title for search engines'}
                      maxLength={60}
                    />
                  </div>
                  <div>
                    <label>Meta Description <span className="cfg-hint">({(form.meta_description || '').length}/160 chars)</span></label>
                    <textarea
                      rows={3}
                      value={form.meta_description}
                      onChange={field('meta_description')}
                      placeholder="Brief description for search result snippets"
                      maxLength={160}
                    />
                  </div>
                  <div className="cms-seo-preview">
                    <div className="csp-title">{form.meta_title || form.name || 'Product Title'}</div>
                    <div className="csp-url">spacecraftsfurniture.in/products/{form.slug || 'product-slug'}</div>
                    <div className="csp-desc">{form.meta_description || form.short_description || form.description?.slice(0, 160) || 'Product description will appear here.'}</div>
                  </div>
                </div>
              )}

              {/* ── Images ──────────────────────────────────── */}
              {activeTab === 'images' && (
                <div className="cms-form-col">
                  {mode === 'new' && (
                    <p className="cms-section-note">Save the product first, then you can upload images.</p>
                  )}
                  <label>Upload Images</label>
                  <input type="file" multiple accept="image/*" onChange={handleImageFiles} className="cms-file-input" />
                  {imagePreviews.length > 0 && (
                    <div className="cms-image-grid">
                      {imagePreviews.map((url, i) => (
                        <div key={i} className="cms-image-thumb">
                          <img src={url} alt={`preview ${i + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}
                  {mode === 'edit' && imagePreviews.length === 0 && (
                    <p className="cfg-hint" style={{marginTop: 8}}>Select images above, then click Save Changes to upload.</p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom save bar */}
            <div className="cms-bottom-bar">
              {saveMsg && (
                <span className={`cms-msg-inline ${saveMsg.type}`}>
                  {saveMsg.type === 'success' ? '✓' : '✕'} {saveMsg.text}
                </span>
              )}
              <button className="cms-save-btn" onClick={handleSave} disabled={saving || uploading}>
                {saving ? 'Saving…' : uploading ? 'Uploading images…' : (mode === 'new' ? 'Create Product' : 'Save Changes')}
              </button>
            </div>
          </>
        )}
      </main>

      <style>{`
        * { box-sizing: border-box; }

        .cms-root {
          display: flex;
          height: 100vh;
          font-family: Inter, system-ui, sans-serif;
          background: #f5f5f7;
          overflow: hidden;
        }

        /* ── Sidebar ── */
        .cms-sidebar {
          width: 320px;
          min-width: 280px;
          max-width: 340px;
          background: #fff;
          border-right: 1px solid #e5e5e5;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .cms-sidebar-header {
          padding: 20px 16px 14px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .cms-title {
          font-size: 16px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
          white-space: nowrap;
        }
        .cms-new-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 7px 14px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s;
        }
        .cms-new-btn:hover { background: #333; }

        .cms-search-wrap {
          position: relative;
          padding: 10px 12px;
          border-bottom: 1px solid #f0f0f0;
        }
        .cms-search-icon {
          position: absolute;
          left: 22px;
          top: 50%;
          transform: translateY(-50%);
          color: #aaa;
          pointer-events: none;
        }
        .cms-search {
          width: 100%;
          padding: 8px 30px 8px 32px;
          border: 1px solid #e5e5e5;
          border-radius: 7px;
          font-size: 13px;
          outline: none;
          background: #fafafa;
          color: #1a1a1a;
          transition: border-color 0.15s;
        }
        .cms-search:focus { border-color: #1a1a1a; background: #fff; }
        .cms-search-clear {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 18px;
          color: #aaa;
          cursor: pointer;
          padding: 0 4px;
          line-height: 1;
        }

        .cms-product-list {
          flex: 1;
          overflow-y: auto;
          padding: 6px 0;
        }
        .cms-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 20px 16px;
          color: #999;
          font-size: 13px;
        }
        .cms-spin {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid #e5e5e5;
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: cmsSpin 0.7s linear infinite;
        }
        @keyframes cmsSpin { to { transform: rotate(360deg); } }
        .cms-empty {
          padding: 20px 16px;
          color: #aaa;
          font-size: 13px;
          text-align: center;
        }
        .cms-error {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 14px 16px;
          margin: 8px 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-size: 12px;
        }
        .cms-error strong { color: #dc2626; }
        .cms-error span { color: #7f1d1d; word-break: break-all; }
        .cms-error button {
          margin-top: 6px;
          padding: 4px 10px;
          background: #dc2626;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 12px;
          cursor: pointer;
          align-self: flex-start;
        }

        .cms-product-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          cursor: pointer;
          border-bottom: 1px solid #f7f7f7;
          transition: background 0.1s;
        }
        .cms-product-item:hover { background: #f5f5f7; }
        .cms-product-item.active { background: #f0f0f0; border-left: 3px solid #1a1a1a; }
        .cms-product-item.inactive { opacity: 0.55; }

        .cpi-main { flex: 1; min-width: 0; }
        .cpi-name {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cpi-slug {
          display: block;
          font-size: 11px;
          color: #999;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }
        .cpi-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }
        .cpi-price {
          font-size: 12px;
          font-weight: 700;
          color: #1a1a1a;
          white-space: nowrap;
        }
        .cpi-toggle {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .cpi-toggle.on { background: #dcfce7; color: #16a34a; }
        .cpi-toggle.off { background: #fee2e2; color: #dc2626; }
        .cpi-toggle.on:hover { background: #bbf7d0; }
        .cpi-toggle.off:hover { background: #fecaca; }

        /* ── Editor ── */
        .cms-editor {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #f5f5f7;
        }

        .cms-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: #bbb;
          font-size: 14px;
        }

        .cms-editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 24px;
          background: #fff;
          border-bottom: 1px solid #e5e5e5;
          flex-shrink: 0;
        }
        .ceh-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .ceh-back {
          background: #f5f5f5;
          border: none;
          border-radius: 7px;
          padding: 7px;
          cursor: pointer;
          color: #555;
          display: flex;
          align-items: center;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .ceh-back:hover { background: #e8e8e8; }
        .ceh-title {
          font-size: 17px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 300px;
        }
        .ceh-sub {
          display: block;
          font-size: 11px;
          color: #999;
          margin-top: 1px;
        }
        .ceh-link { color: #e67e22; text-decoration: none; }
        .ceh-link:hover { text-decoration: underline; }
        .ceh-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        /* Active toggle */
        .cms-active-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }
        .cms-active-toggle input { display: none; }
        .cat-track {
          width: 38px;
          height: 22px;
          background: #e5e5e5;
          border-radius: 11px;
          position: relative;
          transition: background 0.2s;
          display: block;
        }
        .cms-active-toggle input:checked + .cat-track { background: #16a34a; }
        .cat-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          background: #fff;
          border-radius: 50%;
          transition: left 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .cms-active-toggle input:checked + .cat-track .cat-thumb { left: 19px; }
        .cat-label { font-size: 13px; font-weight: 600; color: #555; }

        .cms-save-btn {
          padding: 9px 20px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .cms-save-btn:hover { background: #333; }
        .cms-save-btn:disabled { background: #aaa; cursor: not-allowed; }

        .cms-msg {
          margin: 0 24px 0;
          padding: 10px 16px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .cms-msg.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .cms-msg.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        /* Tabs */
        .cms-tabs {
          display: flex;
          gap: 0;
          padding: 0 24px;
          background: #fff;
          border-bottom: 1px solid #e5e5e5;
          overflow-x: auto;
          flex-shrink: 0;
        }
        .cms-tab {
          padding: 12px 16px;
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 600;
          color: #888;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
          transition: all 0.15s;
        }
        .cms-tab:hover { color: #1a1a1a; }
        .cms-tab.active { color: #1a1a1a; border-bottom-color: #1a1a1a; }

        .cms-tab-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        /* Form grid */
        .cms-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .cfg-full { grid-column: 1 / -1; }
        .cms-form-col { display: flex; flex-direction: column; gap: 18px; }

        .cms-form-grid label,
        .cms-form-col label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .cms-form-grid input,
        .cms-form-grid select,
        .cms-form-col input,
        .cms-form-col select,
        .cms-form-col textarea {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 7px;
          font-size: 14px;
          color: #1a1a1a;
          background: #fff;
          outline: none;
          transition: border-color 0.15s;
          font-family: inherit;
        }
        .cms-form-grid input:focus,
        .cms-form-grid select:focus,
        .cms-form-col input:focus,
        .cms-form-col select:focus,
        .cms-form-col textarea:focus {
          border-color: #1a1a1a;
        }
        .cfg-hint {
          font-size: 11px;
          font-weight: 400;
          color: #aaa;
          text-transform: none;
          letter-spacing: 0;
          display: block;
          margin-top: 3px;
        }

        /* Flags */
        .cms-flags { display: flex; flex-direction: column; gap: 2px; max-width: 560px; }
        .cms-flags-hint { font-size: 13px; color: #888; margin: 0 0 16px; }
        .cms-flag-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .cms-flag-row:hover { border-color: #1a1a1a; }
        .cfr-info { display: flex; flex-direction: column; gap: 3px; }
        .cfr-info strong { font-size: 14px; color: #1a1a1a; }
        .cfr-info span { font-size: 12px; color: #888; }
        .cms-flag-toggle {
          width: 44px;
          height: 26px;
          border-radius: 13px;
          background: #e5e5e5;
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .cms-flag-toggle.on { background: #1a1a1a; }
        .cft-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0,0,0,0.18);
          transition: left 0.2s;
        }
        .cms-flag-toggle.on .cft-thumb { left: 21px; }

        /* Shipping */
        .cms-section-note {
          background: #fff8ec;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #92400e;
          line-height: 1.5;
          margin-bottom: 4px;
        }
        .cms-shipping-preview {
          background: #f0f0f0;
          border-radius: 7px;
          padding: 10px 14px;
          font-size: 13px;
          color: #555;
        }

        /* SEO */
        .cms-seo-preview {
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          padding: 16px 18px;
          background: #fff;
        }
        .csp-title { font-size: 18px; color: #1a0dab; font-weight: 400; margin-bottom: 3px; }
        .csp-url { font-size: 13px; color: #006621; margin-bottom: 5px; }
        .csp-desc { font-size: 13px; color: #545454; line-height: 1.5; }

        /* Images */
        .cms-file-input { display: block; margin-top: 6px; font-size: 13px; }
        .cms-image-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
        .cms-image-thumb {
          width: 100px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e5e5;
          background: #f5f5f5;
        }
        .cms-image-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* Bottom bar */
        .cms-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 14px 24px;
          background: #fff;
          border-top: 1px solid #e5e5e5;
          flex-shrink: 0;
        }
        .cms-msg-inline {
          font-size: 13px;
          font-weight: 600;
        }
        .cms-msg-inline.success { color: #16a34a; }
        .cms-msg-inline.error { color: #dc2626; }

        /* Responsive */
        @media (max-width: 768px) {
          .cms-root { flex-direction: column; height: auto; min-height: 100vh; overflow: auto; }
          .cms-sidebar { width: 100%; max-width: 100%; height: auto; border-right: none; border-bottom: 1px solid #e5e5e5; }
          .cms-product-list { max-height: 260px; }
          .cms-editor { height: auto; overflow: visible; }
          .cms-tab-body { overflow: visible; }
          .cms-form-grid { grid-template-columns: 1fr; }
          .cfg-full { grid-column: 1; }
          .ceh-title { max-width: 160px; }
        }
      `}</style>
    </div>
  )
}
