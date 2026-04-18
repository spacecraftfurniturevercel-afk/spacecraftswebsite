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
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E1306C'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>

              <a href="https://wa.me/919003003733" target="_blank" rel="noopener noreferrer"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                aria-label="WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Shop</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { name: 'All Products', href: '/products' },
                { name: 'Sofas & Couches', href: '/products/category/sofa-sets' },
                { name: 'Beds & Frames', href: '/products/category/beds' },
                { name: 'Dining Sets', href: '/products/category/dining-sets' },
                { name: 'Office Chairs', href: '/products/category/office-chairs' },
                { name: 'Study & Office Tables', href: '/products/category/study-&-office-tables' }
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
              <p style={{ fontSize: '13px', color: '#ccc' }}>
                📞 <a href="tel:+919003003733" style={{ color: '#ccc', textDecoration: 'none' }}>
                  090030 03733 / 98402 22779
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
