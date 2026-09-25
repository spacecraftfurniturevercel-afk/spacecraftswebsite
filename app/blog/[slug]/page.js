import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getAllBlogSlugs, getBlogPostBySlug } from '../../../lib/blogPosts'
import { COMPANY } from '../../../lib/companyInfo'
import BlogPostBody from '../../../components/BlogPostBody'
import styles from '../blog.module.css'

const SITE = COMPANY.url

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const post = getBlogPostBySlug(params.slug)
  if (!post) return { title: 'Article not found' }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `${SITE}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [{ url: post.image, alt: post.imageAlt }],
    },
  }
}

export default function BlogPostPage({ params }) {
  const post = getBlogPostBySlug(params.slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: `${SITE}${post.image}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: COMPANY.name,
      url: SITE,
    },
    publisher: {
      '@type': 'Organization',
      name: COMPANY.name,
      url: SITE,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE}/favlogo/logo-01.png`,
      },
    },
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
  }

  return (
    <article className={styles.article}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/blog" className={styles.backLink}>← All articles</Link>
      <header className={styles.articleHeader}>
        <h1>{post.title}</h1>
        <p className={styles.meta}>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          {' · '}
          {COMPANY.name}
        </p>
      </header>
      <div className={styles.heroImage}>
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 760px"
        />
      </div>
      <BlogPostBody sections={post.sections} />
      <aside className={styles.napBox}>
        <strong>{COMPANY.name}</strong>
        <br />
        📍 {COMPANY.address.full}
        <br />
        📞 <a href={`tel:${COMPANY.phoneTel}`}>{COMPANY.phoneDisplay}</a>
        <br />
        ✉️ <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        <br />
        <a href={COMPANY.mapsUrl} target="_blank" rel="noopener noreferrer">
          View on Google Maps
        </a>
        {' · '}
        <Link href="/store-locator">Store locator</Link>
        {' · '}
        <Link href="/products">Shop furniture</Link>
      </aside>
    </article>
  )
}
