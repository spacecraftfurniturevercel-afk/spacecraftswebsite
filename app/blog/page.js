import Link from 'next/link'
import Image from 'next/image'
import { getAllBlogPosts } from '../../lib/blogPosts'
import { COMPANY } from '../../lib/companyInfo'
import styles from './blog.module.css'

const SITE = COMPANY.url

export const metadata = {
  title: 'Furniture Blog & Buying Guides',
  description:
    'Tips on buying sofas, beds, and space-saving furniture online in India. Visit our Chennai showroom guides, delivery info, and care advice from Spacecrafts Furniture.',
  alternates: {
    canonical: `${SITE}/blog`,
  },
  openGraph: {
    title: 'Spacecrafts Furniture Blog',
    description: 'Buying guides, showroom visits, and furniture tips from Chennai.',
    url: `${SITE}/blog`,
    type: 'website',
    images: [{ url: '/aboutus/exterior1.webp', width: 1200, height: 630 }],
  },
}

export default function BlogIndexPage() {
  const posts = getAllBlogPosts()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${COMPANY.name} Blog`,
    description: metadata.description,
    url: `${SITE}/blog`,
    publisher: {
      '@type': 'Organization',
      name: COMPANY.name,
      url: SITE,
      logo: `${SITE}/favlogo/logo-01.png`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: COMPANY.address.street,
        addressLocality: COMPANY.address.city,
        addressRegion: COMPANY.address.region,
        postalCode: COMPANY.address.postalCode,
        addressCountry: COMPANY.address.country,
      },
    },
  }

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className={styles.hero}>
        <h1>Furniture tips & buying guides</h1>
        <p>
          Practical advice from {COMPANY.name}, Ambattur, Chennai — plus guides to our showroom at{' '}
          {COMPANY.address.locality}.
        </p>
      </header>
      <div className={styles.grid}>
        {posts.map((post) => (
          <article key={post.slug} className={styles.card}>
            <Link href={`/blog/${post.slug}`} className={styles.cardImage}>
              <Image
                src={post.image}
                alt={post.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </Link>
            <div className={styles.cardBody}>
              <time className={styles.cardDate} dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <h2 className={styles.cardTitle}>
                <Link href={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {post.title}
                </Link>
              </h2>
              <p className={styles.cardExcerpt}>{post.description}</p>
              <Link href={`/blog/${post.slug}`} className={styles.cardLink}>
                Read article →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
