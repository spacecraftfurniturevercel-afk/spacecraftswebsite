"use client"
import { useState } from 'react'

export default function AdminEditProductClient({ product }){
  const [form, setForm] = useState({ ...product })
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const router = require('next/navigation').useRouter()
  const [meta, setMeta] = useState({ categories: [], brands: [] })

  useEffect(()=>{
    const load = async ()=>{
      const res = await fetch('/api/admin/meta')
      const json = await res.json()
      setMeta(json)
    }
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    await fetch(`/api/admin/products/${product.id}/update`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ form }) })
    if (files.length) {
      const fd = new FormData()
      files.forEach(f=>fd.append('file', f))
      fd.append('product_id', product.id)
      await fetch('/api/upload-image', { method:'POST', body: fd })
    }
    alert('Updated')
    router.push('/admin/products')
  }

  const handleFiles = (e) => {
    const f = Array.from(e.target.files)
    setFiles(f)
    setPreviews(f.map(file=>({ name: file.name, url: URL.createObjectURL(file) })))
  }

  return (
    <form onSubmit={submit}>
      <div>
        <input value={form.name||''} onChange={e=>setForm({...form, name:e.target.value})} />
      </div>
      <div>
        <input value={form.slug||''} onChange={e=>setForm({...form, slug:e.target.value})} />
      </div>
      <div>
        <select value={form.category_id||''} onChange={e=>setForm({...form, category_id: e.target.value})}>
          <option value="">Select Category</option>
          {meta.categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <select value={form.brand_id||''} onChange={e=>setForm({...form, brand_id: e.target.value})}>
          <option value="">Select Brand</option>
          {meta.brands.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div>
        <textarea value={form.description||''} onChange={e=>setForm({...form, description:e.target.value})} />
      </div>
      <input type="file" multiple accept="image/*" onChange={handleFiles} />
      <div style={{display:'flex', gap:8, marginTop:8}}>
        {previews.map(p=> <img key={p.name} src={p.url} alt={p.name} width={100} style={{objectFit:'cover', border:'1px solid #eee'}} />)}
      </div>
      <button type="submit">Save</button>
    </form>
  )
}
