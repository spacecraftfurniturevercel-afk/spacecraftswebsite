import styles from '../../components/ContactPage.module.css'
import ContactClient from '../../components/ContactClient'

export const metadata = {
  title: 'Contact Spacecrafts Furniture Chennai | Call 90030 03733 | Ambattur Showroom',
  description: 'Contact Spacecrafts Furniture, Ambattur, Chennai. Call 📞 90030 03733 or visit our 8,000 sq. ft. showroom. Enquire about sofas, beds, bunk beds & bulk orders. We reply within 24 hours.',
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
