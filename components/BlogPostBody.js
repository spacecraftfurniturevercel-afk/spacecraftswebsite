import Image from 'next/image'
import styles from '../app/blog/blog.module.css'

export default function BlogPostBody({ sections }) {
  return (
    <div className={styles.prose}>
      {sections.map((block, i) => {
        if (block.type === 'h2') {
          return <h2 key={i}>{block.text}</h2>
        }
        if (block.type === 'h3') {
          return <h3 key={i}>{block.text}</h3>
        }
        if (block.type === 'image') {
          return (
            <figure key={i} className={styles.figure}>
              <div className={styles.inlineImage}>
                <Image
                  src={block.src}
                  alt={block.alt}
                  width={1200}
                  height={675}
                  sizes="(max-width: 900px) 100vw, 760px"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              {block.caption ? <figcaption className={styles.caption}>{block.caption}</figcaption> : null}
            </figure>
          )
        }
        if (block.type === 'ul') {
          return (
            <ul key={i}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{block.text}</p>
      })}
    </div>
  )
}
