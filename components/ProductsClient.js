'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_TAGS = [
  { slug: 'living-room', name: 'Living Room' },
  { slug: 'bedroom', name: 'Bed Room' },
  { slug: 'dining-room', name: 'Dining Room' },
  { slug: 'study-room', name: 'Study Room' },
  { slug: 'best-offers', name: 'Best Offers' },
  { slug: 'solid-wood', name: 'Solid Wood' },
  { slug: 'engineered-wood', name: 'Engineered Wood' },
  { slug: 'luxury-furniture', name: 'Luxury Furniture' },
]

export default function ProductsClient({ 
  initialProducts, 
  categories, 
  brands, 
  subCategories = [],
  searchParams, 
  categoryPage,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0
}) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [filters, setFilters] = useState({
    categories: searchParams?.categories ? searchParams.categories.split(',') : [],
    brands: searchParams?.brands ? searchParams.brands.split(',') : [],
    subcategories: searchParams?.subcategories ? searchParams.subcategories.split(',') : [],
    tags: searchParams?.tags ? searchParams.tags.split(',') : (searchParams?.tag ? [searchParams.tag] : []),
    minPrice: searchParams?.minPrice || '',
    maxPrice: searchParams?.maxPrice || '',
    sort: searchParams?.sort || 'rating-desc',
    q: searchParams?.q || searchParams?.search || ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [view, setView] = useState('grid')
  const [isLoading, setIsLoading] = useState(false)

  // Sync products when server data changes
  useEffect(() => {
    setProducts(initialProducts)
    setIsLoading(false)
  }, [initialProducts])

  // Also sync when searchParams change (handles Router Cache scenarios)
  const searchParamsKey = JSON.stringify(searchParams || {})
  useEffect(() => {
    setFilters({
      categories: searchParams?.categories ? searchParams.categories.split(',') : [],
      brands: searchParams?.brands ? searchParams.brands.split(',') : [],
      subcategories: searchParams?.subcategories ? searchParams.subcategories.split(',') : [],
      tags: searchParams?.tags ? searchParams.tags.split(',') : (searchParams?.tag ? [searchParams.tag] : []),
      minPrice: searchParams?.minPrice || '',
      maxPrice: searchParams?.maxPrice || '',
      sort: searchParams?.sort || 'rating-desc',
      q: searchParams?.q || searchParams?.search || ''
    })
    setProducts(initialProducts)
    setIsLoading(false)
  }, [searchParamsKey])

  const buildUrl = useCallback((newFilters, page) => {
    const params = new URLSearchParams()
    if (newFilters.sort && newFilters.sort !== 'rating-desc') params.set('sort', newFilters.sort)
    if (newFilters.brands?.length > 0) params.set('brands', newFilters.brands.join(','))
    if (newFilters.subcategories?.length > 0) params.set('subcategories', newFilters.subcategories.join(','))
    if (newFilters.tags?.length > 0) params.set('tags', newFilters.tags.join(','))
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice)
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice)
    if (newFilters.q) params.set('q', newFilters.q)
    if (page && page > 1) params.set('page', page.toString())
    if (newFilters.categories?.length > 0) params.set('categories', newFilters.categories.join(','))
    const qs = params.toString()
    return `/products${qs ? '?' + qs : ''}`
  }, [])

  const updateFilters = useCallback((newFilters) => {
    setIsLoading(true)
    router.push(buildUrl(newFilters, 1), { scroll: false })
  }, [router, buildUrl])

  const handleMultiSelect = (key, value) => {
    const currentArray = filters[key] || []
    let newArray
    if (currentArray.includes(value)) {
      newArray = currentArray.filter(item => item !== value)
    } else {
      newArray = [...currentArray, value]
    }
    const newFilters = { ...filters, [key]: newArray }
    setFilters(newFilters)
    updateFilters(newFilters)
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateFilters(newFilters)
  }

  const clearFilters = () => {
    // On any category/subcategory page, navigate back to /products
    if (categoryPage) {
      setIsLoading(true)
      router.push('/products', { scroll: false })
      return
    }
    const cleared = {
      categories: [],
      brands: [],
      subcategories: [],
      tags: [],
      minPrice: '',
      maxPrice: '',
      sort: 'rating-desc',
      q: ''
    }
    setFilters(cleared)
    setIsLoading(true)
    router.push(buildUrl(cleared, 1))
    router.refresh()
  }

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return
    setIsLoading(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    router.push(buildUrl(filters, page))
  }

  const activeFilterCount = (() => {
    let count = filters.brands.length + (filters.subcategories?.length || 0) + (filters.tags?.length || 0) + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0) + (filters.q ? 1 : 0)
    // On any category/subcategory page, count it as an active filter
    if (categoryPage) {
      count += 1
    }
    // Count extra categories beyond the current page
    if (categoryPage) {
      count += filters.categories.filter(c => c !== categoryPage.slug).length
    } else {
      count += filters.categories.length
    }
    return count
  })()

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="products-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/products">Products</Link></li>
              {categoryPage && (
                <li className="breadcrumb-item active" aria-current="page">{categoryPage.name}</li>
              )}
            </ol>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <motion.h1 
            className="page-title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {categoryPage ? categoryPage.name : 'All Products'}
          </motion.h1>
          <motion.p 
            className="page-subtitle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {categoryPage 
              ? `Browse our ${categoryPage.name.toLowerCase()} collection`
              : 'Discover premium furniture for every room'
            }
            {totalCount > 0 && <span className="total-badge">{totalCount} items</span>}
          </motion.p>
        </div>
      </div>

      <div className="container products-container">
        {/* Toolbar */}
        <div className="products-toolbar">
          <div className="toolbar-left">
            <button 
              className={`sidebar-toggle-btn ${sidebarOpen ? 'active' : ''}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="4" y1="12" x2="16" y2="12"/>
                <line x1="4" y1="18" x2="12" y2="18"/>
              </svg>
              Filters
              {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            </button>
            <button 
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="4" y1="12" x2="16" y2="12"/>
                <line x1="4" y1="18" x2="12" y2="18"/>
              </svg>
              Filters
              {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            </button>
            <span className="results-count">
              {totalCount > 0 
                ? `Showing ${((currentPage - 1) * 16) + 1}\u2013${Math.min(currentPage * 16, totalCount)} of ${totalCount}`
                : `${products.length} Products`
              }
            </span>
          </div>
          
          <div className="toolbar-right">
            <select 
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="sort-select"
            >
              <option value="rating-desc">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="newest">Newest First</option>
            </select>

            <div className="view-toggle">
              <button 
                className={view === 'grid' ? 'active' : ''}
                onClick={() => setView('grid')}
                aria-label="Grid view"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <rect x="2" y="2" width="7" height="7" rx="1"/>
                  <rect x="11" y="2" width="7" height="7" rx="1"/>
                  <rect x="2" y="11" width="7" height="7" rx="1"/>
                  <rect x="11" y="11" width="7" height="7" rx="1"/>
                </svg>
              </button>
              <button 
                className={view === 'list' ? 'active' : ''}
                onClick={() => setView('list')}
                aria-label="List view"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <rect x="2" y="3" width="16" height="3" rx="1"/>
                  <rect x="2" y="8" width="16" height="3" rx="1"/>
                  <rect x="2" y="13" width="16" height="3" rx="1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className={`products-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {/* Sidebar Filters */}
          <aside className={`products-sidebar ${showFilters ? 'show' : ''} ${sidebarOpen ? '' : 'desktop-hidden'}`}>
            <div className="sidebar-header">
              <span className="sidebar-title">Filters</span>
              {activeFilterCount > 0 && (
                <button className="clear-all-btn" onClick={clearFilters}>Clear all</button>
              )}
              <button className="close-sidebar" onClick={() => setShowFilters(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="sidebar-body">
              {/* Search */}
              <div className="filter-group">
                <div className="filter-search-wrap">
                  <svg className="filter-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.q}
                    onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
                    onBlur={() => updateFilters(filters)}
                    onKeyDown={(e) => { if (e.key === 'Enter') updateFilters(filters) }}
                    className="filter-search-input"
                  />
                </div>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="filter-group">
                  <div className="filter-group-title">Category</div>
                  <div className="filter-chips">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        className={`chip ${filters.categories.includes(cat.slug) ? 'active' : ''}`}
                        onClick={() => {
                          if (categoryPage) {
                            setIsLoading(true)
                            // On category/subcategory page — navigate
                            if (!categoryPage.isSubCategory && filters.categories.includes(cat.slug)) {
                              router.push('/products', { scroll: false })
                            } else {
                              router.push(`/products/category/${cat.slug}`, { scroll: false })
                            }
                          } else {
                            // On /products — multi-select
                            handleMultiSelect('categories', cat.slug)
                          }
                        }}
                      >
                        {filters.categories.includes(cat.slug) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Type (Sub-categories) */}
              {subCategories.length > 0 && (
                <div className="filter-group">
                  <div className="filter-group-title">Product Type</div>
                  <div className="filter-chips filter-chips-scroll">
                    {subCategories.map(sub => {
                      const isActive = categoryPage?.isSubCategory
                        ? (categoryPage.slug === sub.slug || categoryPage.tagSlug === sub.slug)
                        : filters.subcategories?.includes(sub.slug)
                      return (
                        <button
                          key={sub.slug}
                          className={`chip ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            if (categoryPage?.isSubCategory) {
                              setIsLoading(true)
                              // If clicking the active subcategory, deselect by going to /products
                              if (categoryPage.slug === sub.slug || categoryPage.tagSlug === sub.slug) {
                                router.push('/products', { scroll: false })
                              } else {
                                router.push(`/products/category/${sub.slug}`, { scroll: false })
                              }
                            } else {
                              // On /products or main category page — multi-select
                              handleMultiSelect('subcategories', sub.slug)
                            }
                          }}
                        >
                          {isActive && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                          {sub.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Room / Style Tags */}
              <div className="filter-group">
                <div className="filter-group-title">Room &amp; Style</div>
                <div className="filter-chips">
                  {NAV_TAGS.map(tag => (
                    <button
                      key={tag.slug}
                      className={`chip ${filters.tags?.includes(tag.slug) ? 'active' : ''}`}
                      onClick={() => handleMultiSelect('tags', tag.slug)}
                    >
                      {filters.tags?.includes(tag.slug) && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div className="filter-group">
                  <div className="filter-group-title">Brand</div>
                  <div className="filter-chips">
                    {brands.map(brand => (
                      <button
                        key={brand.id}
                        className={`chip ${filters.brands.includes(brand.slug) ? 'active' : ''}`}
                        onClick={() => handleMultiSelect('brands', brand.slug)}
                      >
                        {filters.brands.includes(brand.slug) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="filter-group">
                <div className="filter-group-title">Price Range</div>
                <div className="price-inputs">
                  <div className="price-field">
                    <span className="price-prefix">₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                      onBlur={() => updateFilters(filters)}
                      onKeyDown={(e) => { if (e.key === 'Enter') updateFilters(filters) }}
                      className="price-input"
                    />
                  </div>
                  <span className="price-dash">–</span>
                  <div className="price-field">
                    <span className="price-prefix">₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                      onBlur={() => updateFilters(filters)}
                      onKeyDown={(e) => { if (e.key === 'Enter') updateFilters(filters) }}
                      className="price-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile overlay */}
          {showFilters && <div className="sidebar-overlay" onClick={() => setShowFilters(false)} />}

          {/* Main Content */}
          <main className="products-main">
            {isLoading && (
              <div className="loading-bar" />
            )}

            {products.length === 0 && !isLoading ? (
              <motion.div 
                className="no-products"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  className={`products-grid ${view === 'list' ? 'list-view' : ''}`}
                  layout
                  style={{ opacity: isLoading ? 0.4 : 1, transition: 'opacity 0.2s ease' }}
                >
                  <AnimatePresence mode="popLayout">
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.35, delay: index * 0.04 }}
                        layout
                      >
                        <ProductCard product={product} view={view} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="pagination" aria-label="Products pagination">
                    <button 
                      className="page-btn prev"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                      Prev
                    </button>

                    <div className="page-numbers">
                      {getPageNumbers().map((page, i) => (
                        page === '...' ? (
                          <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
                        ) : (
                          <button
                            key={page}
                            className={`page-btn number ${page === currentPage ? 'active' : ''}`}
                            onClick={() => goToPage(page)}
                            aria-label={`Page ${page}`}
                            aria-current={page === currentPage ? 'page' : undefined}
                          >
                            {page}
                          </button>
                        )
                      ))}
                    </div>

                    <button 
                      className="page-btn next"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                    >
                      Next
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                  </nav>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <style jsx global>{`
        .products-page {
          background: #fafafa;
          min-height: 100vh;
          padding-bottom: 60px;
        }

        .breadcrumb-section {
          background: #ffffff;
          padding: 10px 0;
          border-bottom: 1px solid #e5e5e5;
        }

        .breadcrumb {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 2px;
          flex-wrap: wrap;
          align-items: center;
        }

        .breadcrumb-item {
          color: #1a1a1a;
          font-size: 12px;
          font-weight: 400;
        }

        .breadcrumb-item a {
          color: #e67e22;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .breadcrumb-item a:hover {
          color: #d35400;
        }

        .breadcrumb-item.active {
          color: #333;
          font-weight: 500;
        }

        .breadcrumb-item:not(:last-child)::after {
          content: '›';
          margin: 0 6px;
          color: #ccc;
          font-size: 13px;
        }

        .page-header {
          background: #fff;
          padding: 14px 0 10px;
          border-bottom: 1px solid #eee;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          font-size: 14px;
          color: #888;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .total-badge {
          background: #f0f0f0;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #555;
        }

        .container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .products-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          gap: 12px;
          flex-wrap: wrap;
        }

        .toolbar-left,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sidebar-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: #333;
        }

        .sidebar-toggle-btn:hover {
          border-color: #222;
        }

        .sidebar-toggle-btn.active {
          background: #222;
          color: #fff;
          border-color: #222;
        }

        .filter-count {
          background: #e67e22;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .filter-toggle-btn {
          display: none;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: #333;
        }

        .results-count {
          font-size: 13px;
          color: #888;
          font-weight: 500;
        }

        .sort-select {
          padding: 7px 28px 7px 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          background: #fff;
          color: #444;
          transition: border-color 0.2s;
        }

        .sort-select:hover,
        .sort-select:focus {
          border-color: #222;
          outline: none;
        }

        .view-toggle {
          display: flex;
          gap: 2px;
          background: #f0f0f0;
          padding: 3px;
          border-radius: 6px;
        }

        .view-toggle button {
          padding: 5px 8px;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s;
          color: #aaa;
          display: flex;
          align-items: center;
        }

        .view-toggle button.active {
          background: #fff;
          color: #222;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .products-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .products-layout {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          position: relative;
        }

        .products-sidebar {
          width: 250px;
          flex-shrink: 0;
          background: #fff;
          border-radius: 10px;
          position: sticky;
          top: 90px;
          max-height: calc(100vh - 100px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid #eee;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .products-sidebar.desktop-hidden {
          display: none;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 16px;
          border-bottom: 1px solid #f0f0f0;
          background: #fff;
          flex-shrink: 0;
        }

        .sidebar-title {
          font-size: 13px;
          font-weight: 700;
          color: #222;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .clear-all-btn {
          margin-left: auto;
          background: none;
          border: none;
          font-size: 11px;
          color: #e67e22;
          font-weight: 600;
          cursor: pointer;
          padding: 2px 0;
          transition: color 0.2s;
        }

        .clear-all-btn:hover {
          color: #d35400;
        }

        .close-sidebar {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          padding: 2px;
        }

        .sidebar-body {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 14px 16px;
          scrollbar-width: thin;
          scrollbar-color: #ddd transparent;
        }

        .filter-group {
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f5f5f5;
        }

        .filter-group:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .filter-group-title {
          font-size: 11px;
          font-weight: 700;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
        }

        .filter-search-wrap {
          position: relative;
        }

        .filter-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #bbb;
          pointer-events: none;
        }

        .filter-search-input {
          width: 100%;
          padding: 8px 10px 8px 32px;
          border: 1px solid #eee;
          border-radius: 8px;
          font-size: 13px;
          background: #fafafa;
          transition: all 0.2s;
          color: #333;
        }

        .filter-search-input:focus {
          outline: none;
          border-color: #e67e22;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(230,126,34,0.08);
        }

        .filter-search-input::placeholder {
          color: #bbb;
        }

        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .filter-chips-scroll {
          max-height: 200px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #ddd transparent;
        }

        .chip {
          padding: 6px 12px;
          background: #f7f7f7;
          border: 1px solid #eee;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #555;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .chip:hover {
          background: #f0f0f0;
          border-color: #ccc;
          color: #222;
        }

        .chip.active {
          background: #1a1a1a;
          color: #fff;
          border-color: #1a1a1a;
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .price-field {
          flex: 1;
          position: relative;
        }

        .price-prefix {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: #999;
          pointer-events: none;
        }

        .price-dash {
          color: #ccc;
          font-size: 12px;
          flex-shrink: 0;
        }

        .price-input {
          width: 100%;
          padding: 7px 8px 7px 24px;
          border: 1px solid #eee;
          border-radius: 8px;
          font-size: 12px;
          background: #fafafa;
          transition: all 0.2s;
        }

        .price-input:focus {
          outline: none;
          border-color: #e67e22;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(230,126,34,0.08);
        }

        .price-input::placeholder {
          color: #bbb;
        }

        .sidebar-overlay {
          display: none;
        }

        .products-main {
          flex: 1;
          min-width: 0;
          position: relative;
        }

        .loading-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #e67e22, #f39c12, #e67e22);
          background-size: 200% 100%;
          animation: loading-slide 1.2s ease-in-out infinite;
          z-index: 10;
          border-radius: 2px;
        }

        @keyframes loading-slide {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .sidebar-open .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .sidebar-closed .products-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        .products-grid.list-view {
          grid-template-columns: 1fr !important;
        }

        .no-products {
          background: white;
          padding: 80px 20px;
          text-align: center;
          border-radius: 12px;
          border: 1px solid #eee;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .no-products h3 {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .no-products p {
          font-size: 14px;
          color: #888;
          margin: 0;
        }

        .btn-primary {
          padding: 10px 28px;
          background: #1a1a1a;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .btn-primary:hover {
          background: #000;
          transform: translateY(-1px);
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 40px;
          padding: 20px 0;
          flex-wrap: wrap;
        }

        .page-numbers {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .page-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #555;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          border-color: #1a1a1a;
          color: #1a1a1a;
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .page-btn.number {
          padding: 8px 12px;
          min-width: 40px;
          justify-content: center;
        }

        .page-btn.number.active {
          background: #1a1a1a;
          color: #fff;
          border-color: #1a1a1a;
        }

        .page-ellipsis {
          padding: 8px 4px;
          color: #999;
          font-size: 14px;
        }

        @media (max-width: 1200px) {
          .sidebar-open .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .sidebar-closed .products-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .sidebar-toggle-btn {
            display: none;
          }
          .filter-toggle-btn {
            display: flex;
          }
          .products-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 1001;
            border-radius: 0;
            width: 300px;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
            max-height: 100vh;
            box-shadow: none;
          }

          .products-sidebar.show {
            transform: translateX(0);
            box-shadow: 8px 0 30px rgba(0,0,0,0.15);
          }

          .products-sidebar.desktop-hidden {
            display: flex;
            transform: translateX(-100%);
          }

          .products-sidebar.desktop-hidden.show {
            transform: translateX(0);
          }

          .close-sidebar {
            display: block;
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 1000;
            animation: fadeIn 0.2s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .sidebar-open .products-grid,
          .sidebar-closed .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 20px 0 14px;
          }

          .page-title {
            font-size: 22px;
          }

          .sidebar-open .products-grid,
          .sidebar-closed .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .products-toolbar {
            padding: 8px 0;
          }

          .results-count {
            display: none;
          }

          .pagination {
            gap: 4px;
          }

          .page-btn.prev,
          .page-btn.next {
            padding: 8px 10px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .sidebar-open .products-grid,
          .sidebar-closed .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .page-title {
            font-size: 20px;
          }

          .page-btn.number {
            padding: 6px 10px;
            min-width: 34px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  )
}

function ProductCard({ product, view }) {
  const [isHovering, setIsHovering] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const canBuyOnline = !!(product.shipping_length && product.shipping_width && product.shipping_height)

  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  const displayPrice = product.discount_price || product.price
  const mainImage = product.images?.[0]?.url || '/placeholder-product.jpg'

  return (
    <Link 
      href={`/products/${product.slug}`} 
      target="_blank"
      rel="noopener noreferrer"
      className={`product-card ${view === 'list' ? 'list-card' : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="product-image-wrapper">
        <div className="product-image">
          <Image 
            src={imageError ? '/placeholder-product.jpg' : mainImage}
            alt={product.name}
            width={view === 'list' ? 200 : 400}
            height={view === 'list' ? 200 : 400}
            className={`product-img ${isHovering ? 'hovering' : ''}`}
            onError={() => setImageError(true)}
          />
        </div>

        <div className="badge-stack">
          {canBuyOnline && discountPercentage > 0 && (
            <span className="badge badge-discount">-{discountPercentage}%</span>
          )}
          {product.tags?.includes('bestseller') && (
            <span className="badge badge-bestseller">Bestseller</span>
          )}
          {product.tags?.includes('trending') && (
            <span className="badge badge-trending">Trending</span>
          )}
        </div>

        {product.stock < 5 && product.stock > 0 && (
          <span className="stock-badge">Only {product.stock} left</span>
        )}
        {product.stock === 0 && (
          <div className="out-of-stock-overlay">
            <span>Sold Out</span>
          </div>
        )}

        <div className={`quick-actions ${isHovering ? 'visible' : ''}`}>
          <span className="quick-view-label">View Details</span>
        </div>
      </div>

      <div className="product-info">
        {product.categories?.name && (
          <div className="product-category">{product.categories.name}</div>
        )}
        <h3 className="product-name">{product.name}</h3>
        
        {product.rating > 0 && (
          <div className="product-rating">
            <span className="stars">{'\u2605'.repeat(Math.round(product.rating))}{'\u2606'.repeat(5 - Math.round(product.rating))}</span>
            <span className="rating-text">({product.review_count || 0})</span>
          </div>
        )}

        <div className="product-price-section">
          {canBuyOnline ? (
            <>
              <span className="current-price">₹{displayPrice?.toLocaleString('en-IN')}</span>
              {product.discount_price && (
                <>
                  <span className="original-price">₹{product.price?.toLocaleString('en-IN')}</span>
                  <span className="save-tag">Save ₹{(product.price - displayPrice)?.toLocaleString('en-IN')}</span>
                </>
              )}
            </>
          ) : (
            <span className="contact-price">Contact for price</span>
          )}
        </div>

        {view === 'list' && product.description && (
          <p className="product-description">
            {product.description.substring(0, 200)}...
          </p>
        )}
      </div>

      <style jsx global>{`
        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
          border: 1px solid #eee;
          position: relative;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
          border-color: #ddd;
        }

        .product-card.list-card {
          display: flex;
          flex-direction: row;
        }

        .product-card.list-card .product-image-wrapper {
          width: 240px;
          flex-shrink: 0;
        }

        .product-image-wrapper {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .product-image {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          background: #f8f8f8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-img {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain;
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .product-img.hovering {
          transform: scale(1.06);
        }

        .badge-stack {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          z-index: 2;
        }

        .badge {
          padding: 4px 10px;
          font-size: 10px;
          font-weight: 700;
          border-radius: 20px;
          color: #fff;
          letter-spacing: 0.3px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .badge-discount {
          background: rgba(200, 50, 50, 0.88);
        }

        .badge-bestseller {
          background: rgba(180, 130, 50, 0.88);
        }

        .badge-trending {
          background: rgba(100, 60, 150, 0.88);
        }

        .stock-badge {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: #ffc107;
          color: #333;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          z-index: 2;
        }

        .out-of-stock-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
        }

        .out-of-stock-overlay span {
          font-size: 13px;
          font-weight: 700;
          color: #c0392b;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .quick-actions {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 12px;
          background: linear-gradient(transparent, rgba(0,0,0,0.5));
          display: flex;
          justify-content: center;
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.3s ease;
          z-index: 2;
        }

        .quick-actions.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .quick-view-label {
          padding: 7px 20px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(8px);
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .product-info {
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .product-card.list-card .product-info {
          flex: 1;
          justify-content: center;
          padding: 18px 24px;
        }

        .product-category {
          font-size: 10px;
          color: #e67e22;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .product-name {
          font-size: 13px;
          font-weight: 600;
          margin: 0;
          color: #1a1a1a;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.2s;
        }

        .product-card:hover .product-name {
          color: #e67e22;
        }

        .product-card.list-card .product-name {
          font-size: 17px;
          -webkit-line-clamp: 1;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stars {
          color: #ffc107;
          font-size: 13px;
          letter-spacing: 1px;
        }

        .rating-text {
          font-size: 11px;
          color: #999;
          font-weight: 500;
        }

        .product-price-section {
          display: flex;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .current-price {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .original-price {
          font-size: 12px;
          color: #aaa;
          text-decoration: line-through;
        }

        .save-tag {
          font-size: 11px;
          color: #e74c3c;
          font-weight: 600;
        }

        .contact-price {
          font-size: 13px;
          color: #888;
          font-style: italic;
          font-weight: 500;
        }

        .product-description {
          font-size: 13px;
          color: #666;
          line-height: 1.6;
          margin: 6px 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .product-card.list-card {
            flex-direction: column;
          }

          .product-card.list-card .product-image-wrapper {
            width: 100%;
          }

          .product-image {
            aspect-ratio: 1;
          }

          .quick-actions {
            opacity: 0 !important;
          }

          .product-name {
            font-size: 12px;
          }

          .current-price {
            font-size: 14px;
          }
        }
      `}</style>
    </Link>
  )
}
