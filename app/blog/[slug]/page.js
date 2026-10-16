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

function absoluteImageUrl(src) {
  if (!src) return `${SITE}/aboutus/exterior1.webp`
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  return `${SITE}${src.startsWith('/') ? src : `/${src}`}`
}

function resolveBlogTitle(post) {
  if (post.metaTitle) {
    return { absolute: `${post.metaTitle} | Spacecrafts Furniture` }
  }
  return post.title
}

function buildBlogFaqJsonLd(post) {
  if (!post.faqs?.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export async function generateMetadata({ params }) {
  const post = getBlogPostBySlug(params.slug)
  if (!post) return { title: 'Article not found' }

  const ogTitle = post.metaTitle || post.title

  return {
    title: resolveBlogTitle(post),
    description: post.description,
    keywords: Array.isArray(post.tags) ? post.tags.join(', ') : undefined,
    alternates: {
      canonical: `${SITE}/blog/${post.slug}`,
    },
    openGraph: {
      title: ogTitle,
      description: post.description,
      url: `${SITE}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [{ url: absoluteImageUrl(post.image), alt: post.imageAlt }],
    },
  }
}

export default function BlogPostPage({ params }) {
  const post = getBlogPostBySlug(params.slug)
  if (!post) notFound()

  const headline = post.headline || post.title
  const faqJsonLd = buildBlogFaqJsonLd(post)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    description: post.description,
    image: absoluteImageUrl(post.image),
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
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <Link href="/blog" className={styles.backLink}>← All articles</Link>
      <header className={styles.articleHeader}>
        <h1>{headline}</h1>
        {post.subtitle && <p className={styles.articleDeck}>{post.subtitle}</p>}
        {post.quickLinks?.length > 0 && (
          <p className={styles.articleQuickLinks}>
            {post.quickLinks.map((link, index) => (
              <span key={link.href}>
                {index > 0 && ' · '}
                <Link href={link.href}>{link.label}</Link>
              </span>
            ))}
          </p>
        )}
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
