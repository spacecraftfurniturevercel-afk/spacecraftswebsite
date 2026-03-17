'use client'

export default function MaintenanceBanner() {
  return (
    <div className="maintenance-banner" role="alert">
      <div className="maintenance-inner">
        <span className="maintenance-text">
          🚧 Website Under Testing — We&apos;re setting things up! For orders, call us at{' '}
          <a href="tel:+919003003733" className="maintenance-phone">090030 03733</a>
          {' '}or visit our{' '}
          <a href="/store-locator" className="maintenance-link">Ambattur showroom</a>
        </span>
      </div>

      <style jsx>{`
        .maintenance-banner {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          border-bottom: 2px solid #e2b340;
          position: relative;
          z-index: 9999;
        }

        .maintenance-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
        }

        .maintenance-text {
          color: #e0e0e0;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .maintenance-phone,
        .maintenance-link {
          color: #e2b340;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .maintenance-phone:hover,
        .maintenance-link:hover {
          color: #f5d76e;
        }

        @media (max-width: 768px) {
          .maintenance-banner {
            height: auto;
            padding: 6px 0;
          }

          .maintenance-text {
            font-size: 0.72rem;
            white-space: normal;
            line-height: 1.4;
          }

          .maintenance-inner {
            padding: 0 12px;
          }
        }
      `}</style>
    </div>
  )
}
