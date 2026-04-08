"use client"
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../app/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { authenticatedFetch } from '../lib/authenticatedFetch'
import styles from './Header.module.css'

export default function Header() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [popularSearches, setPopularSearches] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [dbCategories, setDbCategories] = useState([])
  const [closeTimeout, setCloseTimeout] = useState(null)
  const [openTimeout, setOpenTimeout] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  
  const { user, profile, isAuthenticated, signOut, loading } = useAuth()
  const router = useRouter()
  const searchRef = useRef(null)
  const userMenuRef = useRef(null)
  const navBarRef = useRef(null)

  // Category Navigation Data
  const categoryData = {
    All: {
      sections: [
        {
          title: 'Beds',
          items: [
            { name: 'Bunk Beds', slug: 'bunk-beds' },
            { name: 'Futon Beds', slug: 'futon-beds' },
            { name: 'Diwan Cum Beds', slug: 'diwan-cum-beds' },
            { name: 'Folding Beds', slug: 'folding-beds' },
            { name: 'Metal Cots', slug: 'metal-cots' },
            { name: 'Recliner Folding Beds', slug: 'recliner-folding-beds' },
            { name: 'Sofa cum Beds', slug: 'sofa-cum-beds' },
            { name: 'Wooden Beds', slug: 'wooden-beds' }
          ]
        },
        {
          title: 'Chairs',
          items: [
            { name: 'Foldable Chairs', slug: 'foldable-chairs' },
            { name: 'Lazy Chairs', slug: 'lazy-chairs' },
            { name: 'Office Chairs', slug: 'office-chairs' },
            { name: 'Relax Chair', slug: 'relax-chair' },
            { name: 'Rocking Chairs', slug: 'rocking-chairs' },
            { name: 'Study Chair', slug: 'study-chair' }
          ]
        },
        {
          title: 'Dining Sets',
          items: [
            { name: 'Dining Tables', slug: 'dining-tables' },
            { name: 'Dining Chairs', slug: 'dining-chairs' },
            { name: 'Folding Dinings', slug: 'folding-dinings' },
            { name: 'Shoe Racks', slug: 'shoe-racks' }
          ]
        },
        {
          title: 'Sofa Sets',
          items: [
            { name: '2 Seater', slug: '2-seater' },
            { name: '3+1+1 Sofas', slug: '3-1-1-sofas' },
            { name: 'Corner Sofas', slug: 'corner-sofas' },
            { name: 'Cushion Sofas', slug: 'cushion-sofas' },
            { name: 'Diwans', slug: 'diwans' },
            { name: 'Recliner Sofas', slug: 'recliner-sofas' },
            { name: 'Sofa cum Beds', slug: 'sofa-cum-beds' }
          ]
        },
        {
          title: 'Space Saving',
          items: [
            { name: 'Foldable Tables', slug: 'foldable-tables' },
            { name: 'Foldable Chairs', slug: 'foldable-chairs' },
            { name: 'Folding Beds', slug: 'folding-beds' },
            { name: 'TV Racks', slug: 'tv-racks' }
          ]
        },
        {
          title: 'Tables',
          items: [
            { name: 'Coffee Tables', slug: 'coffee-tables' },
            { name: 'Dressing Tables', slug: 'dressing-tables' },
            { name: 'Foldable Tables', slug: 'foldable-tables' },
            { name: 'Study & Office Tables', slug: 'study-office-tables' }
          ]
        },
        {
          title: 'Wardrobes & Racks',
          items: [
            { name: 'Wardrobes', slug: 'wardrobes' },
            { name: 'Book Shelves', slug: 'book-shelves' },
            { name: 'Shoe Racks', slug: 'shoe-racks' },
            { name: 'TV Racks', slug: 'tv-racks' }
          ]
        }
      ],
      images: ['/header/All.jpg']
    },
    'Space Saving Furniture': {
      sections: [
        {
          title: 'Space Savers',
          items: [
            { name: 'Bunk Beds', slug: 'bunk-beds' },
            { name: 'Diwan Cum Beds', slug: 'diwan-cum-beds' },
            { name: 'Folding Beds', slug: 'folding-beds' },
            { name: 'Recliner Folding Beds', slug: 'recliner-folding-beds' },
            { name: 'Sofa cum Beds', slug: 'sofa-cum-beds' },
            { name: 'Foldable Tables', slug: 'foldable-tables' },
            { name: 'Study & Office Tables', slug: 'study-office-tables' },
            { name: 'Foldable Chairs', slug: 'foldable-chairs' },
            { name: 'Lazy Chairs', slug: 'lazy-chairs' },
            { name: 'Relax Chair', slug: 'relax-chair' },
            { name: 'Study Chair', slug: 'study-chair' },
            { name: 'Folding Dinings', slug: 'folding-dinings' }
          ]
        }
      ],
      images: ['/header/spacesavingfurniture.webp']
    },
    'Beds': {
      sections: [
        {
          title: 'All Beds',
          items: [
            { name: 'Bunk Beds', slug: 'bunk-beds' },
            { name: 'Futon Beds', slug: 'futon-beds' },
            { name: 'Diwan Cum Beds', slug: 'diwan-cum-beds' },
            { name: 'Folding Beds', slug: 'folding-beds' },
            { name: 'Metal Cots', slug: 'metal-cots' },
            { name: 'Recliner Folding Beds', slug: 'recliner-folding-beds' },
            { name: 'Sofa cum Beds', slug: 'sofa-cum-beds' },
            { name: 'Wooden Beds', slug: 'wooden-beds' }
          ]
        }
      ],
      images: ['/header/beds.webp']
    },
    'Chairs': {
      sections: [
        {
          title: 'All Chairs',
          items: [
            { name: 'Foldable Chairs', slug: 'foldable-chairs' },
            { name: 'Lazy Chairs', slug: 'lazy-chairs' },
            { name: 'Office Chairs', slug: 'office-chairs' },
            { name: 'Relax Chair', slug: 'relax-chair' },
            { name: 'Rocking Chairs', slug: 'rocking-chairs' },
            { name: 'Study Chair', slug: 'study-chair' }
          ]
        }
      ],
      images: ['/header/chairs.webp']
    },
    'Dining Sets': {
      sections: [
        {
          title: 'Dining',
          items: [
            { name: 'Shoe Racks', slug: 'shoe-racks' },
            { name: 'Dining Tables', slug: 'dining-tables' },
            { name: 'Dining Chairs', slug: 'dining-chairs' }
          ]
        }
      ],
      images: ['/header/diningsets.webp']
    },
    'Sofa Sets': {
      sections: [
        {
          title: 'Sofas',
          items: [
            { name: '2 Seater', slug: '2-seater' },
            { name: '3+1+1 Sofas', slug: '3-1-1-sofas' },
            { name: 'Corner Sofas', slug: 'corner-sofas' },
            { name: 'Cushion Sofas', slug: 'cushion-sofas' },
            { name: 'Diwans', slug: 'diwans' },
            { name: 'Recliner Sofas', slug: 'recliner-sofas' },
            { name: 'Sofa cum Beds', slug: 'sofa-cum-beds' }
          ]
        }
      ],
      images: ['/header/sofasets.webp']
    },
    'Tables': {
      sections: [
        {
          title: 'Tables',
          items: [
            { name: 'Dressing Tables', slug: 'dressing-tables' },
            { name: 'Foldable Tables', slug: 'foldable-tables' },
            { name: 'Study & Office Tables', slug: 'study-office-tables' },
            { name: 'Coffee Tables', slug: 'coffee-tables' }
          ]
        }
      ],
      images: ['/header/tables.webp']
    },
    'Wardrobe & Racks': {
      sections: [
        {
          title: 'Storage',
          items: [
            { name: 'Book Racks', slug: 'book-racks' },
            { name: 'Shoe Racks', slug: 'shoe-racks' },
            { name: 'TV Racks', slug: 'tv-racks' },
            { name: 'Wardrobes', slug: 'wardrobes' }
          ]
        }
      ],
      images: ['/header/wardrobe.webp']
    }
  }

  // Use DB categories for nav; fall back to hardcoded keys while loading
  const navCategories = dbCategories.length > 0
    ? ['All', ...dbCategories.map(c => c.name)]
    : Object.keys(categoryData)

  const displayName = (profile?.full_name || user?.email?.split('@')[0] || 'Account').split(' ')[0]

  // Fetch cart count
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount()
    } else {
      setCartCount(0)
    }
  }, [isAuthenticated])

  // Listen for cart-updated events (fired after add-to-cart)
  useEffect(() => {
    const onCartUpdated = () => { if (isAuthenticated) fetchCartCount() }
    window.addEventListener('cart-updated', onCartUpdated)
    return () => window.removeEventListener('cart-updated', onCartUpdated)
  }, [isAuthenticated])

  // Add shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fetch navigation categories from DB
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(({ categories }) => {
        if (Array.isArray(categories) && categories.length) setDbCategories(categories)
      })
      .catch(() => {})
  }, [])

  // Fetch popular searches
  useEffect(() => {
    fetchPopularSearches()
  }, [])

  const fetchPopularSearches = async () => {
    try {
      const res = await fetch('/api/search/popular')
      if (res.ok) {
        const data = await res.json()
        setPopularSearches(data.searches || [])
      }
    } catch (error) {
      console.error('Error fetching popular searches:', error)
    }
  }

  const fetchCartCount = async () => {
    try {
      const res = await authenticatedFetch('/api/cart/get')
      if (res.ok) {
        const data = await res.json()
        setCartCount(data.items?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching cart count:', error)
    }
  }

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.results || [])
          setShowResults(true)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
        setSearchFocused(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle nav area hover - only close when leaving the entire nav section
  const handleNavMouseLeave = () => {
    if (openTimeout) { clearTimeout(openTimeout); setOpenTimeout(null) }
    const timeout = setTimeout(() => setHoveredCategory(null), 300)
    setCloseTimeout(timeout)
  }

  const handleNavMouseEnter = () => {
    if (closeTimeout) clearTimeout(closeTimeout)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`)
      setShowResults(false)
      setSearchFocused(false)
      setQuery('')
    }
  }

  const handleProductClick = (slug) => {
    setShowResults(false)
    setSearchFocused(false)
    setQuery('')
    router.push(`/products/${slug}`)
  }

  const handlePopularSearchClick = (term) => {
    setShowResults(false)
    setSearchFocused(false)
    setQuery('')
    router.push(`/products?search=${encodeURIComponent(term)}`)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (e) {
      console.error('Sign out error:', e)
    }
    setShowUserMenu(false)
    // Full page reload to clear all client state and cookies
    window.location.href = '/'
  }

  return (
    <>
      <header className={`site-header ${styles['site-header']} ${scrolled ? styles['header-scrolled'] : ''}`}>
        <div className={styles['header-container']}>
          {/* Logo */}
          <div className={styles['header-logo']}>
            <Link href="/">
              <Image src="/logo.webp" alt="Spacecrafts Furniture" width={160} height={54} priority style={{ height: 'auto', width: 'auto', maxHeight: '54px' }} />
            </Link>
          </div>

          {/* Search Bar */}
          <div className={styles['header-left']}>
          <div className={styles['header-search']} ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className={styles['search-form']}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search furniture..."
                className={styles['search-input']}
                aria-label="Search products"
              />
              <button type="submit" className={styles['search-button']} aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </form>

            {/* Search Dropdown - Popular Searches or Results */}
            {(searchFocused && !showResults && query.trim().length < 2) && (
              <div className={styles['search-dropdown']}>
                {/* Popular Searches Tags */}
                <div className={styles['popular-searches']}>
                  <div className={styles['popular-header']}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <span className={styles['popular-title']}>Popular Searches</span>
                  </div>
                  <div className={styles['popular-tags']}>
                    {(popularSearches.length > 0 ? popularSearches.slice(0, 8) : [
                      'Sofa Sets', 'Wooden Beds', 'Office Chairs', 'Dining Tables',
                      'Wardrobes', 'Bunk Beds', 'Shoe Racks', 'Recliner Sofas'
                    ]).map((term, idx) => (
                      <button
                        key={idx}
                        className={styles['popular-tag']}
                        onClick={() => handlePopularSearchClick(typeof term === 'string' ? term : term.term)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="m21 21-4.35-4.35"/>
                        </svg>
                        {typeof term === 'string' ? term : term.term}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles['popular-divider']} />

                {/* Trending Now */}
                <div className={styles['trending-section']}>
                  <div className={styles['trending-title']}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                      <polyline points="17 6 23 6 23 12"/>
                    </svg>
                    Trending Now
                  </div>
                  {['Recliner Sofas', 'Bunk Beds', 'Folding Dining Tables', 'Corner Sofas', 'Study Tables'].map((item, idx) => (
                    <div
                      key={idx}
                      className={styles['trending-item']}
                      onClick={() => handlePopularSearchClick(item)}
                    >
                      <span className={styles['trending-rank']}>{idx + 1}</span>
                      <span className={styles['trending-text']}>{item}</span>
                      <svg className={styles['trending-arrow']} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14"/>
                        <path d="m12 5 7 7-7 7"/>
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results Dropdown */}
            {showResults && (
              <div className={styles['search-dropdown']}>
                <div className={styles['search-results']}>
                {isSearching ? (
                  <div className={styles['search-loading']}>Searching...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className={styles['search-result-item']}
                        onClick={() => handleProductClick(product.slug)}
                      >
                        <div className={styles['result-image']}>
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={50}
                              height={50}
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div className={styles['result-no-image']}>No image</div>
                          )}
                        </div>
                        <div className={styles['result-info']}>
                          <div className={styles['result-name']}>{product.name}</div>
                          <div className={styles['result-price']}>₹{product.price.toLocaleString()}</div>
                        </div>
                        {product.stock <= 5 && product.stock > 0 && (
                          <span className={styles['result-badge']}>Only {product.stock} left</span>
                        )}
                      </div>
                    ))}
                    <button 
                      className={styles['search-view-all']}
                      onClick={() => {
                        router.push(`/products?search=${encodeURIComponent(query)}`)
                        setShowResults(false)
                        setSearchFocused(false)
                        setQuery('')
                      }}
                    >
                      View all results
                    </button>
                  </>
                ) : (
                  <div className={styles['search-empty']}>No products found</div>
                )}
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Right Side: Nav + User */}
          <div className={styles['header-right']}>
          <nav className={styles['header-nav']}>
            <Link href="/products" className={styles['nav-link']}>Furniture</Link>
            <Link href="/store-locator" className={styles['nav-link']}>Store</Link>
            <Link href="/wishlist" className={styles['nav-link']}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span className={styles['nav-text']}>Wishlist</span>
            </Link>
            <Link href="/cart" className={`${styles['nav-link']} ${styles['cart-link']}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span className={styles['nav-text']}>Cart</span>
              {cartCount > 0 && <span className={styles['cart-badge']}>{cartCount}</span>}
            </Link>
          </nav>

          {/* User Menu */}
          <div className={styles['header-user']} ref={userMenuRef}>
            {loading ? (
              <div className={styles['user-loading']}>
                <div className={styles['loading-spinner']}></div>
              </div>
            ) : isAuthenticated ? (
              <>
                <button 
                  className={styles['user-button']}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className={styles['user-avatar']}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className={styles['user-name']}>{displayName}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {showUserMenu && (
                  <div className={styles['user-dropdown']}>
                    <Link href="/account" className={styles['dropdown-item']} onClick={() => setShowUserMenu(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      My Account
                    </Link>
                    <Link href="/orders" className={styles['dropdown-item']} onClick={() => setShowUserMenu(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                      My Orders
                    </Link>
                    <button className={styles['dropdown-item']} onClick={handleSignOut}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link href="/login" className={styles['login-button']}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={styles['mobile-menu-toggle']}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <nav 
          className={styles['category-nav']} 
          ref={navBarRef}
          onMouseEnter={handleNavMouseEnter}
          onMouseLeave={handleNavMouseLeave}
        >
          {navCategories.map((category) => {
            const dbCat = dbCategories.find(c => c.name === category)
            const catSlug = dbCat?.slug || category.toLowerCase().replace(/[&]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
            return (
            <div
              key={category}
              className={styles['category-nav-item']}
              onMouseEnter={() => {
                if (closeTimeout) clearTimeout(closeTimeout)
                if (openTimeout) clearTimeout(openTimeout)
                // If already showing a dropdown, switch instantly; otherwise delay 250ms
                if (hoveredCategory) {
                  setHoveredCategory(category)
                } else {
                  const t = setTimeout(() => setHoveredCategory(category), 500)
                  setOpenTimeout(t)
                }
              }}
            >
              <button
                className={styles['category-nav-link']}
                onClick={() => {
                  // On mobile, navigate directly to category page
                  if (window.innerWidth <= 768) {
                    if (category === 'All') {
                      router.push('/products')
                    } else {
                      router.push(`/products/category/${catSlug}`)
                    }
                  }
                }}
              >
                {category}
              </button>

              {/* Dropdown Menu */}
              {hoveredCategory === category && (
                <div className={styles['category-dropdown']}>
                  {category === 'All' ? (
                    <div className={styles['dropdown-content']}>
                      <div className={`${styles['dropdown-left']} ${styles['dropdown-left-all']}`}>
                        {categoryData[category].sections.map((section, idx) => (
                          <div key={idx} className={styles['dropdown-section']}>
                            <h4 className={styles['section-title']}>{section.title}</h4>
                            <ul className={styles['section-items']}>
                              {section.items.map((item, itemIdx) => (
                                <li key={itemIdx}>
                                  <button
                                    className={styles['section-item-link']}
                                    onClick={() => router.push(`/products/category/${item.slug}`)}
                                  >
                                    {item.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      <div className={`${styles['dropdown-right']} ${styles['dropdown-right-all']}`}>
                        <div className={styles['category-images']}>
                          <div className={styles['category-image-wrapper']}>
                            <Image
                              src={categoryData[category].images[0]}
                              alt={`${category} featured`}
                              width={380}
                              height={500}
                              style={{ objectFit: 'cover', objectPosition: 'center center', width: '100%', height: '100%' }}
                            />
                            <div className={`${styles['image-overlay-text']} ${styles['image-overlay-all']}`}>
                              <span className={styles['overlay-label']}>Explore</span>
                              <span className={styles['overlay-category']}>All Furniture</span>
                              <button className={styles['overlay-cta']} onClick={() => router.push('/products')}>
                                Shop Now
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M5 12h14"/>
                                  <path d="m12 5 7 7-7 7"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : categoryData[category] ? (
                    <div className={styles['dropdown-content']}>
                      <div className={styles['dropdown-accent-bar']}></div>
                      <div className={styles['dropdown-inner']}>
                        <div className={styles['dropdown-left']}>
                          {categoryData[category].sections.map((section, idx) => (
                            <div key={idx} className={styles['dropdown-section']}>
                              <h4 className={styles['section-title']}>{section.title}</h4>
                              <ul className={styles['section-items']}>
                                {section.items.map((item, itemIdx) => (
                                  <li key={itemIdx}>
                                    <button
                                      className={styles['section-item-link']}
                                      onClick={() => router.push(`/products/category/${item.slug}`)}
                                    >
                                      {item.name}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                              <button
                                className={styles['shop-all-link']}
                                onClick={() => router.push(`/products/category/${catSlug}`)}
                              >
                                Shop All {category}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M5 12h14"/>
                                  <path d="m12 5 7 7-7 7"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className={styles['dropdown-right']}>
                          <div className={styles['category-images']}>
                            <div className={styles['category-image-wrapper']}>
                              <Image
                                src={categoryData[category].images[0]}
                                alt={`${category} featured`}
                                width={400}
                                height={500}
                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                              />
                              <div className={styles['image-overlay-text']}>
                                <span className={styles['overlay-label']}>Explore</span>
                                <span className={styles['overlay-category']}>{category}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // DB category with no hardcoded dropdown — show simple shop-all panel
                    <div className={styles['dropdown-content']}>
                      <div className={styles['dropdown-accent-bar']}></div>
                      <div className={styles['dropdown-inner']}>
                        <div className={styles['dropdown-left']}>
                          <div className={styles['dropdown-section']}>
                            <h4 className={styles['section-title']}>{category}</h4>
                            <button
                              className={styles['shop-all-link']}
                              onClick={() => router.push(`/products/category/${catSlug}`)}
                            >
                              Shop All {category}
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14"/>
                                <path d="m12 5 7 7-7 7"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            )
          })}
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={styles['mobile-menu']}>
            {dbCategories.length > 0 && (
              <>
                <div className={styles['mobile-menu-section-title']}>Categories</div>
                {dbCategories.map(cat => (
                  <Link key={cat.id} href={`/products/category/${cat.slug}`} className={styles['mobile-menu-item']} onClick={() => setIsMobileMenuOpen(false)}>
                    {cat.name}
                  </Link>
                ))}
                <div className={styles['mobile-menu-divider']} />
              </>
            )}
            <Link href="/products" className={styles['mobile-menu-item']} onClick={() => setIsMobileMenuOpen(false)}>
              Furniture
            </Link>
            <Link href="/store-locator" className={styles['mobile-menu-item']} onClick={() => setIsMobileMenuOpen(false)}>
              Store
            </Link>
            <Link href="/wishlist" className={styles['mobile-menu-item']} onClick={() => setIsMobileMenuOpen(false)}>
               Wishlist
            </Link>
            <Link href="/cart" className={styles['mobile-menu-item']} onClick={() => setIsMobileMenuOpen(false)}>
               Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/account" className={styles['mobile-menu-item']} onClick={() => setIsMobileMenuOpen(false)}>
                  My Account
                </Link>
                <Link href="/orders" className={styles['mobile-menu-item']} onClick={() => setIsMobileMenuOpen(false)}>
                  My Orders
                </Link>
                <button className={styles['mobile-menu-item']} onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}>
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className={styles['mobile-menu-item']} onClick={() => setIsMobileMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        )}
      </header>

    </>
  )
}
