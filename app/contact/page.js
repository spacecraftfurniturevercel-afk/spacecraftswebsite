import ContactClient from '../../components/ContactClient'

export const metadata = {
  title: {
    absolute: 'Contact Spacecrafts | Visit or Enquire in Ambattur',
  },
  description:
    'Visit or enquire at Spacecrafts Furniture, Ambattur, Chennai. Form, phone or WhatsApp — we reply within 24 hours. Map and opening hours are on the store locator.',
  keywords:
    'contact spacecrafts furniture, furniture enquiry Ambattur, furniture showroom Chennai contact, furniture whatsapp, bulk order enquiry',
  alternates: {
    canonical: 'https://www.spacecraftsfurniture.in/contact',
  },
  openGraph: {
    title: 'Contact Spacecrafts | Visit or Enquire in Ambattur',
    description:
      'Visit or enquire at our Ambattur, Chennai showroom. Form, phone or WhatsApp — reply within 24 hours.',
    url: 'https://www.spacecraftsfurniture.in/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Spacecrafts | Visit or Enquire in Ambattur',
    description: 'Visit or enquire in Ambattur. Form, phone or WhatsApp.',
  },
}

export default function Contact() {
  return <ContactClient />
}
