import BulkOrdersClient from '../../components/BulkOrdersClient'

export const metadata = {
  title: 'Buy In Bulk - Spacecrafts Furniture | Wholesale & Corporate Orders',
  description: 'Looking to furnish your office, hotel, or space at scale? Submit a bulk order enquiry and our team will get back to you with the best pricing.',
  alternates: {
    canonical: 'https://www.spacecraftsfurniture.in/bulk-orders'
  },
  openGraph: {
    title: 'Bulk Orders - Spacecrafts Furniture',
    description: 'Corporate and wholesale furniture orders. Get custom pricing for large volumes.',
    url: 'https://www.spacecraftsfurniture.in/bulk-orders',
    type: 'website'
  }
}

export default function BulkOrdersPage() {
  return <BulkOrdersClient />
}
