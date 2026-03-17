"use client"
import { useState, useEffect } from 'react'

export default function NewProduct(){
  const [form, setForm] = useState({ name:'', slug:'', price:'', discount_price:'', stock:0, description:'', category_id:'', brand_id:'' })
  const [images, setImages] = useState([])
  const [meta, setMeta] = useState({ categories: [], brands: [] })
  const [errors, setErrors] = useState({})

  useEffect(()=>{
    const loadMeta = async ()=>{
      const res = await fetch('/api/admin/meta')
      const json = await res.json()
      setMeta(json)
    }
    loadMeta()
  }, [])

  const handleFile = (e) => {
    const f = Array.from(e.target.files)
    setImages(f)
    setPreviews(f.map(file => ({ name: file.name, url: URL.createObjectURL(file) })))
  }
  const [previews, setPreviews] = useState([])
  const router = require('next/navigation').useRouter()

  function validate() {
    const errs = {}
    if (!form.name) errs.name = 'Name is required'
    if (!form.slug) errs.slug = 'Slug is required'
    if (!form.price) errs.price = 'Price is required'
    return errs
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    const res = await fetch('/api/admin/products/create', {
      method:'POST', body: JSON.stringify({ form }), headers: {'Content-Type':'application/json'}
    })
    const json = await res.json()
    if (json.id && images.length) {
      const fd = new FormData()
      images.forEach(f=>fd.append('file', f))
      fd.append('product_id', json.id)
      await fetch('/api/upload-image', { method:'POST', body: fd })
    }
    alert('Created product')
    router.push('/admin/products')
  }

  return (
    <div className="container">
      <h1>New Product</h1>
      <form onSubmit={submit}>
        <div>
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          {errors.name && <div style={{color:'red'}}>{errors.name}</div>}
        </div>
        <div>
          <input placeholder="Slug" value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} />
          {errors.slug && <div style={{color:'red'}}>{errors.slug}</div>}
        </div>
        <div>
          <input placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} />
          {errors.price && <div style={{color:'red'}}>{errors.price}</div>}
        </div>
        <div>
          <input placeholder="Discount Price" value={form.discount_price} onChange={e=>setForm({...form, discount_price:e.target.value})} />
        </div>
        <div>
          <input placeholder="Stock" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} />
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
          <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        </div>
        <div>
          <input type="file" multiple accept="image/*" onChange={handleFile} />
          <div style={{display:'flex', gap:8, marginTop:8}}>
            {previews.map(p=> (
              <img key={p.name} src={p.url} alt={p.name} width={100} style={{objectFit:'cover', border:'1px solid #eee'}} />
            ))}
          </div>
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  )
}
