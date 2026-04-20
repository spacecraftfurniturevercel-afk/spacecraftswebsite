'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ReviewForm from './ReviewForm'
import ReviewsList from './ReviewsList'
import ProductQA from './ProductQA'
import RazorpayPayment from './RazorpayPayment'
import { authenticatedFetch } from '../lib/authenticatedFetch'
import { trackProductView } from '../lib/useProductViewTracker'
import { useAuth } from '../app/providers/AuthProvider'

export default function ProductDetailClient({ 
  product, 
  images, 
  category, 
  brand, 
  variants, 
  offers, 
  warranties, 
  emiOptions, 
  stores, 
  specifications,
  relatedProducts, 
  reviews 
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // Track product view for "Keep Shopping" feature — fire only once per mount
  const trackedRef = useRef(false)
  useEffect(() => {
    if (product?.id && !trackedRef.current) {
      trackedRef.current = true
      trackProductView(product.id, isAuthenticated)
    }
  }, [product?.id, isAuthenticated])

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [selectedWarranty, setSelectedWarranty] = useState(null)
  const [expandedStore, setExpandedStore] = useState(0)
  const [storePincode, setStorePincode] = useState('')
  const [showNearbyStore, setShowNearbyStore] = useState(false)
  const [reviewStats, setReviewStats] = useState({
    avg: product.rating || 0,
    count: product.review_count || 0
  })
  const [reviewsRefresh, setReviewsRefresh] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [pincode, setPincode] = useState('')
  const [deliveryInfo, setDeliveryInfo] = useState(null)
  const [deliveryChecking, setDeliveryChecking] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [deliveryRequest, setDeliveryRequest] = useState({ pincode: '', contact: '', email: '' })
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [showMagnifier, setShowMagnifier] = useState(false)
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 })
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [cartLoading, setCartLoading] = useState(false)
  const [cartError, setCartError] = useState(null)
  const [cartSuccess, setCartSuccess] = useState(null)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [wishlistSuccess, setWishlistSuccess] = useState(null)
  const [wishlistError, setWishlistError] = useState(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [expandedAccordion, setExpandedAccordion] = useState('description')
  const [showBuyNowConfirm, setShowBuyNowConfirm] = useState(false)
  const [buyNowAddresses, setBuyNowAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [buyNowLoading, setBuyNowLoading] = useState(false)
  const [buyNowDeliveryCharge, setBuyNowDeliveryCharge] = useState(null)
  const [buyNowDeliveryLoading, setBuyNowDeliveryLoading] = useState(false)
  const [showBncAddrForm, setShowBncAddrForm] = useState(false)
  const [bncAddrForm, setBncAddrForm] = useState({ label: 'Home', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India' })
  const [bncAddrSaving, setBncAddrSaving] = useState(false)
  const [bncAddrError, setBncAddrError] = useState(null)
  const [showEnquiryModal, setShowEnquiryModal] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [enquirySending, setEnquirySending] = useState(false)
  const [enquiryResult, setEnquiryResult] = useState(null)
  const [buyNowPaymentMethod, setBuyNowPaymentMethod] = useState('prepaid') // 'prepaid' | 'cod'
  const [codAvailable, setCodAvailable] = useState(false)
  const [codCharge, setCodCharge] = useState(0)
  const [codLoading, setCodLoading] = useState(false)
  const [codSuccess, setCodSuccess] = useState(null)

  // Product is buyable online only when shipping dimensions are set
  const canBuyOnline = !!(product.shipping_length && product.shipping_width && product.shipping_height)

  // Auto-open enquiry modal if URL contains ?enquiry=open (e.g. navigated from ProductCard)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('enquiry') === 'open') {
        setShowEnquiryModal(true)
      }
    }
  }, [])



  const displayPrice = product.discount_price || product.price
  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0
  // Price & buy buttons shown only when shipping dimensions are fully set
  const hasDimensions = !!(product.shipping_weight && product.shipping_length && product.shipping_width && product.shipping_height)

  const mainImage = imageError 
    ? '/placeholder-product.svg'
    : (images[selectedImage]?.url || '/placeholder-product.svg')



  const handleAddToCart = async () => {
    setCartError(null)
    setCartSuccess(null)
    setCartLoading(true)

    try {
      // Validate quantity
      if (!quantity || quantity < 1) {
        setCartError('Please select a valid quantity')
        setCartLoading(false)
        return
      }

      // Check stock availability
      if (product.stock && quantity > product.stock) {
        setCartError(`Only ${product.stock} items available in stock`)
        setCartLoading(false)
        return
      }

      if (!isAuthenticated) {
        setCartError('Please login to add items to cart')
        setCartLoading(false)
        router.push('/login')
        return
      }

      const response = await authenticatedFetch('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ 
          product_id: product.id, 
          quantity: parseInt(quantity) 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setCartError(data.error || 'Failed to add item to cart')
        setCartLoading(false)
        return
      }

      setCartSuccess(`${data.cartItem?.product_name || product.name} added to cart!`)
      
      // Notify Header to update cart count
      window.dispatchEvent(new Event('cart-updated'))

      // Reset quantity to 1 after successful add
      setTimeout(() => {
        setQuantity(1)
        setCartSuccess(null)
      }, 3000)

    } catch (error) {
      console.error('Error adding to cart:', error)
      setCartError('Failed to add to cart. Please try again.')
    } finally {
      setCartLoading(false)
    }
  }

  const handleAddToWishlist = async () => {
    setWishlistError(null)
    setWishlistSuccess(null)
    setWishlistLoading(true)

    try {
      if (!isAuthenticated) {
        setWishlistError('Please login to add items to wishlist')
        setWishlistLoading(false)
        return
      }

      const response = await authenticatedFetch('/api/wishlist/add', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setWishlistSuccess(data.alreadyExists ? 'Already in wishlist' : 'Added to wishlist!')
        setTimeout(() => setWishlistSuccess(null), 3000)
      } else {
        setWishlistError(data.error || 'Failed to add to wishlist')
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      setWishlistError('An error occurred. Please try again.')
    } finally {
      setWishlistLoading(false)
    }
  }

  // Fetch BigShip delivery charges for Buy Now based on address pincode
  const fetchBuyNowDeliveryCharge = async (postalCode) => {
    if (!postalCode || postalCode.length !== 6) {
      setBuyNowDeliveryCharge(null)
      return
    }
    setBuyNowDeliveryLoading(true)
    try {
      // shipment_invoice_amount = product price ONLY (no GST, no shipping) as per BigShip docs
      const productAmount = displayPrice * quantity
      // box_count = boxes per unit × quantity ordered
      const totalBoxCount = (product.shipping_box_count || 1) * Math.max(1, parseInt(quantity) || 1)
      const params = new URLSearchParams({ pincode: postalCode, amount: productAmount })
      if (product.shipping_weight) params.set('weight', product.shipping_weight)
      if (product.shipping_length) params.set('length', product.shipping_length)
      if (product.shipping_width) params.set('width', product.shipping_width)
      if (product.shipping_height) params.set('height', product.shipping_height)
      params.set('box_count', totalBoxCount)
      console.warn('[BuyNow] Delivery charge params:', Object.fromEntries(params))
      const res = await fetch(`/api/delivery-charges?${params}`)
      const data = await res.json()
      if (res.ok && data.success && data.available) {
        setBuyNowDeliveryCharge({
          charge: data.deliveryCharge,
          courierName: data.courierName,
          estimatedDays: data.estimatedDays,
          freeDelivery: data.freeDelivery,
        })
        // COD availability from same response
        setCodAvailable(!!data.cod_available)
        setCodCharge(data.cod_charge || 0)
        // If COD is not available, fall back to prepaid
        if (!data.cod_available) setBuyNowPaymentMethod('prepaid')
      } else {
        setBuyNowDeliveryCharge({ charge: 0, courierName: '', estimatedDays: 5, freeDelivery: false, unavailable: !data.available })
        setCodAvailable(false)
        setCodCharge(0)
        setBuyNowPaymentMethod('prepaid')
      }
    } catch (e) {
      console.error('Failed to fetch buy now delivery charge:', e)
      setBuyNowDeliveryCharge(null)
    } finally {
      setBuyNowDeliveryLoading(false)
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      setCartError('Please login to proceed with payment')
      router.push('/login')
      return
    }

    // Reset payment state fresh on every modal open
    setBuyNowPaymentMethod('prepaid')
    setCodAvailable(false)
    setCodCharge(0)
    setCodSuccess(null)
    setCartError(null)
    setBuyNowLoading(true)
    setShowBuyNowConfirm(true)
    setBuyNowDeliveryCharge(null)
    try {
      const res = await authenticatedFetch('/api/addresses')
      if (res.ok) {
        const data = await res.json()
        const addrs = data.addresses || []
        setBuyNowAddresses(addrs)
        const def = addrs.find(a => a.is_default)
        const selectedAddr = def || addrs[0] || null
        setSelectedAddressId(selectedAddr ? selectedAddr.id : null)
        // Fetch delivery charges for selected address
        if (selectedAddr) {
          const postalCode = selectedAddr.postal_code || selectedAddr.pincode
          fetchBuyNowDeliveryCharge(postalCode)
        }
      }
    } catch (e) {
      console.error('Failed to fetch addresses:', e)
    } finally {
      setBuyNowLoading(false)
    }
  }

  // When user selects a different address in Buy Now, re-fetch delivery charges
  const handleBuyNowAddressSelect = (addrId) => {
    setSelectedAddressId(addrId)
    const addr = buyNowAddresses.find(a => a.id === addrId)
    if (addr) {
      const postalCode = addr.postal_code || addr.pincode
      fetchBuyNowDeliveryCharge(postalCode)
    }
  }

  // Save a new address directly from the Buy Now modal
  const saveBncAddress = async () => {
    if (!bncAddrForm.label || !bncAddrForm.phone || !bncAddrForm.line1 || !bncAddrForm.city || !bncAddrForm.state || !bncAddrForm.postal_code) {
      setBncAddrError('Please fill all required fields')
      return
    }
    setBncAddrSaving(true)
    setBncAddrError(null)
    try {
      const res = await authenticatedFetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bncAddrForm)
      })
      const data = await res.json()
      if (res.ok && data.address) {
        const newAddr = data.address
        setBuyNowAddresses(prev => [newAddr, ...prev])
        setSelectedAddressId(newAddr.id)
        fetchBuyNowDeliveryCharge(newAddr.postal_code)
        setShowBncAddrForm(false)
        setBncAddrForm({ label: 'Home', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India' })
      } else {
        setBncAddrError(data.error || 'Failed to save address')
      }
    } catch {
      setBncAddrError('Network error. Please try again.')
    } finally {
      setBncAddrSaving(false)
    }
  }

  const handleProceedToPayment = () => {
    if (!selectedAddressId) {
      setCartError('Please select a delivery address')
      return
    }
    // Hard guard: if COD was selected (even if something reset codAvailable), treat as COD
    if (buyNowPaymentMethod === 'cod') {
      if (!codAvailable) {
        // COD became unavailable after selection — inform user and stay on prepaid
        setBuyNowPaymentMethod('prepaid')
        setCartError('Cash on Delivery is not available for this address. Please use online payment.')
        return
      }
      handleCodOrder()
      return
    }
    setShowBuyNowConfirm(false)
    setIsPaymentModalOpen(true)
  }

  const handleCodOrder = async () => {
    if (!selectedAddressId) {
      setCartError('Please select a delivery address')
      return
    }
    setCodLoading(true)
    try {
      const res = await authenticatedFetch('/api/orders/cod', {
        method: 'POST',
        body: JSON.stringify({
          product_id: product.id,
          quantity,
          address_id: selectedAddressId,
          delivery_charge: codCharge,
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setCodSuccess(data.order_id)
        setShowBuyNowConfirm(false)
      } else {
        setCartError(data.error || 'Failed to place COD order. Please try again.')
      }
    } catch (e) {
      console.error('COD order error:', e)
      setCartError('Network error. Please try again.')
    } finally {
      setCodLoading(false)
    }
  }

  // Navigation handlers for image gallery
  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setImageError(false)
  }

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setImageError(false)
  }

  // Zoom handlers - Magnifier style (lens on image, zoomed view on right)
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const xPercent = (x / rect.width) * 100
    const yPercent = (y / rect.height) * 100
    // Lens position (centered on cursor)
    const lensSize = 150
    setLensPos({
      x: Math.max(0, Math.min(x - lensSize / 2, rect.width - lensSize)),
      y: Math.max(0, Math.min(y - lensSize / 2, rect.height - lensSize))
    })
    setMagnifierPos({ x: xPercent, y: yPercent })
    setShowMagnifier(true)
  }

  const handleMouseLeave = () => {
    setShowMagnifier(false)
  }

  // Lightbox handlers
  const openLightbox = (index) => {
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
  }

  const lightboxPrev = () => {
    setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const lightboxNext = () => {
    setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  // Accordion toggle - prevent scroll jump
  const toggleAccordion = (section) => {
    const scrollY = window.scrollY
    setExpandedAccordion(expandedAccordion === section ? null : section)
    // Restore scroll position after state change to prevent jump
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY)
    })
  }

  // Scroll to product details accordion smoothly
  const scrollToDetails = () => {
    setExpandedAccordion('description')
    setTimeout(() => {
      const el = document.getElementById('product-accordions')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Pincode Delivery Checker — calls api/check-delivery which internally uses BigShip POST /api/calculator
  // shipment_invoice_amount sent to BigShip = product price ONLY (no GST, no shipping)
  const checkDelivery = async (pinCode) => {
    if (!pinCode || pinCode.length !== 6) {
      alert('Please enter a valid 6-digit pincode')
      return
    }
    
    setDeliveryChecking(true)
    
    try {
      // shipment_invoice_amount = product price ONLY (no GST, no shipping) as per BigShip docs
      const productAmount = displayPrice * quantity
      // box_count = boxes per unit × quantity ordered
      const totalBoxCount = (product.shipping_box_count || 1) * Math.max(1, parseInt(quantity) || 1)
      const deliveryPayload = {
          pincode: pinCode,
          amount: productAmount,
          weight: product.shipping_weight || null,
          length: product.shipping_length || null,
          width: product.shipping_width || null,
          height: product.shipping_height || null,
          box_count: totalBoxCount,
        }
      console.warn('[CheckDelivery] Sending payload:', deliveryPayload)
      const response = await fetch('/api/check-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliveryPayload)
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Error checking delivery')
        setDeliveryChecking(false)
        return
      }

      if (data.available) {
        setDeliveryInfo({
          available: true,
          place: data.place,
          freeShipping: data.freeShipping,
          shippingCost: data.shippingCost,
          deliveryCharge: data.deliveryCharge || 0,
          courierName: data.courierName || '',
          deliveryDays: data.deliveryDays,
          estimatedDate: data.estimatedDate,
          city: data.city,
          state: data.state,
          codAvailable: data.codAvailable,
        })
        setShowRequestForm(false)
      } else {
        setDeliveryInfo({
          available: false,
          place: 'Delivery area not available',
          deliveryCharge: 0,
          message: data.message || 'We don\'t deliver to this pincode yet'
        })
        setShowRequestForm(true)
      }
    } catch (error) {
      console.error('Error checking delivery:', error)
      alert('Failed to check delivery. Please try again.')
    } finally {
      setDeliveryChecking(false)
    }
  }

  const [locatingPincode, setLocatingPincode] = useState(false)

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setLocatingPincode(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const detectedPincode = data?.address?.postcode
          if (detectedPincode && /^\d{6}$/.test(detectedPincode)) {
            setPincode(detectedPincode)
            checkDelivery(detectedPincode)
          } else {
            alert('Could not detect pincode. Please enter it manually.')
          }
        } catch (err) {
          console.error('Reverse geocode error:', err)
          alert('Could not detect pincode. Please enter it manually.')
        } finally {
          setLocatingPincode(false)
        }
      },
      (error) => {
        setLocatingPincode(false)
        alert('Unable to access location. Please enable location services.')
        console.error('Geolocation error:', error)
      }
    )
  }

  const submitDeliveryRequest = async () => {
    if (!deliveryRequest.pincode || !deliveryRequest.contact || !deliveryRequest.email) {
      alert('Please fill all required fields')
      return
    }

    if (deliveryRequest.pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode')
      return
    }

    try {
      const response = await fetch('/api/delivery-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          pincode: deliveryRequest.pincode,
          contact: deliveryRequest.contact,
          email: deliveryRequest.email
        })
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'Failed to submit request. Please try again.')
        return
      }

      alert('Thank you! We\'ll notify you when delivery is available in your area.')
      setDeliveryRequest({ pincode: '', contact: '', email: '' })
      setShowRequestForm(false)
      setDeliveryInfo(null)
    } catch (error) {
      console.error('Error submitting delivery request:', error)
      alert('Failed to submit request. Please try again.')
    }
  }

  return (
    <div className="product-detail-page">

      {/* ========== BREADCRUMB SECTION ========== */}
      <div className="breadcrumb-section">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/products">Products</Link></li>
              {category && (
                <li className="breadcrumb-item">
                  <Link href={`/products/category/${category.slug}`}>{category.name}</Link>
                </li>
              )}
              <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container">

        {/* ========== MAIN PRODUCT SECTION ========== */}
        <div className="product-main">

          {/* ===== IMAGE GALLERY ===== */}
          <div className="product-gallery">
            <div className="gallery-inner">
            <div className="main-image-container">
              <div 
                className="main-image"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => openLightbox(selectedImage)}
              >
                <Image 
                  src={mainImage}
                  alt={product.name}
                  width={800}
                  height={800}
                  unoptimized
                  style={{ 
                    objectFit: 'cover', 
                    width: '100%', 
                    height: 'auto',
                    maxHeight: '80vh',
                  }}
                  priority
                  onError={() => {
                    console.error('Main image failed to load:', { url: mainImage })
                    setImageError(true)
                  }}
                />
                {/* Discount Badge */}
                {discountPercentage > 0 && (
                  <span className="discount-badge">-{discountPercentage}%</span>
                )}
                {/* Magnifier Lens Overlay */}
                {showMagnifier && (
                  <div 
                    className="magnifier-lens"
                    style={{
                      left: `${lensPos.x}px`,
                      top: `${lensPos.y}px`,
                    }}
                  />
                )}
                {/* Zoom Hint */}
                {!showMagnifier && (
                  <div className="zoom-hint">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                    Hover to zoom | Click to expand
                  </div>
                )}
              </div>
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button className="nav-arrow prev-arrow" onClick={handlePrevImage} aria-label="Previous image">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  <button className="nav-arrow next-arrow" onClick={handleNextImage} aria-label="Next image">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </>
              )}
              {/* Magnifier Preview Panel (right side) */}
              {showMagnifier && (
                <div className="magnifier-preview">
                  <div 
                    className="magnifier-preview-inner"
                    style={{
                      backgroundImage: `url(${mainImage})`,
                      backgroundPosition: `${magnifierPos.x}% ${magnifierPos.y}%`,
                      backgroundSize: '250%',
                    }}
                  />
                </div>
              )}
            </div>{/* end main-image-container */}
            {/* Thumbnail Gallery — left vertical strip (ordered before main via CSS) */}
            {images.length > 1 && (
              <div className="thumbnail-gallery">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedImage(index)
                      setImageError(false)
                    }}
                  >
                    <Image 
                      src={img.url}
                      alt={img.alt || `${product.name} view ${index + 1}`}
                      width={80}
                      height={80}
                      unoptimized
                      style={{ objectFit: 'cover' }}
                      onError={() => setImageError(true)}
                    />
                  </button>
                ))}
              </div>
            )}
            </div>{/* end gallery-inner */}
          </div>

          {/* ===== PRODUCT INFO SECTION ===== */}
          <div className="product-info-section">

            {/* Brand */}
            {brand && (
              <div className="product-brand">
                <Link href={`/products?brand=${brand.slug}`}>{brand.name}</Link>
              </div>
            )}

            {/* Product Title */}
            <h1 className="product-title">{product.name}</h1>
            
            {/* Rating */}
            <div className="product-rating">
              <div className="stars">
                {'★'.repeat(Math.round(reviewStats.avg))}{'☆'.repeat(5 - Math.round(reviewStats.avg))}
              </div>
              <span className="rating-text">
                {reviewStats.avg?.toFixed?.(1) || '0.0'} ({reviewStats.count} reviews)
              </span>
            </div>

            {/* Price */}
            {canBuyOnline && (
              hasDimensions ? (
                <div className="product-price">
                  <span className="current-price">₹{displayPrice.toLocaleString('en-IN')}</span>
                  {product.discount_price && (
                    <>
                      <span className="original-price">₹{product.price.toLocaleString('en-IN')}</span>
                      <span className="save-text">You save ₹{(product.price - product.discount_price).toLocaleString('en-IN')}</span>
                    </>
                  )}
                </div>
              ) : (
                <div className="product-price contact-price-block">
                  <span className="contact-price-label">Contact for Price</span>
                  <p className="contact-price-sub">Call or WhatsApp us for pricing &amp; availability</p>
                </div>
              )
            )}

            {/* Stock Status */}
            <div className="stock-status">
              {product.stock > 0 ? (
                <span className="in-stock">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm3.5 5.5l-4 4-2-2"/>
                  </svg>
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>

            {/* Short Description */}
            {product.description && (
              <div className="short-description">
                <p>{product.description?.substring(0, 200)}...</p>
                <button className="view-more-btn" onClick={scrollToDetails}>
                  View More Details
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Key Features */}
            <div className="key-features">
              {product.material && (
                <div className="feature">
                  <strong>Material:</strong> {product.material}
                </div>
              )}
              {product.warranty && (
                <div className="feature">
                  <strong>Warranty:</strong> {product.warranty}
                </div>
              )}
              {product.delivery_info && (
                <div className="feature">
                  <strong>Delivery:</strong> {product.delivery_info}
                </div>
              )}
            </div>

            {/* ===== Color Variants ===== */}
            {variants && variants.length > 0 ? (
              <div className="variants-section">
                <h4>Select Colour</h4>
                <div className="variants-grid">
                  {variants.map((variant, idx) => (
                    <div 
                      key={variant.id}
                      className={`variant-card ${selectedVariant?.id === variant.id ? 'active' : ''}`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      {variant.image_url && (
                        <div className="variant-image">
                          <Image 
                            src={variant.image_url} 
                            alt={variant.variant_name}
                            width={80}
                            height={80}
                            onError={() => {}}
                          />
                        </div>
                      )}
                      <span className="variant-name">{variant.variant_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '12px', background: '#ffffff', border: '1px solid #eee', borderRadius: '4px', marginBottom: '10px', color: '#666', fontSize: '13px' }}>
                ℹ️ No color variants added yet. Variants will appear here once added to the database.
              </div>
            )}

            {/* Limited Stock Warning */}
            {product.is_limited_stock && (
              <div className="limited-stock-alert">
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">Hurry! Only {product.stock_quantity || product.stock} Left</span>
              </div>
            )}

            {/* People Viewing & Assurance */}
            <div className="product-assurance">
              <div className="assurance-badge">
                <span>100% Authentic</span>
              </div>
              <div className="assurance-badge">
                <span>Safe & Secure</span>
              </div>
              <div className="assurance-badge">
                <span>Fast Delivery</span>
              </div>
              {product.people_viewing > 0 && (
                <div className="people-viewing">
                  <span>{product.people_viewing} viewing now</span>
                </div>
              )}
            </div>

            {/* Additional Offers Section */}
            {offers && offers.length > 0 && (
              <div className="offers-section">
                <h4>Offers</h4>
                <ul className="offers-list">
                  {offers.slice(0, 4).map((offer, idx) => (
                    <li key={offer.id} className="offer-item">
                      <span className="offer-text">
                        {offer.title}
                        {offer.promo_code && <span className="promo-code">{offer.promo_code}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* EMI Section */}
            {product.emi_enabled && emiOptions && emiOptions.length > 0 && (
              <div className="emi-section">
                <h4>EMI Options</h4>
                <div className="emi-cards">
                  {emiOptions.slice(0, 3).map((emi) => (
                    <div key={emi.id} className="emi-card">
                      <div className="bank-name">{emi.bank_name}</div>
                      <div className="emi-amount">₹{emi.emi_monthly?.toLocaleString('en-IN')}/mo</div>
                      <div className="emi-tenure">{emi.tenure_months} months</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Protection Plan */}
            {warranties && warranties.length > 0 && (
              <div className="protection-plan-section">
                <h4>Protect Your Furniture</h4>
                <div className="warranty-cards">
                  {warranties.map((warranty) => (
                    <div 
                      key={warranty.id}
                      className={`warranty-card ${selectedWarranty?.id === warranty.id ? 'selected' : ''}`}
                      onClick={() => setSelectedWarranty(warranty)}
                    >
                      <input 
                        type="radio" 
                        name="warranty"
                        checked={selectedWarranty?.id === warranty.id}
                        onChange={() => setSelectedWarranty(warranty)}
                      />
                      <div className="warranty-info">
                        <span className="warranty-name">{warranty.warranty_name}</span>
                        <span className="warranty-price">₹{warranty.price?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedWarranty && (
                  <div className="warranty-summary">
                    <p className="warranty-description">{selectedWarranty.description}</p>
                    <div className="warranty-cost-breakdown">
                      <div className="cost-row">
                        <span className="cost-label">Product Price:</span>
                        <span className="cost-value">₹{(product.discount_price || product.price)?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="cost-row">
                        <span className="cost-label">Protection Plan:</span>
                        <span className="cost-value">₹{selectedWarranty.price?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="cost-row total">
                        <span className="cost-label">Total Cost:</span>
                        <span className="cost-value total-price">₹{((product.discount_price || product.price) + selectedWarranty.price)?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Delivery Checker Section */}
            {canBuyOnline && (
            <div className="delivery-checker-section">
              <h4>Check Delivery Availability</h4>
              
              <div className="pincode-input-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter 6-digit pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength="6"
                    className="pincode-input"
                  />
                  <button
                    onClick={() => checkDelivery(pincode)}
                    disabled={deliveryChecking || pincode.length !== 6}
                    className="check-delivery-btn"
                  >
                    {deliveryChecking ? 'Checking...' : 'Check'}
                  </button>
                </div>
                
                <button
                  onClick={getGeolocation}
                  className="locate-btn"
                  title="Use your device location"
                  disabled={locatingPincode}
                >
                  {locatingPincode ? 'Detecting...' : 'Use My Location'}
                </button>
              </div>

              {/* Delivery Available */}
              {deliveryInfo?.available && (
                <div className="delivery-result success">
                  <div className="result-header">
                    <h5>Delivery Available</h5>
                  </div>
                  <div className="delivery-details">
                    <div className="detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{deliveryInfo.place}</span>
                    </div>

                    {/* Price breakdown: Product + Shipping = Total */}
                    {hasDimensions && <div className="shipping-breakdown">
                      <div className="sb-row">
                        <span className="sb-label">Product ({quantity} × ₹{Number(displayPrice).toLocaleString('en-IN')})</span>
                        <span className="sb-value">₹{Number(displayPrice * quantity).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="sb-row">
                        <span className="sb-label">Shipping</span>
                        <span className="sb-value">
                          {deliveryInfo.deliveryCharge === 0
                            ? <span className="free-shipping">FREE</span>
                            : <span>₹{Number(deliveryInfo.deliveryCharge).toLocaleString('en-IN')}</span>}
                        </span>
                      </div>
                      <div className="sb-row sb-total">
                        <span className="sb-label">Total Payable</span>
                        <span className="sb-value">₹{Number(displayPrice * quantity + (deliveryInfo.deliveryCharge || 0)).toLocaleString('en-IN')}</span>
                      </div>
                    </div>}

                    <div className="detail-row">
                      <span className="detail-label">Estimated Delivery:</span>
                      <span className="detail-value">{deliveryInfo.deliveryDays} days ({deliveryInfo.estimatedDate})</span>
                    </div>


                  </div>
                </div>
              )}

              {/* Delivery Not Available */}
              {deliveryInfo?.available === false && !showRequestForm && (
                <div className="delivery-result unavailable">
                  <div className="result-header">
                    <span className="status-icon">⚠</span>
                    <h5>Not Available in Your Area</h5>
                  </div>
                  <p className="unavailable-message">{deliveryInfo.message}</p>
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="request-delivery-btn"
                  >
                    Request Delivery to This Area
                  </button>
                </div>
              )}

              {/* Delivery Request Form */}
              {showRequestForm && (
                <div className="delivery-request-form">
                  <h5>Schedule Delivery Request</h5>
                  <p className="form-subtitle">We'll notify you when delivery becomes available in your area</p>
                  
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      value={deliveryRequest.pincode}
                      onChange={(e) => setDeliveryRequest({ ...deliveryRequest, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      placeholder="Enter 6-digit pincode"
                      maxLength="6"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={deliveryRequest.contact}
                      onChange={(e) => setDeliveryRequest({ ...deliveryRequest, contact: e.target.value })}
                      placeholder="Your contact number"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={deliveryRequest.email}
                      onChange={(e) => setDeliveryRequest({ ...deliveryRequest, email: e.target.value })}
                      placeholder="your@email.com"
                      className="form-input"
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      onClick={submitDeliveryRequest}
                      className="submit-request-btn"
                    >
                      Submit Request
                    </button>
                    <button
                      onClick={() => {
                        setShowRequestForm(false)
                        setDeliveryInfo(null)
                      }}
                      className="cancel-request-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    min="1"
                    max={product.stock}
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Delivery & Stores Section */}
            <div className="delivery-stores-section">
              <h4>Stores Near You</h4>
              <div className="store-pincode-input">
                <input
                  type="text"
                  placeholder="Enter your pincode"
                  maxLength={6}
                  value={storePincode || ''}
                  onChange={(e) => setStorePincode(e.target.value.replace(/\D/g, ''))}
                  className="pincode-field"
                />
                <button
                  className="pincode-check-btn"
                  onClick={() => setShowNearbyStore(storePincode?.length === 6)}
                  disabled={!storePincode || storePincode.length !== 6}
                >
                  Find Store
                </button>
              </div>
              {showNearbyStore && (
                <div className="store-card expanded">
                  <div className="store-header">
                    <div className="store-info">
                      <span className="store-name">Spacecrafts Furniture – Ambattur</span>
                      <span className="store-distance">Nearest Store</span>
                    </div>
                  </div>
                  <div className="store-details">
                    <p className="store-address">94A/1, 3rd Main Rd, Old Ambattur, Attipattu, Ambattur Industrial Estate, Chennai, Tamil Nadu 600058</p>
                    <div className="store-hours">Mon–Fri 10 AM – 9:30 PM · Sat–Sun 10 AM – 10 PM</div>
                    <div className="store-phone">
                      <span>Call:</span>
                      <a href="tel:09003003733">090030 03733</a>
                      <span style={{margin:'0 4px'}}>/</span>
                      <a href="tel:09840222779">98402 22779</a>
                    </div>
                    <a
                      href="https://maps.app.goo.gl/sMTmsBTJBKszoP1Q7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="store-map-link"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {(cartError || wishlistError) && (
              <div className="cart-message error-message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {cartError || wishlistError}
              </div>
            )}
            {(cartSuccess || wishlistSuccess) && (
              <div className="cart-message success-message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {cartSuccess || wishlistSuccess}
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              {canBuyOnline ? (
                !hasDimensions ? (
                  <>
                    <a
                      href="https://wa.me/919003003733"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary btn-large"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', justifyContent: 'center' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.126 1.527 5.862L0 24l6.316-1.506A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.898 0-3.677-.511-5.21-1.402l-.374-.222-3.748.894.927-3.654-.243-.388A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                      </svg>
                      WhatsApp for Price
                    </a>
                    <a
                      href="tel:09003003733"
                      className="btn-secondary btn-large"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', justifyContent: 'center' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
                      </svg>
                      Call for Price
                    </a>
                  </>
                ) : product.stock > 0 ? (
                  <>
                    <button 
                      className="btn-primary btn-large" 
                      onClick={handleBuyNow}
                      disabled={cartLoading}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 01-8 0"/>
                      </svg>
                      Buy Now
                    </button>
                    <button 
                      className="btn-secondary btn-large" 
                      onClick={handleAddToCart}
                      disabled={cartLoading || quantity < 1}
                    >
                      {cartLoading ? (
                        <>
                          <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" opacity="0.3"/>
                            <path d="M12 2C6.48 2 2 6.48 2 12" strokeLinecap="round"/>
                          </svg>
                          Adding...
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button className="btn-disabled btn-large" disabled>
                    Out of Stock
                  </button>
                )
              ) : (
                <button
                  className="btn-enquiry btn-large"
                  onClick={() => { setEnquiryResult(null); setShowEnquiryModal(true) }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                  Send Enquiry
                </button>
              )}
              <button 
                className={`btn-wishlist btn-icon ${wishlistSuccess ? 'wishlisted' : ''}`} 
                onClick={handleAddToWishlist}
                disabled={wishlistLoading}
              >
                {wishlistLoading ? (
                  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" opacity="0.3"/>
                    <path d="M12 2C6.48 2 2 6.48 2 12" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill={wishlistSuccess ? '#e74c3c' : 'none'} stroke={wishlistSuccess ? '#e74c3c' : 'currentColor'} strokeWidth="2">
                    <path d="M10 18l-1.5-1.5C4 12 1 9 1 5.5 1 3.5 2.5 2 4.5 2c1.5 0 3 1 3.5 2.5C8.5 3 10 2 11.5 2c2 0 3.5 1.5 3.5 3.5 0 3.5-3 6.5-7.5 11L10 18z"/>
                  </svg>
                )}
              </button>
            </div>

            {/* ===== Additional Info Tags ===== */}

            {/* ========== ACCORDION SECTIONS (Product Details, Specs, etc.) ========== */}
            <div className="product-accordions" id="product-accordions">

              {/* ===== Product Details Accordion ===== */}
              <div className={`accordion-item ${expandedAccordion === 'description' ? 'open' : ''}`}>
                <button className="accordion-header" onClick={() => toggleAccordion('description')}>
                  <span>Product Details</span>
                  <svg className={`accordion-arrow ${expandedAccordion === 'description' ? 'rotated' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                <div className={`accordion-body-wrapper ${expandedAccordion === 'description' ? 'expanded' : ''}`}>
                  <div className="accordion-body">
                    {/* Product attributes in 2-column grid */}
                    <div className="details-grid">
                      {brand && (
                        <>
                          <div className="detail-label-cell">Brand</div>
                          <div className="detail-value-cell">{brand.name}</div>
                        </>
                      )}
                      {product.material && (
                        <>
                          <div className="detail-label-cell">Primary Material</div>
                          <div className="detail-value-cell">{product.material}</div>
                        </>
                      )}
                      {product.warranty_period && (
                        <>
                          <div className="detail-label-cell">Warranty</div>
                          <div className="detail-value-cell">{product.warranty_period} Months' Warranty</div>
                        </>
                      )}
                      {category && (
                        <>
                          <div className="detail-label-cell">Collections</div>
                          <div className="detail-value-cell">{category.name}</div>
                        </>
                      )}
                      {product.weight && (
                        <>
                          <div className="detail-label-cell">Weight</div>
                          <div className="detail-value-cell">{product.weight} KG</div>
                        </>
                      )}
                      <>
                        <div className="detail-label-cell">Product Rating</div>
                        <div className="detail-value-cell">{reviewStats.avg?.toFixed?.(1) || '0.0'}</div>
                      </>
                      <>
                        <div className="detail-label-cell">Sku</div>
                        <div className="detail-value-cell">{product.sku || product.id}</div>
                      </>
                    </div>
                    {/* Description bullets */}
                    {product.description && (
                      <div className="description-section">
                        <ul className="description-list">
                          {product.description
                            .split(/[.!?]+/)
                            .filter(sentence => sentence.trim().length > 10)
                            .map((sentence, index) => (
                              <li key={index}>{sentence.trim()}</li>
                            ))
                          }
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== Specifications Accordion ===== */}
              <div className={`accordion-item ${expandedAccordion === 'specifications' ? 'open' : ''}`}>
                <button className="accordion-header" onClick={() => toggleAccordion('specifications')}>
                  <span>Specifications</span>
                  <svg className={`accordion-arrow ${expandedAccordion === 'specifications' ? 'rotated' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                <div className={`accordion-body-wrapper ${expandedAccordion === 'specifications' ? 'expanded' : ''}`}>
                  <div className="accordion-body">
                    {specifications && specifications.length > 0 ? (
                      <div className="specifications-container">
                        {Object.entries(
                          specifications.reduce((acc, spec) => {
                            if (!acc[spec.spec_category]) acc[spec.spec_category] = []
                            acc[spec.spec_category].push(spec)
                            return acc
                          }, {})
                        ).map(([cat, specs]) => (
                          <div key={cat} className="spec-category">
                            <h4>{cat}</h4>
                            <div className="details-grid">
                              {specs.map((spec) => (
                                <Fragment key={spec.id}>
                                  <div className="detail-label-cell">{spec.spec_name}</div>
                                  <div className="detail-value-cell">{spec.spec_value} {spec.unit || ''}</div>
                                </Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="details-grid">
                        {product.material && (
                          <>
                            <div className="detail-label-cell">Material</div>
                            <div className="detail-value-cell">{product.material}</div>
                          </>
                        )}
                        <div className="detail-label-cell">SKU</div>
                        <div className="detail-value-cell">{product.id}</div>
                        <div className="detail-label-cell">Stock</div>
                        <div className="detail-value-cell">{product.stock_quantity || product.stock || 0} units</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== Warranty Accordion ===== */}
              <div className={`accordion-item ${expandedAccordion === 'warranty' ? 'open' : ''}`}>
                <button className="accordion-header" onClick={() => toggleAccordion('warranty')}>
                  <span>Warranty</span>
                  <svg className={`accordion-arrow ${expandedAccordion === 'warranty' ? 'rotated' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                <div className={`accordion-body-wrapper ${expandedAccordion === 'warranty' ? 'expanded' : ''}`}>
                  <div className="accordion-body">
                    <div className="warranty-details">
                      <p><strong>Standard Warranty:</strong> {product.warranty_period || 36} Months</p>
                      <ul className="accordion-list">
                        <li>Manufacturing defects covered</li>
                        <li>Material & workmanship guarantee</li>
                        <li>Free repairs during warranty period</li>
                        <li>Parts replacement as per warranty terms</li>
                      </ul>
                      {warranties && warranties.length > 0 && (
                        <div className="warranty-plans">
                          {warranties.map((plan) => (
                            <div key={plan.id} className="plan-card">
                              <h5>{plan.warranty_name}</h5>
                              <span className="plan-price">₹{plan.price?.toLocaleString('en-IN')}</span>
                              <span className="plan-duration">{plan.warranty_months} Months</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== Care & Maintenance Accordion ===== */}
              <div className={`accordion-item ${expandedAccordion === 'care' ? 'open' : ''}`}>
                <button className="accordion-header" onClick={() => toggleAccordion('care')}>
                  <span>Care & Maintenance</span>
                  <svg className={`accordion-arrow ${expandedAccordion === 'care' ? 'rotated' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                <div className={`accordion-body-wrapper ${expandedAccordion === 'care' ? 'expanded' : ''}`}>
                  <div className="accordion-body">
                    <p className="care-intro">{product.care_instructions || 'Dry clean only. Keep away from direct sunlight. Use soft brush for regular cleaning.'}</p>
                    <ul className="accordion-list">
                      <li>Use a soft brush or vacuum with upholstery attachment weekly</li>
                      <li>Blot spills immediately with a soft, dry cloth</li>
                      <li>Professional dry cleaning recommended once a year</li>
                      <li>Keep away from direct sunlight to prevent fading</li>
                      <li>Rotate cushions regularly for even wear</li>
                      <li>Use coasters and placemats to prevent stains</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ===== Reviews Accordion ===== */}
              <div className={`accordion-item ${expandedAccordion === 'reviews' ? 'open' : ''}`}>
                <button className="accordion-header" onClick={() => toggleAccordion('reviews')}>
                  <span>Reviews ({reviewStats.count})</span>
                  <svg className={`accordion-arrow ${expandedAccordion === 'reviews' ? 'rotated' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                <div className={`accordion-body-wrapper ${expandedAccordion === 'reviews' ? 'expanded' : ''}`}>
                  <div className="accordion-body">
                    <ReviewForm 
                      productId={product.id} 
                      onReviewSubmitted={() => setReviewsRefresh((n) => n + 1)} 
                    />
                    <ReviewsList 
                      productId={product.id} 
                      refresh={reviewsRefresh} 
                      onStatsChange={(avg, count) => setReviewStats({ avg, count })}
                    />
                  </div>
                </div>
              </div>

              {/* ===== Q&A Accordion ===== */}
              <div className={`accordion-item ${expandedAccordion === 'qa' ? 'open' : ''}`}>
                <button className="accordion-header" onClick={() => toggleAccordion('qa')}>
                  <span>Questions & Answers</span>
                  <svg className={`accordion-arrow ${expandedAccordion === 'qa' ? 'rotated' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                <div className={`accordion-body-wrapper ${expandedAccordion === 'qa' ? 'expanded' : ''}`}>
                  <div className="accordion-body">
                    <ProductQA productId={product.id} />
                  </div>
                </div>
              </div>

            </div>
            {/* ===== END ACCORDIONS ===== */}

          </div>
          {/* ===== END PRODUCT INFO SECTION ===== */}
        </div>
        {/* ===== END PRODUCT MAIN ===== */}

        {/* ========== RELATED PRODUCTS ========== */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="products-grid">
              {relatedProducts.map(relatedProduct => (
                <RelatedProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========== FULLSCREEN LIGHTBOX MODAL ========== */}
      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            {/* Previous Arrow */}
            {images.length > 1 && (
              <button className="lightbox-arrow lightbox-prev" onClick={lightboxPrev} aria-label="Previous">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
            )}
            {/* Main Image */}
            <div className="lightbox-image-wrapper">
              <img
                src={images[lightboxIndex]?.url || mainImage}
                alt={`${product.name} - Image ${lightboxIndex + 1}`}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
            {/* Next Arrow */}
            {images.length > 1 && (
              <button className="lightbox-arrow lightbox-next" onClick={lightboxNext} aria-label="Next">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            )}
            {/* Image Counter */}
            <div className="lightbox-counter">
              {lightboxIndex + 1} / {images.length}
            </div>
            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="lightbox-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    className={`lightbox-thumb ${idx === lightboxIndex ? 'active' : ''}`}
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <Image
                      src={img.url}
                      alt={`Thumb ${idx + 1}`}
                      width={60}
                      height={60}
                      unoptimized
                      style={{ objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        /* ========== PAGE LAYOUT ========== */
        .product-detail-page {
          background: #ffffff;
          min-height: 100vh;
        }

        /* ========== BREADCRUMB ========== */
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

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
        }

        /* ========== PRODUCT MAIN LAYOUT ========== */
        .product-main {
          display: grid;
          grid-template-columns: 58% 42%;
          gap: 32px;
          background: #ffffff;
          padding: 20px 0;
        }

        /* ========== IMAGE GALLERY ========== */
        .product-gallery {
          position: sticky;
          top: 140px;
          height: fit-content;
        }

        /* Gallery inner: flex row — thumbnails left, main image right */
        .gallery-inner {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 12px;
        }

        .main-image-container {
          position: relative;
          flex: 1;
          min-width: 0;
        }

        .main-image {
          position: relative;
          overflow: hidden;
          background: #f9f9f9;
          cursor: crosshair;
          border: 1px solid #eee;
          max-height: 70vh;
        }

        .main-image:hover .zoom-hint {
          opacity: 1;
        }

        /* Magnifier Lens (box on the main image) */
        .magnifier-lens {
          position: absolute;
          width: 150px;
          height: 150px;
          border: 2px solid rgba(0,0,0,0.3);
          background: rgba(255,255,255,0.2);
          pointer-events: none;
          z-index: 5;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.5);
        }

        /* Magnifier Preview (zoomed result shown on right) */
        .magnifier-preview {
          position: absolute;
          top: 0;
          left: calc(100% + 12px);
          width: 400px;
          height: 400px;
          border: 1px solid #e0e0e0;
          background: #fff;
          z-index: 9990;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          overflow: hidden;
          pointer-events: none;
        }

        .magnifier-preview-inner {
          width: 100%;
          height: 100%;
          background-repeat: no-repeat;
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e0e0e0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          z-index: 10;
          color: #333;
        }

        .nav-arrow:hover {
          background: #fff;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        }

        .prev-arrow { left: 10px; }
        .next-arrow { right: 10px; }

        .zoom-hint {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.65);
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 5px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .discount-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #e74c3c;
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 700;
          z-index: 5;
        }

        .thumbnail-gallery {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          overflow-x: hidden;
          max-height: 70vh;
          width: 74px;
          flex-shrink: 0;
          order: -1;
          scrollbar-width: thin;
          padding-right: 2px;
        }

        .thumbnail {
          flex-shrink: 0;
          width: 70px;
          height: 70px;
          border: 2px solid #e5e5e5;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          background: none;
          padding: 0;
          transition: border-color 0.2s;
        }

        .thumbnail:hover,
        .thumbnail.active {
          border-color: #e67e22;
        }

        /* ========== PRODUCT INFO SECTION ========== */
        .product-info-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-right: 8px;
        }

        .product-brand a {
          color: #e67e22;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .product-brand a:hover {
          color: #d35400;
        }

        .product-title {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.3;
          margin: 0;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
        }

        .stars {
          color: #f39c12;
          font-size: 16px;
          letter-spacing: 1px;
        }

        .rating-text {
          font-size: 12px;
          color: #1a1a1a;
          font-weight: 400;
        }

        /* ===== PRICE ===== */
        .product-price {
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
          padding: 4px 0;
        }

        .current-price {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .original-price {
          font-size: 16px;
          color: #666;
          text-decoration: line-through;
        }

        .save-text {
          font-size: 12px;
          color: #1a1a1a;
          font-weight: 600;
        }

        .contact-price-block {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        .contact-price-label {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .contact-price-sub {
          font-size: 13px;
          color: #666;
          margin: 0;
        }

        /* ===== STOCK ===== */
        .stock-status {
          padding: 0;
        }

        .in-stock {
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 600;
          font-size: 13px;
        }

        .out-of-stock {
          color: #e74c3c;
          font-weight: 600;
          font-size: 13px;
        }

        .short-description {
          font-size: 13px;
          line-height: 1.6;
          color: #1a1a1a;
          margin: 0;
          padding: 0;
        }

        .short-description p {
          margin: 0 0 8px 0;
        }

        .view-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          padding: 0;
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          cursor: pointer;
          transition: color 0.2s;
        }

        .view-more-btn:hover {
          color: #333;
        }

        .view-more-btn svg {
          transition: transform 0.2s;
        }

        .view-more-btn:hover svg {
          transform: translateY(2px);
        }

        /* ===== KEY FEATURES ===== */
        .key-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          border-top: 1px solid #eee;
        }

        .feature {
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 12px;
          color: #1a1a1a;
          line-height: 1.4;
        }

        .feature strong {
          display: block;
          color: #333;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 2px;
          font-weight: 600;
        }

        /* ===== QUANTITY ===== */
        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 0;
        }

        .quantity-selector label {
          font-weight: 700;
          font-size: 13px;
          color: #1a1a1a;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }

        .quantity-controls button {
          width: 32px;
          height: 32px;
          border: none;
          background: #f5f5f5;
          cursor: pointer;
          font-size: 16px;
          color: #333;
          transition: background 0.2s;
        }

        .quantity-controls button:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .quantity-controls button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .quantity-controls input {
          width: 50px;
          height: 32px;
          border: none;
          border-left: 1px solid #e0e0e0;
          border-right: 1px solid #e0e0e0;
          text-align: center;
          font-size: 15px;
          font-weight: 700;
          color: #1a1a1a;
          background: #fff;
          -moz-appearance: textfield;
          appearance: textfield;
        }

        .quantity-controls input::-webkit-outer-spin-button,
        .quantity-controls input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .quantity-controls input:focus {
          outline: none;
        }

        /* ===== STATUS MESSAGES ===== */
        .cart-message {
          padding: 10px 12px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .error-message {
          background: #fdf0ef;
          color: #c0392b;
          border: 1px solid #f5c6cb;
        }

        .success-message {
          background: #eaf7ee;
          color: #27ae60;
          border: 1px solid #c3e6cb;
        }

        /* ===== ACTION BUTTONS ===== */
        .action-buttons {
          display: flex;
          gap: 8px;
          margin-top: 4px;
          padding-top: 12px;
          border-top: 1px solid #eee;
          align-items: stretch;
        }

        .btn-large {
          padding: 0 20px !important;
          height: 42px !important;
          min-height: 42px !important;
          max-height: 42px !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          border-radius: 4px !important;
          cursor: pointer;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          flex: 1;
          box-sizing: border-box;
          line-height: 1 !important;
        }

        .btn-primary {
          background: #1a1a1a !important;
          color: #fff !important;
          border: none !important;
        }

        .btn-primary:hover {
          background: #333 !important;
        }

        .btn-secondary {
          background: #fff !important;
          color: #1a1a1a !important;
          border: 2px solid #1a1a1a !important;
        }

        .btn-secondary:hover {
          background: #1a1a1a !important;
          color: #fff !important;
        }

        .btn-secondary:disabled,
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .btn-enquiry {
          background: linear-gradient(135deg, #1a1a1a 0%, #333 100%) !important;
          color: #fff !important;
          border: none !important;
          flex: 1 1 100%;
        }

        .btn-enquiry:hover {
          background: linear-gradient(135deg, #333 0%, #444 100%) !important;
        }

        .btn-wishlist {
          background: #fff !important;
          color: #333 !important;
          border: 2px solid #e5e5e5 !important;
          border-radius: 4px !important;
          transition: all 0.2s ease;
          flex: 0 0 auto;
        }

        .btn-wishlist:hover {
          border-color: #e74c3c !important;
          color: #e74c3c !important;
        }

        .btn-wishlist.wishlisted {
          border-color: #e74c3c !important;
          background: #fef2f2 !important;
        }

        .btn-wishlist:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon {
          padding: 0 10px !important;
          width: 42px !important;
          height: 42px !important;
          min-height: 42px !important;
          max-height: 42px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-sizing: border-box;
        }

        .btn-disabled {
          background: #e9ecef;
          color: #999;
          border: none;
          cursor: not-allowed;
        }



        /* ========== ACCORDION STYLES ========== */
        .product-accordions {
          margin-top: 16px;
          border-top: 1px solid #e5e5e5;
        }

        .accordion-item {
          border-bottom: 1px solid #e5e5e5;
        }

        .accordion-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
          text-align: left;
          transition: color 0.2s;
        }

        .accordion-header:hover {
          color: #333;
        }

        .accordion-arrow {
          transition: transform 0.3s ease;
          color: #1a1a1a;
          flex-shrink: 0;
        }

        .accordion-arrow.rotated {
          transform: rotate(180deg);
        }

        /* Smooth accordion wrapper using max-height transition */
        .accordion-body-wrapper {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s ease-out, opacity 0.25s ease;
          opacity: 0;
        }

        .accordion-body-wrapper.expanded {
          max-height: 800px;
          opacity: 1;
          transition: max-height 0.4s ease-in, opacity 0.25s ease 0.05s;
        }

        .accordion-body {
          padding: 0 0 10px 0;
        }

        /* Details Grid (2 column label-value like Pepperfry) */
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }

        .detail-label-cell {
          padding: 6px 0;
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          border-bottom: 1px solid #f0f0f0;
        }

        .detail-value-cell {
          padding: 6px 0;
          font-size: 13px;
          color: #1a1a1a;
          border-bottom: 1px solid #f0f0f0;
        }

        .description-section {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
        }

        .description-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .description-list li {
          font-size: 13px;
          color: #1a1a1a;
          padding: 4px 0 4px 16px;
          position: relative;
          line-height: 1.5;
        }

        .description-list li:before {
          content: '•';
          position: absolute;
          left: 0;
          color: #1a1a1a;
          font-weight: 700;
          font-size: 14px;
        }

        .accordion-list {
          list-style: none;
          padding: 0;
          margin: 4px 0;
        }

        .accordion-list li {
          padding: 4px 0 4px 20px;
          position: relative;
          color: #1a1a1a;
          font-size: 13px;
          line-height: 1.5;
        }

        .accordion-list li:before {
          content: '•';
          position: absolute;
          left: 0;
          color: #1a1a1a;
          font-weight: 700;
        }

        .care-intro {
          font-size: 13px;
          color: #1a1a1a;
          line-height: 1.6;
          margin-bottom: 6px;
        }

        .specifications-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .spec-category h4 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: #1a1a1a;
          margin: 0 0 4px 0;
          letter-spacing: 0.5px;
        }

        .warranty-details p {
          font-size: 13px;
          color: #1a1a1a;
          margin: 0 0 6px 0;
        }

        .warranty-plans {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
          margin-top: 8px;
        }

        .plan-card {
          background: #f9f9f9;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 8px;
        }

        .plan-card h5 {
          margin: 0 0 4px 0;
          color: #1a1a1a;
          font-size: 13px;
          font-weight: 600;
        }

        .plan-price {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .plan-duration {
          font-size: 12px;
          color: #1a1a1a;
        }

        /* ========== VARIANTS ========== */
        .variants-section {
          margin: 4px 0;
          padding: 8px 0;
          border-top: 1px solid #eee;
        }

        .variants-section h4 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          color: #1a1a1a;
        }

        .variants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
          gap: 8px;
        }

        .variant-card {
          border: 2px solid #e5e5e5;
          border-radius: 4px;
          padding: 6px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }

        .variant-card:hover {
          border-color: #e67e22;
        }

        .variant-card.active {
          border-color: #e67e22;
          background: #fdf2e9;
        }

        .variant-image {
          margin-bottom: 4px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .variant-name {
          font-size: 10px;
          color: #1a1a1a;
          display: block;
          text-transform: capitalize;
        }

        /* ===== LIMITED STOCK ===== */
        .limited-stock-alert {
          background: #fef5e7;
          border: 1px solid #f0c36d;
          border-radius: 4px;
          padding: 8px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8a6914;
          font-weight: 600;
          font-size: 12px;
        }

        /* ===== ASSURANCE ===== */
        .product-assurance {
          display: flex;
          gap: 12px;
          padding: 8px 0;
          border-top: 1px solid #f0f0f0;
          flex-wrap: wrap;
        }

        .people-viewing,
        .assurance-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #1a1a1a;
          font-weight: 500;
        }

        .people-viewing .icon,
        .assurance-badge .badge-icon {
          font-size: 14px;
        }

        /* ===== OFFERS ===== */
        .offers-section {
          margin: 4px 0;
          padding: 8px 0;
          background: #ffffff;
          border-radius: 0;
          border: none;
        }

        .offers-section h4 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 6px;
          color: #1a1a1a;
        }

        .offers-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .offer-item {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 12px;
          color: #1a1a1a;
          line-height: 1.3;
        }

        .offer-text { flex: 1; }

        .promo-code {
          background: #e67e22;
          color: white;
          padding: 1px 5px;
          border-radius: 3px;
          font-weight: 700;
          font-size: 10px;
          margin-left: 4px;
        }

        /* ===== EMI ===== */
        .emi-section {
          margin: 4px 0;
          padding: 0;
        }

        .emi-section h4 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 8px;
          color: #1a1a1a;
        }

        .emi-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }

        .emi-card {
          border: 1px solid #e5e5e5;
          border-radius: 4px;
          padding: 6px;
          text-align: center;
          transition: all 0.2s;
          cursor: pointer;
        }

        .emi-card:hover {
          border-color: #e67e22;
        }

        .bank-name {
          font-size: 11px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .emi-amount {
          font-size: 15px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 2px;
        }

        .emi-tenure {
          font-size: 11px;
          color: #1a1a1a;
        }

        /* ===== PROTECTION PLAN ===== */
        .protection-plan-section {
          margin: 2px 0;
          padding: 6px 0;
          background: #ffffff;
          border: none;
          border-radius: 0;
        }

        .protection-plan-section h4 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 6px;
          color: #1a1a1a;
        }

        .warranty-cards {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 8px;
        }

        .warranty-card {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border: 1px solid #e5e5e5;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .warranty-card:hover {
          border-color: #e67e22;
        }

        .warranty-card.selected {
          border-color: #e67e22;
          background: #fdf2e9;
        }

        .warranty-card input[type="radio"] {
          width: 16px;
          height: 16px;
          accent-color: #e67e22;
          cursor: pointer;
          flex-shrink: 0;
        }

        .warranty-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex: 1;
        }

        .warranty-name {
          font-size: 12px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .warranty-price {
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .warranty-description {
          font-size: 12px;
          color: #1a1a1a;
          line-height: 1.5;
          margin-top: 6px;
          padding: 8px;
          background: white;
          border-radius: 4px;
        }

        .warranty-summary { margin-top: 12px; }

        .warranty-cost-breakdown {
          background: #ffffff;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 8px 10px;
          margin-top: 6px;
        }

        .cost-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 13px;
        }

        .cost-row.total {
          border-bottom: none;
          border-top: 1px solid #ddd;
          padding-top: 8px;
          margin-top: 4px;
        }

        .cost-label { color: #1a1a1a; font-weight: 600; }
        .cost-value { color: #1a1a1a; font-weight: 600; }
        .cost-row.total .cost-label { color: #333; font-size: 14px; }
        .total-price { color: #1a1a1a; font-size: 16px; font-weight: 700; }

        /* ===== DELIVERY CHECKER ===== */
        .delivery-checker-section {
          background: #ffffff;
          border: none;
          border-radius: 0;
          padding: 6px 0;
          margin: 2px 0;
        }

        .delivery-checker-section h4 {
          font-size: 13px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .pincode-input-group {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .input-wrapper {
          display: flex;
          gap: 6px;
          flex: 1;
          min-width: 240px;
        }

        .pincode-input {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          transition: border-color 0.2s;
        }

        .pincode-input:focus {
          outline: none;
          border-color: #e67e22;
        }

        .check-delivery-btn {
          padding: 8px 14px;
          background: #e67e22;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .check-delivery-btn:hover:not(:disabled) {
          background: #d35400;
        }

        .check-delivery-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .locate-btn {
          padding: 10px 14px;
          background: #333;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .locate-btn:hover {
          background: #1a1a1a;
        }

        /* Delivery Results */
        .delivery-result {
          margin-top: 10px;
          padding: 12px;
          border-radius: 4px;
        }

        .delivery-result.success {
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
        }

        .delivery-result.unavailable {
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .status-icon { font-size: 18px; font-weight: bold; }
        .delivery-result.success .status-icon { color: #1a1a1a; }
        .delivery-result.unavailable .status-icon { color: #1a1a1a; }

        .result-header h5 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
        }

        .delivery-result.success .result-header h5 { color: #1a1a1a; }
        .delivery-result.unavailable .result-header h5 { color: #1a1a1a; }

        .delivery-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          font-size: 13px;
        }

        .detail-label { color: #1a1a1a; font-weight: 600; }
        .detail-value { color: #1a1a1a; font-weight: 600; }

        /* Shipping cost breakdown inside check delivery result */
        .shipping-breakdown {
          margin: 10px 0;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          overflow: hidden;
          background: #fafafa;
        }
        .sb-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 12px;
          font-size: 13px;
          color: #555;
          border-bottom: 1px solid #f0f0f0;
        }
        .sb-row:last-child { border-bottom: none; }
        .sb-total {
          background: #fff;
          font-weight: 800;
          color: #1a1a1a;
          font-size: 14px;
          padding: 10px 12px;
        }
        .sb-label { color: inherit; }
        .sb-value { color: inherit; font-weight: 600; }
        .sb-total .sb-value { color: #1a1a1a; }

        /* Courier options list inside check delivery result */
        .courier-options {
          margin-top: 10px;
        }
        .co-title {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          color: #999;
          margin-bottom: 6px;
        }
        .co-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .co-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 10px;
          border: 1px solid #e8e8e8;
          border-radius: 6px;
          background: #fff;
          font-size: 13px;
        }
        .co-cheapest { border-color: #1a1a1a; background: #fafafa; }
        .co-left { display: flex; flex-direction: column; gap: 2px; }
        .co-tag {
          display: inline-block;
          font-size: 9px;
          font-weight: 700;
          color: #16a34a;
          background: #f0fdf4;
          padding: 1px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 2px;
        }
        .co-name { font-weight: 600; color: #1a1a1a; }
        .co-days { font-size: 11px; color: #888; }
        .co-price { font-weight: 700; color: #1a1a1a; white-space: nowrap; }

        .free-shipping {
          color: #1a1a1a;
          font-weight: 700;
          background: #f0f0f0;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
        }

        .unavailable-message {
          margin: 0 0 8px 0;
          color: #c0392b;
          font-size: 13px;
        }

        .request-delivery-btn {
          width: 100%;
          padding: 10px 14px;
          background: #e67e22;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .request-delivery-btn:hover {
          background: #d35400;
        }

        /* Delivery Request Form */
        .delivery-request-form {
          background: white;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 14px;
          margin-top: 10px;
        }

        .delivery-request-form h5 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 700;
          color: #333;
        }

        .form-subtitle {
          margin: 0 0 12px 0;
          font-size: 12px;
          color: #1a1a1a;
        }

        .form-group { margin-bottom: 10px; }

        .form-group label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
          font-family: inherit;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #e67e22;
        }

        .form-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .submit-request-btn {
          flex: 1;
          padding: 10px 14px;
          background: #e67e22;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .submit-request-btn:hover {
          background: #d35400;
        }

        .cancel-request-btn {
          flex: 1;
          padding: 10px 14px;
          background: #f5f5f5;
          color: #1a1a1a;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .cancel-request-btn:hover {
          background: #e9e9e9;
        }

        /* ===== DELIVERY & STORES ===== */
        .delivery-stores-section {
          margin: 4px 0;
        }

        .delivery-stores-section h4 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 8px;
          color: #1a1a1a;
        }

        .stores-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .store-card {
          border: none;
          border-radius: 4px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .store-card:hover {
          border-color: transparent;
        }

        .store-pincode-input {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }

        .pincode-field {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          transition: border-color 0.2s;
        }

        .pincode-field:focus {
          outline: none;
          border-color: #e67e22;
        }

        .pincode-check-btn {
          padding: 8px 14px;
          background: #e67e22;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .pincode-check-btn:hover:not(:disabled) {
          background: #d35400;
        }

        .pincode-check-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .store-header {
          padding: 8px 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
        }

        .store-hours {
          font-size: 11px;
          color: #1a1a1a;
          margin: 2px 0;
        }

        .store-map-link {
          display: inline-block;
          margin-top: 4px;
          font-size: 12px;
          color: #1a1a1a;
          font-weight: 600;
          text-decoration: none;
        }

        .store-map-link:hover {
          text-decoration: underline;
        }

        .store-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .store-name {
          font-size: 12px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .store-distance {
          font-size: 11px;
          color: #1a1a1a;
        }

        .store-delivery {
          font-size: 11px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .store-details {
          padding: 8px 10px;
          background: white;
          border-top: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .store-address {
          font-size: 11px;
          color: #1a1a1a;
          line-height: 1.4;
          margin: 0;
        }

        .store-phone {
          display: flex;
          gap: 6px;
          font-size: 11px;
          color: #1a1a1a;
        }

        .store-phone a {
          color: #1a1a1a;
          font-weight: 600;
          text-decoration: none;
        }

        .store-phone a:hover {
          text-decoration: underline;
        }

        /* ========== RELATED PRODUCTS ========== */
        .related-products {
          margin: 24px 0 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .related-products h2 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #1a1a1a;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }

        /* ========== FULLSCREEN LIGHTBOX ========== */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.92);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .lightbox-content {
          position: relative;
          width: 90vw;
          height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lightbox-close {
          position: absolute;
          top: 0;
          right: 0;
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          cursor: pointer;
          padding: 10px;
          border-radius: 50%;
          z-index: 10;
          transition: background 0.2s;
        }

        .lightbox-close:hover {
          background: rgba(255,255,255,0.25);
        }

        .lightbox-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          cursor: pointer;
          padding: 14px;
          border-radius: 50%;
          z-index: 10;
          transition: background 0.2s;
        }

        .lightbox-arrow:hover {
          background: rgba(255,255,255,0.25);
        }

        .lightbox-prev { left: 10px; }
        .lightbox-next { right: 10px; }

        .lightbox-image-wrapper {
          width: 100%;
          height: 100%;
          max-width: 80vw;
          max-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .lightbox-image-wrapper img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain !important;
          width: auto !important;
          height: auto !important;
        }

        .lightbox-counter {
          position: absolute;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          font-weight: 500;
        }

        .lightbox-thumbnails {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
        }

        .lightbox-thumb {
          width: 48px;
          height: 48px;
          border: 2px solid transparent;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          padding: 0;
          background: none;
          opacity: 0.5;
          transition: all 0.2s;
        }

        .lightbox-thumb.active,
        .lightbox-thumb:hover {
          border-color: #e67e22;
          opacity: 1;
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1200px) {
          .magnifier-preview {
            display: none;
          }
        }

        @media (max-width: 1024px) {
          .product-main {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .product-gallery {
            position: static;
          }

          .product-info-section {
            max-height: none;
          }
        }

        @media (max-width: 768px) {
          .product-main {
            padding: 12px 0;
          }

          .product-title {
            font-size: 18px;
          }

          .current-price {
            font-size: 22px;
          }

          .action-buttons {
            flex-wrap: wrap;
          }

          .btn-large {
            flex: 1 1 40%;
            min-width: 0;
          }

          .btn-icon {
            flex: 0 0 42px;
          }

          .key-features {
            grid-template-columns: 1fr;
          }

          .details-grid {
            grid-template-columns: 1fr 1fr;
          }

          .pincode-input-group {
            flex-direction: column;
          }

          .input-wrapper {
            min-width: auto;
          }

          .form-actions {
            flex-direction: column;
          }

          .lightbox-image-wrapper {
            max-width: 95vw;
            padding: 10px;
          }

          .lightbox-prev { left: 4px; }
          .lightbox-next { right: 4px; }

          .gallery-inner {
            flex-direction: column;
          }

          .thumbnail-gallery {
            flex-direction: row;
            overflow-x: auto;
            overflow-y: hidden;
            max-height: none;
            width: 100%;
            order: 0;
            padding-right: 0;
            padding-bottom: 2px;
          }
        }
      `}</style>

      {/* Buy Now Confirmation Overlay */}
      {showBuyNowConfirm && (
        <div className="bnc-overlay" onClick={() => setShowBuyNowConfirm(false)}>
          <div className="bnc-panel" onClick={e => e.stopPropagation()}>
            <div className="bnc-header">
              <h2>Order Summary</h2>
              <button className="bnc-close" onClick={() => setShowBuyNowConfirm(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {buyNowLoading ? (
              <div className="bnc-loading"><div className="bnc-spin" /><p>Loading...</p></div>
            ) : (
              <>
                {/* Product */}
                <div className="bnc-section">
                  <div className="bnc-product">
                    <div className="bnc-prod-img">
                      <img src={mainImage} alt={product.name} onError={e => { e.target.src = '/placeholder-product.svg' }} />
                    </div>
                    <div className="bnc-prod-info">
                      <span className="bnc-prod-name">{product.name}</span>
                      <span className="bnc-prod-qty">Qty: {quantity}</span>
                    </div>
                    <span className="bnc-prod-price">₹{Number(displayPrice * quantity).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bnc-section">
                  <h3 className="bnc-sec-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{marginRight: '6px', verticalAlign: '-2px'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Delivery Address
                  </h3>
                  {buyNowAddresses.length === 0 && !showBncAddrForm ? (
                    <div className="bnc-no-addr">
                      <p>No saved addresses found.</p>
                      <button className="bnc-add-addr" onClick={() => setShowBncAddrForm(true)}>+ Add New Address</button>
                    </div>
                  ) : (
                    <>
                      {buyNowAddresses.length > 0 && (
                        <div className="bnc-addr-list">
                          {buyNowAddresses.map(addr => (
                            <label key={addr.id} className={`bnc-addr-card ${selectedAddressId === addr.id ? 'selected' : ''}`}>
                              <div className="bnc-addr-radio">
                                <input type="radio" name="bnc-addr" checked={selectedAddressId === addr.id} onChange={() => handleBuyNowAddressSelect(addr.id)} />
                              </div>
                              <div className="bnc-addr-body">
                                <div className="bnc-addr-top">
                                  <span className="bnc-addr-name">{addr.label || addr.full_name}</span>
                                  {addr.is_default && <span className="bnc-default-tag">Default</span>}
                                </div>
                                <span className="bnc-addr-line">{addr.line1 || addr.address_line1}{addr.line2 || addr.address_line2 ? `, ${addr.line2 || addr.address_line2}` : ''}</span>
                                <span className="bnc-addr-city">{addr.city}, {addr.state} – {addr.postal_code || addr.pincode}</span>
                                {addr.phone && (
                                  <span className="bnc-addr-phone">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                                    {addr.phone}
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {!showBncAddrForm ? (
                        <button onClick={() => setShowBncAddrForm(true)} style={{display:'flex',alignItems:'center',gap:6,marginTop:buyNowAddresses.length > 0 ? 12 : 0,background:'none',border:'1.5px dashed #ccc',borderRadius:10,padding:'10px 14px',cursor:'pointer',color:'#555',fontSize:13,fontWeight:600,width:'100%',justifyContent:'center',boxSizing:'border-box'}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Add New Address
                        </button>
                      ) : (
                        <div style={{marginTop: buyNowAddresses.length > 0 ? 14 : 0, padding: '14px', background: '#fafafa', borderRadius: 12, border: '1px solid #eee'}}>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                            <span style={{fontSize:13,fontWeight:700,color:'#1a1a1a'}}>New Delivery Address</span>
                            {buyNowAddresses.length > 0 && (
                              <button onClick={() => { setShowBncAddrForm(false); setBncAddrError(null) }} style={{background:'none',border:'none',cursor:'pointer',color:'#999',fontSize:20,lineHeight:1,padding:0}}>×</button>
                            )}
                          </div>
                          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                            <div style={{gridColumn:'1/-1'}}>
                              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#888',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.4px'}}>Label (e.g. Home/Office) *</label>
                              <input style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e0e0e0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} placeholder="Home" value={bncAddrForm.label} onChange={e => setBncAddrForm(f => ({...f, label: e.target.value}))} />
                            </div>
                            <div style={{gridColumn:'1/-1'}}>
                              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#888',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.4px'}}>Phone *</label>
                              <input style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e0e0e0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} placeholder="+91 XXXXX XXXXX" value={bncAddrForm.phone} onChange={e => setBncAddrForm(f => ({...f, phone: e.target.value}))} />
                            </div>
                            <div style={{gridColumn:'1/-1'}}>
                              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#888',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.4px'}}>Address Line 1 *</label>
                              <input style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e0e0e0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} placeholder="House no., building, street" value={bncAddrForm.line1} onChange={e => setBncAddrForm(f => ({...f, line1: e.target.value}))} />
                            </div>
                            <div style={{gridColumn:'1/-1'}}>
                              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#888',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.4px'}}>Address Line 2 <span style={{fontWeight:400,textTransform:'none'}}>(optional)</span></label>
                              <input style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e0e0e0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} placeholder="Area, landmark" value={bncAddrForm.line2} onChange={e => setBncAddrForm(f => ({...f, line2: e.target.value}))} />
                            </div>
                            <div>
                              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#888',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.4px'}}>City *</label>
                              <input style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e0e0e0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} placeholder="City" value={bncAddrForm.city} onChange={e => setBncAddrForm(f => ({...f, city: e.target.value}))} />
                            </div>
                            <div>
                              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#888',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.4px'}}>Pincode *</label>
                              <input style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e0e0e0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} placeholder="6-digit pincode" maxLength="6" value={bncAddrForm.postal_code} onChange={e => setBncAddrForm(f => ({...f, postal_code: e.target.value.replace(/\D/g,'').slice(0,6)}))} />
                            </div>
                            <div style={{gridColumn:'1/-1'}}>
                              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#888',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.4px'}}>State *</label>
                              <input style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e0e0e0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} placeholder="State" value={bncAddrForm.state} onChange={e => setBncAddrForm(f => ({...f, state: e.target.value}))} />
                            </div>
                          </div>
                          {bncAddrError && <p style={{color:'#c0392b',fontSize:12,margin:'8px 0 0',fontFamily:'Inter,sans-serif'}}>{bncAddrError}</p>}
                          <button onClick={saveBncAddress} disabled={bncAddrSaving} style={{marginTop:14,width:'100%',padding:'11px 0',background:'#1a1a1a',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:bncAddrSaving ? 'not-allowed' : 'pointer',opacity:bncAddrSaving ? 0.7 : 1,fontFamily:'Inter,sans-serif'}}>
                            {bncAddrSaving ? 'Saving...' : 'Save & Use This Address'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Payment Method — only for products with shipping dimensions */}
                {canBuyOnline && buyNowDeliveryCharge && !buyNowDeliveryLoading && (
                  <div className="bnc-section">
                    <h3 className="bnc-sec-title">Payment Method</h3>
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {/* Prepaid / Online */}
                      <label style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',border:`1.5px solid ${buyNowPaymentMethod === 'prepaid' ? '#1a1a1a' : '#e0e0e0'}`,borderRadius:10,cursor:'pointer',background:buyNowPaymentMethod === 'prepaid' ? '#fafafa' : '#fff',transition:'all 0.15s'}}>
                        <input type="radio" name="bnc-payment" value="prepaid" checked={buyNowPaymentMethod === 'prepaid'} onChange={() => setBuyNowPaymentMethod('prepaid')} style={{width:16,height:16,cursor:'pointer',flexShrink:0}} />
                        <div style={{flex:1}}>
                          <span style={{display:'block',fontSize:13,fontWeight:700,color:'#1a1a1a'}}>Online Payment</span>
                          <span style={{display:'block',fontSize:12,color:'#888',marginTop:2}}>UPI, Cards, Net Banking via Razorpay</span>
                        </div>
                        {buyNowDeliveryCharge.charge === 0 ? (
                          <span style={{fontSize:12,fontWeight:700,color:'#16a34a'}}>FREE delivery</span>
                        ) : (
                          <span style={{fontSize:12,fontWeight:600,color:'#555'}}>₹{Number(buyNowDeliveryCharge.charge).toLocaleString('en-IN')} delivery</span>
                        )}
                      </label>

                      {/* COD */}
                      {codAvailable ? (
                        <label style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',border:`1.5px solid ${buyNowPaymentMethod === 'cod' ? '#1a1a1a' : '#e0e0e0'}`,borderRadius:10,cursor:'pointer',background:buyNowPaymentMethod === 'cod' ? '#fafafa' : '#fff',transition:'all 0.15s'}}>
                          <input type="radio" name="bnc-payment" value="cod" checked={buyNowPaymentMethod === 'cod'} onChange={() => setBuyNowPaymentMethod('cod')} style={{width:16,height:16,cursor:'pointer',flexShrink:0}} />
                          <div style={{flex:1}}>
                            <span style={{display:'block',fontSize:13,fontWeight:700,color:'#1a1a1a'}}>Cash on Delivery</span>
                            <span style={{display:'block',fontSize:12,color:'#888',marginTop:2}}>Pay when your order arrives</span>
                          </div>
                          {codCharge === 0 ? (
                            <span style={{fontSize:12,fontWeight:700,color:'#16a34a'}}>FREE delivery</span>
                          ) : (
                            <span style={{fontSize:12,fontWeight:600,color:'#555'}}>₹{Number(codCharge).toLocaleString('en-IN')} delivery</span>
                          )}
                        </label>
                      ) : (
                        <div style={{padding:'10px 14px',border:'1.5px solid #f0f0f0',borderRadius:10,background:'#fafafa',opacity:0.6}}>
                          <span style={{fontSize:12,fontWeight:600,color:'#999'}}>Cash on Delivery not available for this pincode</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="bnc-section bnc-pricing">
                  <h3 className="bnc-sec-title">Price Details</h3>
                  <div className="bnc-price-row"><span>Subtotal</span><span>₹{Number(displayPrice * quantity).toLocaleString('en-IN')}</span></div>
                  <div className="bnc-price-row">
                    <span>Delivery Charges</span>
                    <span>
                      {buyNowDeliveryLoading ? (
                        <span style={{color: '#999', fontSize: 12}}>Calculating...</span>
                      ) : buyNowDeliveryCharge ? (
                        (() => {
                          const activeCharge = buyNowPaymentMethod === 'cod' ? codCharge : buyNowDeliveryCharge.charge
                          return activeCharge === 0
                            ? <span style={{color: '#16a34a', fontWeight: 600}}>FREE</span>
                            : <span>₹{Number(activeCharge).toLocaleString('en-IN')}</span>
                        })()
                      ) : (
                        <span style={{color: '#999', fontSize: 12}}>Select address</span>
                      )}
                    </span>
                  </div>
                  {buyNowDeliveryCharge?.courierName && buyNowPaymentMethod === 'prepaid' && (
                    <div className="bnc-price-row" style={{fontSize: 11, color: '#888'}}>
                      <span>via {buyNowDeliveryCharge.courierName}</span>
                      <span>~{buyNowDeliveryCharge.estimatedDays} days</span>
                    </div>
                  )}
                  <div className="bnc-price-row"><span>GST (18%)</span><span>₹{Math.round(displayPrice * quantity * 0.18).toLocaleString('en-IN')}</span></div>
                  <div className="bnc-price-total">
                    <span>Total</span>
                    <span>₹{Number(displayPrice * quantity + Math.round(displayPrice * quantity * 0.18) + (buyNowPaymentMethod === 'cod' ? codCharge : (buyNowDeliveryCharge?.charge || 0))).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button className="bnc-pay-btn" onClick={handleProceedToPayment} disabled={!selectedAddressId || buyNowDeliveryLoading || codLoading}>
                  {buyNowDeliveryLoading ? 'Calculating delivery...' : codLoading ? 'Placing order...' : buyNowPaymentMethod === 'cod' ? `Place COD Order — ₹${Number(displayPrice * quantity + Math.round(displayPrice * quantity * 0.18) + codCharge).toLocaleString('en-IN')}` : `Proceed to Payment — ₹${Number(displayPrice * quantity + Math.round(displayPrice * quantity * 0.18) + (buyNowDeliveryCharge?.charge || 0)).toLocaleString('en-IN')}`}
                </button>
              </>
            )}
          </div>

          <style>{`
            .bnc-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.55); z-index: 9999; display: flex; align-items: flex-end; justify-content: center; font-family: Inter, system-ui, sans-serif; }
            @media (min-width: 640px) { .bnc-overlay { align-items: center; } }
            .bnc-panel { background: #fff; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; border-radius: 20px 20px 0 0; padding: 0; animation: bncSlide 0.3s ease; }
            @media (min-width: 640px) { .bnc-panel { border-radius: 16px; } }
            @keyframes bncSlide { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .bnc-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid #f0f0f0; }
            .bnc-header h2 { font-size: 18px; font-weight: 800; color: #1a1a1a; margin: 0; }
            .bnc-close { background: #f5f5f5; border: none; padding: 6px; cursor: pointer; color: #666; border-radius: 50%; transition: background 0.15s; display: flex; align-items: center; justify-content: center; }
            .bnc-close:hover { background: #e8e8e8; }
            .bnc-loading { text-align: center; padding: 40px 24px; }
            .bnc-spin { width: 28px; height: 28px; border: 2.5px solid #e5e5e5; border-top-color: #1a1a1a; border-radius: 50%; margin: 0 auto 12px; animation: bncSpinAnim 0.7s linear infinite; }
            @keyframes bncSpinAnim { to { transform: rotate(360deg); } }
            .bnc-loading p { color: #999; font-size: 13px; margin: 0; }
            .bnc-section { padding: 18px 24px; border-bottom: 1px solid #f0f0f0; }
            .bnc-section:last-of-type { border-bottom: none; }
            .bnc-sec-title { font-size: 11px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 14px; display: flex; align-items: center; }
            .bnc-product { display: flex; align-items: center; gap: 14px; }
            .bnc-prod-img { width: 64px; height: 64px; border-radius: 12px; overflow: hidden; background: #f5f5f5; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid #eee; }
            .bnc-prod-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .bnc-prod-info { flex: 1; min-width: 0; }
            .bnc-prod-name { display: block; font-size: 14px; font-weight: 600; color: #1a1a1a; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; white-space: normal; }
            .bnc-prod-qty { display: block; font-size: 12px; color: #999; margin-top: 4px; }
            .bnc-prod-price { font-size: 15px; font-weight: 700; color: #1a1a1a; white-space: nowrap; }
            .bnc-no-addr { text-align: center; padding: 20px 0; }
            .bnc-no-addr p { color: #888; font-size: 13px; margin: 0 0 12px; }
            .bnc-add-addr { display: inline-block; padding: 8px 20px; background: #1a1a1a; color: #fff; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; }
            .bnc-addr-list { display: flex; flex-direction: column; gap: 10px; }
            .bnc-addr-card { display: flex; align-items: flex-start; gap: 12px; padding: 14px; border: 1.5px solid #e8e8e8; border-radius: 12px; cursor: pointer; transition: all 0.15s; background: #fff; }
            .bnc-addr-card.selected { border-color: #1a1a1a; background: #fafafa; box-shadow: 0 0 0 1px #1a1a1a; }
            .bnc-addr-radio { padding-top: 1px; flex-shrink: 0; }
            .bnc-addr-radio input[type="radio"] { width: 16px; height: 16px; cursor: pointer; }
            .bnc-addr-body { flex: 1; min-width: 0; }
            .bnc-addr-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
            .bnc-addr-name { font-size: 14px; font-weight: 700; color: #1a1a1a; }
            .bnc-default-tag { display: inline-flex; align-items: center; font-size: 9px; font-weight: 700; color: #16a34a; background: #f0fdf4; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.3px; }
            .bnc-addr-line { display: block; font-size: 13px; color: #555; line-height: 1.5; }
            .bnc-addr-city { display: block; font-size: 13px; color: #555; line-height: 1.5; }
            .bnc-addr-phone { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #888; margin-top: 6px; }
            .bnc-pricing { border-bottom: none; padding-bottom: 0; }
            .bnc-price-row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 13px; color: #666; }
            .bnc-free span:last-child { color: #16a34a; font-weight: 600; }
            .bnc-price-total { display: flex; justify-content: space-between; padding: 14px 0 0; margin-top: 8px; border-top: 2px solid #e5e5e5; font-size: 16px; font-weight: 800; color: #1a1a1a; }
            .bnc-pay-btn { width: calc(100% - 48px); padding: 14px; background: #1a1a1a; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; margin: 16px 24px 24px; transition: background 0.15s; font-family: inherit; display: block; }
            .bnc-pay-btn:hover { background: #333; }
            .bnc-pay-btn:disabled { background: #ccc; cursor: not-allowed; }
          `}</style>
        </div>
      )}

      {/* COD Order Success Modal */}
      {codSuccess && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.55)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',fontFamily:'Inter,system-ui,sans-serif'}}>
          <div style={{background:'#fff',borderRadius:16,padding:'40px 32px',maxWidth:400,width:'100%',textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
            <div style={{width:64,height:64,background:'#f0fdf4',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
            </div>
            <h2 style={{fontSize:22,fontWeight:800,color:'#1a1a1a',margin:'0 0 10px'}}>Order Placed!</h2>
            <p style={{fontSize:14,color:'#666',margin:'0 0 6px'}}>Your order <strong>#{codSuccess}</strong> has been confirmed.</p>
            <p style={{fontSize:13,color:'#888',margin:'0 0 28px'}}>Pay with cash when your order is delivered.</p>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <button
                onClick={() => { setCodSuccess(null); router.push(`/orders/${codSuccess}`) }}
                style={{width:'100%',padding:'13px',background:'#1a1a1a',color:'#fff',border:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer'}}
              >
                View Order Details
              </button>
              <button
                onClick={() => setCodSuccess(null)}
                style={{width:'100%',padding:'13px',background:'transparent',color:'#555',border:'1.5px solid #e0e0e0',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer'}}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Payment Modal */}
      <RazorpayPayment
        paymentType="direct"
        productId={product.id}
        quantity={quantity}
        addressId={selectedAddressId}
        deliveryCharge={buyNowDeliveryCharge?.charge || 0}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {}}
        onFailure={() => {}}
      />

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="enq-overlay" onClick={() => setShowEnquiryModal(false)}>
          <div className="enq-panel" onClick={e => e.stopPropagation()}>
            <div className="enq-header">
              <div>
                <h2>Send Enquiry</h2>
                <p className="enq-subtitle">Email us or chat instantly via WhatsApp</p>
              </div>
              <button className="enq-close" onClick={() => setShowEnquiryModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {enquiryResult?.success ? (
              <div className="enq-success">
                <div className="enq-success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                </div>
                <h3>Enquiry Sent!</h3>
                <p>Thank you for your interest in <strong>{product.name}</strong>. Our team will reach out to you soon.</p>
                <button className="enq-done-btn" onClick={() => setShowEnquiryModal(false)}>Done</button>
              </div>
            ) : (
              <>
                {/* Product Preview */}
                <div className="enq-product">
                  <div className="enq-prod-img">
                    <img src={mainImage} alt={product.name} onError={e => { e.target.src = '/placeholder-product.svg' }} />
                  </div>
                  <div className="enq-prod-info">
                    <span className="enq-prod-name">{product.name}</span>
                    <span className="enq-prod-price">₹{Number(displayPrice).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <form className="enq-form" onSubmit={async (e) => {
                  e.preventDefault()
                  if (!enquiryForm.email && !enquiryForm.phone) {
                    setEnquiryResult({ error: 'Please provide at least your email or phone number' })
                    return
                  }
                  setEnquirySending(true)
                  setEnquiryResult(null)
                  try {
                    const res = await fetch('/api/enquiry', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        ...enquiryForm,
                        productId: product.id,
                        productName: product.name,
                        productSlug: product.slug,
                        productPrice: displayPrice,
                      }),
                    })
                    const data = await res.json()
                    if (res.ok) {
                      setEnquiryResult({ success: true })
                      setEnquiryForm({ name: '', email: '', phone: '', message: '' })
                    } else {
                      setEnquiryResult({ error: data.error || 'Something went wrong' })
                    }
                  } catch {
                    setEnquiryResult({ error: 'Network error. Please try again.' })
                  } finally {
                    setEnquirySending(false)
                  }
                }}>
                  <div className="enq-field">
                    <label>Name <span className="enq-req">*</span></label>
                    <input type="text" placeholder="Your full name" required value={enquiryForm.name} onChange={e => setEnquiryForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="enq-field">
                    <label>Email</label>
                    <input type="email" placeholder="your@email.com" value={enquiryForm.email} onChange={e => setEnquiryForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="enq-field">
                    <label>Phone <span style={{fontSize:'11px',color:'#888',fontWeight:400}}>(email or phone required)</span></label>
                    <input type="tel" placeholder="+91 XXXXX XXXXX" value={enquiryForm.phone} onChange={e => setEnquiryForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="enq-field">
                    <label>Message <span className="enq-req">*</span></label>
                    <textarea placeholder="Tell us about your requirements, preferred delivery date, customisation needs..." required rows={4} value={enquiryForm.message} onChange={e => setEnquiryForm(f => ({ ...f, message: e.target.value }))} />
                  </div>
                  {enquiryResult?.error && (
                    <div className="enq-error">{enquiryResult.error}</div>
                  )}
                  <div className="enq-btns-row">
                    <button type="submit" className="enq-submit-btn" disabled={enquirySending}>
                      {enquirySending ? (
                        <><span className="enq-btn-spin" /> Sending...</>
                      ) : (
                        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Enquiry</>
                      )}
                    </button>
                    <button
                      type="button"
                      className="enq-wa-btn"
                      onClick={() => {
                        // Fire-and-forget: save to DB with whatsapp source
                        fetch('/api/enquiry', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            ...enquiryForm,
                            productId: product.id,
                            productName: product.name,
                            productSlug: product.slug,
                            productPrice: displayPrice,
                            _source: 'whatsapp',
                          }),
                        }).catch(() => {})
                        const productUrl = `https://www.spacecraftsfurniture.in/products/${product.slug}`
                        const msg = [
                          `*Product Enquiry*`,
                          `*Product:* ${product.name}`,
                          `*URL:* ${productUrl}`,
                          `*Name:* ${enquiryForm.name || 'Not provided'}`,
                          `*Phone:* ${enquiryForm.phone || 'Not provided'}`,
                          `*Email:* ${enquiryForm.email || 'Not provided'}`,
                          `*Message:* ${enquiryForm.message || 'Please contact me about this product'}`,
                        ].join('\n')
                        window.open(`https://wa.me/919840222779?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp (Instant Support)
                    </button>
                  </div>
                </form>
              </>
            )}

            <style>{`
              .enq-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.55); z-index: 9999; display: flex; align-items: flex-end; justify-content: center; font-family: Inter, system-ui, sans-serif; }
              @media (min-width: 640px) { .enq-overlay { align-items: center; } }
              .enq-panel { background: #fff; width: 100%; max-width: 460px; max-height: 92vh; overflow-y: auto; border-radius: 20px 20px 0 0; animation: enqSlide 0.3s ease; }
              @media (min-width: 640px) { .enq-panel { border-radius: 16px; } }
              @keyframes enqSlide { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
              .enq-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 22px 24px 16px; border-bottom: 1px solid #f0f0f0; }
              .enq-header h2 { font-size: 18px; font-weight: 800; color: #1a1a1a; margin: 0; }
              .enq-subtitle { font-size: 13px; color: #888; margin: 4px 0 0; }
              .enq-close { background: #f5f5f5; border: none; padding: 6px; cursor: pointer; color: #666; border-radius: 50%; transition: background 0.15s; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-left: 12px; }
              .enq-close:hover { background: #e8e8e8; }
              .enq-product { display: flex; align-items: center; gap: 14px; padding: 18px 24px; border-bottom: 1px solid #f0f0f0; background: #fafafa; }
              .enq-prod-img { width: 56px; height: 56px; border-radius: 10px; overflow: hidden; background: #f0f0f0; flex-shrink: 0; border: 1px solid #eee; }
              .enq-prod-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
              .enq-prod-info { flex: 1; min-width: 0; }
              .enq-prod-name { display: block; font-size: 14px; font-weight: 600; color: #1a1a1a; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
              .enq-prod-price { display: block; font-size: 15px; font-weight: 700; color: #1a1a1a; margin-top: 4px; }
              .enq-form { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 14px; }
              .enq-field label { display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px; }
              .enq-req { color: #e74c3c; }
              .enq-field input, .enq-field textarea { width: 100%; padding: 11px 14px; border: 1.5px solid #e0e0e0; border-radius: 10px; font-size: 14px; font-family: inherit; color: #1a1a1a; transition: border-color 0.2s; background: #fff; box-sizing: border-box; resize: vertical; }
              .enq-field input:focus, .enq-field textarea:focus { outline: none; border-color: #1a1a1a; box-shadow: 0 0 0 3px rgba(26,26,26,0.06); }
              .enq-field input::placeholder, .enq-field textarea::placeholder { color: #bbb; }
              .enq-error { background: #fef2f2; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; }
              .enq-btns-row { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
              .enq-submit-btn { width: 100%; padding: 14px; background: #1a1a1a; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.15s; }
              .enq-submit-btn:hover { background: #333; }
              .enq-submit-btn:disabled { background: #999; cursor: not-allowed; }
              .enq-wa-btn { width: 100%; padding: 14px; background: #25D366; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.15s; }
              .enq-wa-btn:hover { background: #128C7E; }
              .enq-btn-spin { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: enqSpinAnim 0.7s linear infinite; }
              @keyframes enqSpinAnim { to { transform: rotate(360deg); } }
              .enq-success { text-align: center; padding: 40px 24px 32px; }
              .enq-success-icon { margin-bottom: 16px; }
              .enq-success h3 { font-size: 20px; font-weight: 800; color: #1a1a1a; margin: 0 0 8px; }
              .enq-success p { font-size: 14px; color: #666; line-height: 1.5; margin: 0 0 24px; }
              .enq-success strong { color: #1a1a1a; }
              .enq-done-btn { padding: 12px 36px; background: #1a1a1a; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.15s; }
              .enq-done-btn:hover { background: #333; }
            `}</style>
          </div>
        </div>
      )}
    </div>
  )
}

function RelatedProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const displayPrice = product.discount_price || product.price
  const imgUrl = product.images?.[0]?.url || product.images?.[0] || product.coverImage || '/placeholder-product.jpg'
  const discPct = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0
  const canBuyOnline = !!(product.shipping_length && product.shipping_width && product.shipping_height)

  return (
    <motion.article
      className="rpc-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer" className="rpc-link">
        <div className="rpc-img-wrap">
          <Image
            src={imgErr ? '/placeholder-product.jpg' : imgUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{
              objectFit: 'contain',
              padding: '12px',
              transform: isHovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
            onError={() => setImgErr(true)}
          />
          {canBuyOnline && discPct > 0 && <span className="rpc-badge">-{discPct}%</span>}
          <div className={`rpc-actions ${isHovered ? 'rpc-actions-visible' : ''}`}>
            <button className="rpc-action-btn" onClick={e => { e.preventDefault(); window.location.href = `/products/${product.slug}` }} aria-label="View product">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div className="rpc-info">
          <h4 className="rpc-name">{product.name}</h4>
          {product.rating > 0 && (
            <div className="rpc-rating">
              <div className="rpc-stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: i < Math.round(product.rating) ? '#c9a84c' : '#e0ddd5' }}>★</span>
                ))}
              </div>
              <span className="rpc-rev-count">({product.review_count || 0})</span>
            </div>
          )}
          <div className="rpc-price-row">
            {canBuyOnline ? (
              <>
                <span className="rpc-price">₹{displayPrice.toLocaleString('en-IN')}</span>
                {product.discount_price && (
                  <span className="rpc-orig">₹{product.price.toLocaleString('en-IN')}</span>
                )}
                {discPct > 0 && <span className="rpc-save">Save {discPct}%</span>}
              </>
            ) : (
              <span style={{ fontSize: 13, color: '#888', fontStyle: 'italic' }}>Contact for price</span>
            )}
          </div>
        </div>
      </Link>
      <style>{`
        .rpc-card { position: relative; border-radius: 16px; overflow: hidden; background: #fff; border: 1px solid rgba(0,0,0,0.06); transition: box-shadow 0.4s ease, transform 0.4s ease, border-color 0.4s ease; }
        .rpc-card:hover { box-shadow: 0 16px 36px rgba(0,0,0,0.08), 0 6px 14px rgba(0,0,0,0.04); transform: translateY(-5px); border-color: rgba(0,0,0,0.10); }
        .rpc-link { text-decoration: none; color: inherit; display: block; }
        .rpc-img-wrap { position: relative; width: 100%; aspect-ratio: 4/5; overflow: hidden; background: #fff; }
        .rpc-badge { position: absolute; top: 12px; left: 12px; padding: 4px 10px; background: rgba(200,50,50,0.85); color: #fff; font-size: 11px; font-weight: 700; border-radius: 20px; letter-spacing: 0.4px; z-index: 2; }
        .rpc-actions { position: absolute; top: 12px; right: 12px; display: flex; flex-direction: column; gap: 8px; opacity: 0; transform: translateX(8px); transition: opacity 0.3s ease, transform 0.3s ease; z-index: 2; }
        .rpc-actions-visible { opacity: 1; transform: translateX(0); }
        .rpc-action-btn { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.92); border: 1px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 3px 10px rgba(0,0,0,0.10); transition: transform 0.2s ease; }
        .rpc-action-btn:hover { transform: scale(1.1); }
        .rpc-info { padding: 14px 16px 16px; }
        .rpc-name { font-size: 14px; font-weight: 600; color: #1a1a1a; line-height: 1.35; margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-family: Inter, system-ui, sans-serif; }
        .rpc-rating { display: flex; align-items: center; gap: 5px; margin-bottom: 8px; }
        .rpc-stars { display: flex; gap: 1px; font-size: 13px; }
        .rpc-rev-count { font-size: 12px; color: #999; font-weight: 500; }
        .rpc-price-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
        .rpc-price { font-size: 18px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.02em; font-family: Inter, sans-serif; }
        .rpc-orig { font-size: 13px; color: #b0aaa0; text-decoration: line-through; }
        .rpc-save { font-size: 12px; color: #c0392b; font-weight: 600; }
      `}</style>
    </motion.article>
  )
}
