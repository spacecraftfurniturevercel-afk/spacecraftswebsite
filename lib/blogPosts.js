import { BLOG_POSTS_DATA } from './blogPostsData'

/**
 * Static blog posts for SEO & content marketing.
 * Edit lib/blogPostsData.js to add or lengthen articles.
 */
export const BLOG_POSTS = BLOG_POSTS_DATA

export function getAllBlogPosts() {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  )
}

export function getBlogPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null
}

export function getAllBlogSlugs() {
  return BLOG_POSTS.map((p) => p.slug)
}
