import { createSupabaseServerClient } from '../../../../../lib/supabaseClient'
import dynamic from 'next/dynamic'

const AdminEditClient = dynamic(() => import('../../../../../components/AdminEditProductClient'), { ssr: false })

export default async function EditProduct({ params }){
  const id = params.id
  const supa = createSupabaseServerClient()
  const { data: product } = await supa.from('products').select('*').eq('id', id).single()
  if (!product) return <div className="container">Product not found</div>
  return (
    <div className="container">
      <h1>Edit {product.name}</h1>
      <AdminEditClient product={product} />
    </div>
  )
}
