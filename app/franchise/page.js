import FranchiseClient from '../../components/FranchiseClient'

export const metadata = {
  title: 'Become a Franchise - Spacecrafts Furniture | Partner With Us',
  description: 'Join the Spacecrafts Furniture family. Open your own franchise store and be part of a growing premium furniture brand across India.',
  alternates: {
    canonical: 'https://www.spacecraftsfurniture.in/franchise'
  },
  openGraph: {
    title: 'Franchise Opportunity - Spacecrafts Furniture',
    description: 'Partner with Spacecrafts Furniture and own a premium furniture franchise in your city.',
    url: 'https://www.spacecraftsfurniture.in/franchise',
    type: 'website'
  }
}

export default function FranchisePage() {
  return <FranchiseClient />
}
