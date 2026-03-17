"use client"
import { useEffect, useState } from 'react'

export default function AnnouncementBar(){
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // const announcements = [
  //   "🎉 Extra 20% off on All Home and Kitchen Orders — Use code: HOLIDAY20",
  //   "📦 Free Shipping on orders above ₹2,999 — No minimum cart limit!",
  //   "⭐ Handcrafted Furniture Made in India — Support Local Artisans"
  // ]
  const announcements = [
  "✨ Up to 40% Off + Extra 10% on Premium Furniture — Use Code: HOLIDAY10",
  "🇮🇳 Delivering Across India — Crafted with Care, Shipped with Trust",
  "🛋️ India’s Leading Space-Saving Furniture Brand"
];
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length)
        setIsTransitioning(false)
      }, 300)
    }, 5000)

    return () => clearInterval(interval)
  }, [announcements.length])

  return (
    <div className="announcement-bar">
      <div className="announcement-inner">
        <div className={`announcement-text ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
          {announcements[currentIndex]}
        </div>
      </div>

      <style jsx>{`
        .announcement-bar {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }

        .announcement-inner {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          min-height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .announcement-text {
          color: white;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.3px;
          animation: fadeAnimation 0.3s ease-in-out forwards;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .announcement-text.fade-out {
          animation: fadeOut 0.3s ease-in-out forwards;
        }

        .announcement-text.fade-in {
          animation: fadeIn 0.3s ease-in-out forwards;
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .announcement-bar {
            padding: 0.35rem 1rem;
          }

          .announcement-text {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}
