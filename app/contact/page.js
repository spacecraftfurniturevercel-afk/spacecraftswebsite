import ContactClient from '../../components/ContactClient'

export const metadata = {
  title: {
    absolute: 'Contact Us | Enquiry Form, Phone & WhatsApp',
  },
  description:
    'Send an enquiry to Spacecrafts Furniture. Use the form, phone or WhatsApp — we reply within 24 hours. For Ambattur showroom map and hours, use the store locator.',
  keywords:
    'contact spacecrafts furniture, furniture enquiry, furniture whatsapp, bulk order enquiry',
  alternates: {
    canonical: 'https://www.spacecraftsfurniture.in/contact',
  },
  openGraph: {
    title: 'Contact Us | Enquiry Form, Phone & WhatsApp',
    description:
      'Message Spacecrafts Furniture by form, phone or WhatsApp. We reply within 24 hours.',
    url: 'https://www.spacecraftsfurniture.in/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Enquiry Form, Phone & WhatsApp',
    description: 'Form, phone or WhatsApp — we reply within 24 hours.',
  },
}

export default function Contact() {
  return <ContactClient />
}
