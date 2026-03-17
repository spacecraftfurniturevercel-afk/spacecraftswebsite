import dynamic from 'next/dynamic'

const CartClient = dynamic(() => import('../../components/CartClient'), { ssr: false })

export const metadata = {
  title: 'Shopping Cart | Spacecrafts Furniture',
  description: 'Review your cart items and proceed to checkout.',
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return <CartClient />
}
