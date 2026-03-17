'use client'

export default function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="page-loader">
      <div className="page-loader-spinner" />
      <p className="page-loader-text">{text}</p>

      <style jsx>{`
        .page-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: 16px;
        }
        .page-loader-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f0f0f0;
          border-top-color: #e67e22;
          border-radius: 50%;
          animation: page-spin 0.7s linear infinite;
        }
        .page-loader-text {
          font-size: 14px;
          color: #888;
          font-weight: 500;
        }
        @keyframes page-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
