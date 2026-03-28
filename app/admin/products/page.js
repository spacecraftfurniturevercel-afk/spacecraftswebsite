import { createSupabaseServerClient } from '../../../lib/supabaseClient'

export default async function AdminProducts() {
  // server-only: list products and provide links to edit
  const supa = createSupabaseServerClient()
  const { data: products } = await supa.from('products').select('*').limit(100)
  return (
    <div className="container">
      <h1>Admin — Products</h1>
      <p style={{marginBottom: '12px'}}>
        <a href="/admin/cms" style={{
          display: 'inline-block', padding: '10px 20px',
          background: '#1a1a1a', color: '#fff', borderRadius: '8px',
          textDecoration: 'none', fontWeight: '700', fontSize: '14px'
        }}>
          Open Product CMS ↗
        </a>
        <span style={{marginLeft: '12px', fontSize: '13px', color: '#888'}}>
          Search, edit, add products and manage active/inactive status
        </span>
      </p>
      <ul>
        {products?.map(p => (
          <li key={p.id}>{p.name} ({p.is_active ? '✓ active' : '✕ inactive'}) — <a href={`/admin/products/${p.id}/edit`}>Edit</a></li>
        ))}
      </ul>
    </div>
  )
}
