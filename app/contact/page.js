import styles from '../../components/ContactPage.module.css'
import ContactClient from '../../components/ContactClient'

export const metadata = {
  title: 'Contact Us - Spacecrafts Furniture | Get in Touch',
  description: 'Contact Spacecrafts Furniture for inquiries, custom furniture solutions, and more. Call us at 090030 03733 or visit our showroom in Ambattur, Chennai. We respond within 24 hours.',
  keywords: 'contact furniture store, spacecrafts furniture contact, furniture inquiry, custom furniture solutions, furniture store Chennai',
  alternates: {
    canonical: 'https://www.spacecraftsfurniture.in/contact'
  },
  openGraph: {
    title: 'Contact Spacecrafts Furniture',
    description: 'Get in touch with our team for furniture inquiries and custom solutions.',
    url: 'https://www.spacecraftsfurniture.in/contact',
    type: 'website'
  }
}

export default function Contact() {
  return <ContactClient />
}
