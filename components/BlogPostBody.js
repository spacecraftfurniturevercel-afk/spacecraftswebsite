import styles from '../app/blog/blog.module.css'

export default function BlogPostBody({ sections }) {
  return (
    <div className={styles.prose}>
      {sections.map((block, i) => {
        if (block.type === 'h2') {
          return <h2 key={i}>{block.text}</h2>
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
