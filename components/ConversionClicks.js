'use client'

import { useEffect } from 'react'
import { trackClickToCall, trackClickToWhatsapp } from '../lib/gtagClient'

export default function ConversionClicks() {
  useEffect(() => {
    const onClick = (event) => {
      const a = event.target?.closest?.('a[href]')
      if (!a) return
      const href = (a.getAttribute('href') || '').toLowerCase()
      if (href.startsWith('tel:')) {
        trackClickToCall(href.replace('tel:', ''))
        return
      }
      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        trackClickToWhatsapp()
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
  return null
}
