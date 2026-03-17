import dynamic from 'next/dynamic'

const WishlistClient = dynamic(() => import('../../components/WishlistClient'), { ssr: false })

export const metadata = {
  title: 'Wishlist | Spacecrafts Furniture',
  description: 'Your saved furniture items at Spacecrafts Furniture.',
  robots: { index: false, follow: false },
}

export default function WishlistPage(){
  return (
    <div className="container">
      <h1>Wishlist</h1>
      <WishlistClient />
    </div>
  )
}
