import { createSupabaseServerClient } from '../../../lib/supabaseClient'

export default async function AdminProducts() {
  // server-only: list products and provide links to edit
  const supa = createSupabaseServerClient()
  const { data: products } = await supa.from('products').select('*').limit(100)
  return (
    <div className="container">
      <h1>Admin — Products</h1>
      <ul>
        {products?.map(p => (
          <li key={p.id}>{p.name} — <a href={`/admin/products/${p.id}/edit`}>Edit</a></li>
        ))}
      </ul>
    </div>
  )
}
