'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function FailureContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') || 'Your payment could not be processed'

  return (
    <div className="failure-container">
      <div className="failure-card">
        <div className="failure-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>

        <h1>Payment Failed</h1>
        <p className="failure-message">{reason}</p>

        <div className="failure-steps">
          <h3>What can you do?</h3>
          <ul>
            <li>Check your card/UPI details and try again</li>
            <li>Ensure sufficient balance in your account</li>
            <li>Try a different payment method</li>
            <li>Contact your bank if the issue persists</li>
          </ul>
        </div>

        <div className="action-buttons">
          <Link href="/checkout" className="btn-primary">
            Retry Payment
          </Link>
          <Link href="/cart" className="btn-secondary">
            Back to Cart
          </Link>
          <Link href="/contact" className="btn-tertiary">
            Contact Support
          </Link>
        </div>

        <div className="support-info">
          <p>Need help? Contact our support team at <strong>support@spacecraftsfurniture.in</strong></p>
        </div>
      </div>

      <style jsx>{`
        .failure-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
        }

        .failure-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          text-align: center;
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .failure-icon {
          margin-bottom: 24px;
          display: flex;
          justify-content: center;
        }

        .failure-icon svg {
          color: #ef4444;
          stroke: currentColor;
        }

        h1 {
          font-size: 28px;
          color: #333;
          margin: 0 0 8px 0;
        }

        .failure-message {
          color: #666;
          font-size: 16px;
          margin: 0 0 32px 0;
        }

        .failure-steps {
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 24px;
          text-align: left;
        }

        .failure-steps h3 {
          margin: 0 0 12px 0;
          color: #991b1b;
          font-size: 16px;
        }

        .failure-steps ul {
          margin: 0;
          padding-left: 20px;
          color: #991b1b;
        }

        .failure-steps li {
          margin: 8px 0;
          font-size: 14px;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .btn-primary, .btn-secondary, .btn-tertiary {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-block;
        }

        .btn-primary {
          background: #ef4444;
          color: white;
        }

        .btn-primary:hover {
          background: #dc2626;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #333;
        }

        .btn-secondary:hover {
          background: #d1d5db;
        }

        .btn-tertiary {
          background: transparent;
          color: #2563eb;
          border: 1px solid #bfdbfe;
        }

        .btn-tertiary:hover {
          background: #eff6ff;
        }

        .support-info {
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #666;
        }

        .support-info strong {
          color: #333;
        }
      `}</style>
    </div>
  )
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
      <FailureContent />
    </Suspense>
  )
}
