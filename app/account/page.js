"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { authenticatedFetch } from '../../lib/authenticatedFetch'

export default function AccountPage() {
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [addresses, setAddresses] = useState([])
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [toast, setToast] = useState(null)
  
  const [formData, setFormData] = useState({
    label: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    is_default: false
  })

  useEffect(() => {
    console.log('Account page auth state:', { user: user?.email, isAuthenticated, authLoading })
    if (!authLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to /login')
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && activeTab === 'addresses') {
      fetchAddresses()
    }
    if (isAuthenticated && activeTab === 'orders') {
      fetchOrders()
    }
  }, [isAuthenticated, activeTab])

  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const res = await authenticatedFetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAddresses = async () => {
    setLoading(true)
    try {
      const res = await authenticatedFetch('/api/addresses')
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses || [])
      } else {
        showToast('Failed to fetch addresses', 'error')
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
      showToast('Error loading addresses', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmitAddress = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const method = editingAddress ? 'PUT' : 'POST'
      const body = editingAddress 
        ? { ...formData, id: editingAddress.id }
        : formData

      const res = await authenticatedFetch('/api/addresses', {
        method,
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (res.ok) {
        showToast(data.message || 'Address saved successfully')
        fetchAddresses()
        resetForm()
      } else {
        showToast(data.error || 'Failed to save address', 'error')
      }
    } catch (error) {
      console.error('Error saving address:', error)
      showToast('Error saving address', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setFormData({
      label: address.label,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country || 'India',
      is_default: address.is_default
    })
    setShowAddressForm(true)
  }

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    setLoading(true)
    try {
      const res = await authenticatedFetch(`/api/addresses?id=${addressId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        showToast(data.message || 'Address deleted successfully')
        fetchAddresses()
      } else {
        showToast(data.error || 'Failed to delete address', 'error')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      showToast('Error deleting address', 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      label: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
      is_default: false
    })
    setEditingAddress(null)
    setShowAddressForm(false)
  }

  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your account...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          p {
            color: white;
            margin-top: 1rem;
            font-size: 1.1rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <h1 className="page-title">My Account</h1>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </button>
          <button 
            className={`tab ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Addresses
          </button>
          <button 
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            Orders
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="profile-card">
                <div className="profile-avatar">
                  {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h2>{profile?.full_name || 'User'}</h2>
                  <p className="profile-email">{user?.email}</p>
                  <p className="profile-joined">
                    Member since {new Date(user?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-card">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <div>
                    <h3>Secure Account</h3>
                    <p>Your account is protected with Google authentication</p>
                  </div>
                </div>
                
                <div className="info-card">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <h3>{addresses.length} Saved Address{addresses.length !== 1 ? 'es' : ''}</h3>
                    <p>Manage your delivery locations</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="addresses-section">
              <div className="addresses-header">
                <h2>Saved Addresses</h2>
                {!showAddressForm && addresses.length < 4 && (
                  <button className="btn-primary" onClick={() => setShowAddressForm(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add New Address
                  </button>
                )}
              </div>

              {showAddressForm && (
                <div className="address-form-card">
                  <div className="form-header">
                    <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                    <button className="close-btn" onClick={resetForm}>✕</button>
                  </div>
                  
                  <form onSubmit={handleSubmitAddress}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Address Label *</label>
                        <input
                          type="text"
                          name="label"
                          value={formData.label}
                          onChange={handleInputChange}
                          placeholder="e.g., Home, Office"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          pattern="[0-9]{10}"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Address Line 1 *</label>
                      <input
                        type="text"
                        name="line1"
                        value={formData.line1}
                        onChange={handleInputChange}
                        placeholder="House No., Building Name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Address Line 2</label>
                      <input
                        type="text"
                        name="line2"
                        value={formData.line2}
                        onChange={handleInputChange}
                        placeholder="Road Name, Area"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>State *</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Postal Code *</label>
                        <input
                          type="text"
                          name="postal_code"
                          value={formData.postal_code}
                          onChange={handleInputChange}
                          pattern="[0-9]{6}"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="is_default"
                          checked={formData.is_default}
                          onChange={handleInputChange}
                        />
                        <span>Set as default address</span>
                      </label>
                    </div>

                    <div className="form-actions">
                      <button type="button" className="btn-secondary" onClick={resetForm}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loading && !showAddressForm ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading addresses...</p>
                </div>
              ) : addresses.length === 0 && !showAddressForm ? (
                <div className="empty-state">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <h3>No addresses saved yet</h3>
                  <p>Add your delivery addresses for faster checkout</p>
                  <button className="btn-primary" onClick={() => setShowAddressForm(true)}>
                    Add First Address
                  </button>
                </div>
              ) : (
                <div className="addresses-grid">
                  {addresses.map((address) => (
                    <div key={address.id} className={`address-card ${address.is_default ? 'default' : ''}`}>
                      {address.is_default && <span className="default-badge">Default</span>}
                      
                      <h4>{address.label}</h4>
                      <p className="address-text">
                        {address.line1}
                        {address.line2 && `, ${address.line2}`}
                        <br />
                        {address.city}, {address.state} - {address.postal_code}
                      </p>
                      <p className="address-phone">Phone: {address.phone}</p>

                      <div className="address-actions">
                        <button 
                          className="btn-edit"
                          onClick={() => handleEditAddress(address)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {addresses.length >= 4 && !showAddressForm && (
                <p className="address-limit-note">
                  You've reached the maximum limit of 4 addresses. Delete an address to add a new one.
                </p>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="orders-section">
              {ordersLoading ? (
                <div className="empty-state">
                  <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                  <p>Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                  <h3>No orders yet</h3>
                  <p>Start shopping to see your order history here</p>
                  <button className="btn-primary" onClick={() => router.push('/products')}>
                    Browse Furniture
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => {
                    const statusColors = {
                      pending: { bg: '#fef9c3', color: '#854d0e' },
                      confirmed: { bg: '#dbeafe', color: '#1e40af' },
                      processing: { bg: '#f3e8ff', color: '#6b21a8' },
                      shipped: { bg: '#cffafe', color: '#0e7490' },
                      delivered: { bg: '#dcfce7', color: '#166534' },
                      cancelled: { bg: '#fee2e2', color: '#991b1b' },
                    }
                    const sc = statusColors[order.status] || statusColors.pending
                    return (
                      <div key={order.id} className="order-card" onClick={() => router.push(`/orders/${order.id}`)} style={{ cursor: 'pointer' }}>
                        <div className="order-card-header">
                          <div>
                            <span className="order-id">Order #{order.id}</span>
                            <span className="order-date">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <span className="order-status-badge" style={{ background: sc.bg, color: sc.color }}>
                            {(order.status || 'pending').toUpperCase()}
                          </span>
                        </div>
                        <div className="order-card-body">
                          <div className="order-items-preview">
                            {(order.items || []).slice(0, 3).map((item, i) => (
                              <span key={i} className="order-item-name">{item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
                            ))}
                            {(order.items || []).length > 3 && <span className="order-item-name">+{order.items.length - 3} more</span>}
                          </div>
                          <div className="order-card-footer">
                            <span className="order-total">₹{Number(order.total).toLocaleString('en-IN')}</span>
                            <span className="order-view-link">View Details →</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <style jsx>{`
        .account-page {
          min-height: 100vh;
          background: #ffffff;
          padding: 2rem 1rem;
        }
        .account-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .page-title {
          color: #333;
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }
        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #ffffff;
          border: 2px solid transparent;
          color: #666;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }
        .tab:hover {
          background: #e8e8e8;
          color: #333;
        }
        .tab.active {
          background: white;
          color: #333;
          border-color: #333;
        }
        .tab-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          min-height: 400px;
          border: 1px solid #f0f0f0;
        }
        .profile-section {
          max-width: 800px;
          margin: 0 auto;
        }
        .profile-card {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 2rem;
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          color: #333;
          margin-bottom: 2rem;
        }
        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: #333;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .profile-info h2 {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          color: #333;
        }
        .profile-email {
          color: #666;
          margin-bottom: 0.25rem;
        }
        .profile-joined {
          color: #999;
          font-size: 0.9rem;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .info-card {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          background: white;
          transition: all 0.3s;
        }
        .info-card:hover {
          border-color: #d5d5d5;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .info-card svg {
          color: #333;
          flex-shrink: 0;
        }
        .info-card h3 {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
          color: #333;
        }
        .info-card p {
          color: #666;
          font-size: 0.9rem;
        }
        .addresses-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .addresses-header h2 {
          font-size: 1.8rem;
          color: #333;
        }
        .address-form-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid #e8e8e8;
        }
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .form-header h3 {
          font-size: 1.4rem;
          color: #333;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #999;
          cursor: pointer;
          padding: 0.25rem;
          line-height: 1;
        }
        .close-btn:hover {
          color: #333;
        }
        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 0.95rem;
          background: white;
          color: #333;
          transition: all 0.3s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #333;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: #333;
        }
        .checkbox-label input[type="checkbox"] {
          width: auto;
          cursor: pointer;
          accent-color: #333;
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
        .btn-primary, .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          font-size: 0.95rem;
        }
        .btn-primary {
          background: #333;
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          background: #000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: white;
          color: #333;
          border: 1px solid #e0e0e0;
        }
        .btn-secondary:hover {
          background: #ffffff;
          border-color: #333;
        }
        .addresses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .address-card {
          padding: 1.5rem;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          position: relative;
          transition: all 0.3s;
          background: white;
        }
        .address-card:hover {
          border-color: #d5d5d5;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .address-card.default {
          border-color: #333;
          background: #ffffff;
        }
        .default-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #333;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .address-card h4 {
          font-size: 1.2rem;
          margin-bottom: 0.75rem;
          color: #333;
        }
        .address-text {
          color: #666;
          line-height: 1.6;
          margin-bottom: 0.5rem;
        }
        .address-phone {
          color: #333;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        .address-actions {
          display: flex;
          gap: 0.75rem;
        }
        .btn-edit, .btn-delete {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .btn-edit {
          background: #333;
          color: white;
        }
        .btn-edit:hover {
          background: #000;
        }
        .btn-delete {
          background: #ff6b6b;
          color: white;
        }
        .btn-delete:hover {
          background: #ff5252;
        }
        .address-limit-note {
          text-align: center;
          color: #666;
          font-style: italic;
          margin-top: 1.5rem;
        }
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }
        .empty-state svg {
          color: #ccc;
          margin-bottom: 1.5rem;
        }
        .empty-state h3 {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 0.5rem;
        }
        .empty-state p {
          color: #666;
          margin-bottom: 2rem;
        }
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e8e8e8;
          border-top-color: #333;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          box-shadow: 0 5px 20px rgba(0,0,0,0.2);
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }
        .toast.success {
          background: #4caf50;
        }
        .toast.error {
          background: #ff6b6b;
        }
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @media (max-width: 768px) {
          .account-page {
            padding: 1rem 0.5rem;
          }
          .page-title {
            font-size: 2rem;
          }
          .tab-content {
            padding: 1.5rem 1rem;
          }
          .profile-card {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
          }
          .addresses-grid {
            grid-template-columns: 1fr;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .toast {
            bottom: 1rem;
            right: 1rem;
            left: 1rem;
          }
          .order-card-header {
            flex-direction: column;
            gap: 8px;
          }
        }

        /* Orders list styles */
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .order-card {
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 14px;
          padding: 20px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .order-card:hover {
          border-color: #d0d0d0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .order-id {
          font-weight: 700;
          font-size: 15px;
          color: #1a1a1a;
          margin-right: 12px;
        }
        .order-date {
          font-size: 12px;
          color: #9ca3af;
        }
        .order-status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .order-card-body {
          border-top: 1px solid #f5f5f5;
          padding-top: 12px;
        }
        .order-items-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .order-item-name {
          background: #f3f4f6;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          color: #4b5563;
        }
        .order-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .order-total {
          font-size: 18px;
          font-weight: 800;
          color: #1a1a1a;
        }
        .order-view-link {
          font-size: 13px;
          font-weight: 600;
          color: #2563eb;
        }
      `}</style>
    </div>
  )
}
