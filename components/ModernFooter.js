'use client'

// Modern Footer Component
import Link from 'next/link'

export default function ModernFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '60px 20px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Main Footer Content */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '40px',
          marginBottom: '40px',
          paddingBottom: '40px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          
          {/* Company Info */}
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>
              Spacecrafts Furniture
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#ccc', marginBottom: '20px' }}>
              Premium furniture store offering the finest collection of sofas, beds, dining sets, and home decor. Transform your space with quality and style.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#3b5998'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                aria-label="Facebook"
              >
                f
              </a>
              <a href="https://instagram.com/spacecraftsfurniture" target="_blank" rel="noopener noreferrer"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#E1306C'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                aria-label="Instagram"
              >
                📸
              </a>
              <a href="mailto:info@spacecraftsfurniture.in" target="_blank" rel="noopener noreferrer"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#D14836'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                aria-label="Gmail"
              >
                ✉️
              </a>
              <a href="https://wa.me/918025123456" target="_blank" rel="noopener noreferrer"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#25D366'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                aria-label="WhatsApp"
              >
                💬
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Shop</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { name: 'All Products', href: '/products' },
                { name: 'Sofas & Couches', href: '/products/category/sofas-couches' },
                { name: 'Beds & Mattresses', href: '/products/category/beds-frames' },
                { name: 'Dining Furniture', href: '/products/category/dining-room' },
                { name: 'Office Furniture', href: '/products/category/office-furniture' },
                { name: 'Outdoor Furniture', href: '/products/category/outdoor-furniture' }
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: '12px' }}>
                  <Link 
                    href={link.href}
                    style={{ 
                      color: '#ccc', 
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#fff'}
                    onMouseLeave={(e) => e.target.style.color = '#ccc'}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Customer Service</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { name: 'Contact Us', href: '/contact' },
                { name: 'Track Order', href: '/orders' },
                { name: 'Shipping & Delivery', href: '/shipping-info' },
                { name: 'Returns & Refunds', href: '/returns-policy' },
                { name: 'FAQs', href: '/faq' },
                { name: 'Store Locator', href: '/store-locator' }
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: '12px' }}>
                  <Link 
                    href={link.href}
                    style={{ 
                      color: '#ccc', 
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#fff'}
                    onMouseLeave={(e) => e.target.style.color = '#ccc'}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About & Legal */}
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>About Us</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { name: 'Our Story', href: '/about' },
                { name: 'Careers', href: '/careers' },
                { name: 'Privacy Policy', href: '/privacy-policy' },
                { name: 'Terms & Conditions', href: '/terms' },
                { name: 'Sitemap', href: '/sitemap.xml' }
              ].map((link) => (
                <li key={link.href} style={{ marginBottom: '12px' }}>
                  <Link 
                    href={link.href}
                    style={{ 
                      color: '#ccc', 
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#fff'}
                    onMouseLeave={(e) => e.target.style.color = '#ccc'}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Contact Info */}
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '13px', color: '#ccc', marginBottom: '8px' }}>
                📧 <a href="mailto:info@spacecraftsfurniture.in" style={{ color: '#ccc', textDecoration: 'none' }}>
                  info@spacecraftsfurniture.in
                </a>
              </p>
              <p style={{ fontSize: '13px', color: '#ccc' }}>
                📞 <a href="tel:+919003003733" style={{ color: '#ccc', textDecoration: 'none' }}>
                  090030 03733
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Payment & Trust Badges */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          paddingBottom: '30px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '20px'
        }}>
          <div>
            <p style={{ fontSize: '13px', color: '#ccc', marginBottom: '10px' }}>We Accept</p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {['Visa', 'Mastercard', 'Amex', 'UPI', 'Paytm'].map((method) => (
                <span key={method} style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {method}
                </span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', color: '#ccc', marginBottom: '10px' }}>100% Secure Payments</p>
            <p style={{ fontSize: '12px', color: '#888' }}>SSL Encrypted | PCI DSS Compliant</p>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          fontSize: '13px',
          color: '#888'
        }}>
          <p style={{ margin: 0 }}>
            © {currentYear} Spacecrafts Furniture. All rights reserved.
          </p>
          {/* <p style={{ margin: 0 }}>
            Designed & Developed with ❤️ by Spacecrafts Digital
          </p> */}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          footer > div {
            padding: 40px 20px 20px !important;
          }
          footer h3 {
            font-size: 20px !important;
          }
        }
      `}</style>
    </footer>
  )
}
