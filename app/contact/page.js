import ContactClient from '../../components/ContactClient'

export const metadata = {
  title: {
    absolute: 'Contact Spacecrafts Ambattur | Furniture Showroom Chennai',
  },
  description:
    'Contact Spacecrafts - Ambattur, Chennai furniture showroom. Space-saving furniture factory — sofa cum beds, bunks, custom sizes. Form, phone or WhatsApp. Hours and map on store locator.',
  keywords:
    'contact spacecrafts furniture, furniture shop Ambattur contact, furniture showroom Chennai, space saving furniture Ambattur, bulk order enquiry',
  alternates: {
    canonical: 'https://www.spacecraftsfurniture.in/contact',
  },
  openGraph: {
    title: 'Contact Spacecrafts Ambattur | Furniture Showroom Chennai',
    description:
      'Contact the Ambattur factory-showroom. Space-saving furniture, custom sizes, sold direct. Form, phone or WhatsApp.',
    url: 'https://www.spacecraftsfurniture.in/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Spacecrafts Ambattur | Furniture Showroom Chennai',
    description: 'Ambattur, Chennai showroom. Space-saving furniture, factory-direct. Form, phone or WhatsApp.',
  },
}

export default function Contact() {
  return <ContactClient />
}
