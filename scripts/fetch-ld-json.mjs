import https from 'https'

const url = process.argv[2] || 'https://www.spacecraftsfurniture.in/products/blossom-sofa-cum-bed-with-storage'

https.get(url, (r) => {
  let d = ''
  r.on('data', (c) => (d += c))
  r.on('end', () => {
    const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    let m
    let i = 0
    while ((m = re.exec(d))) {
      console.log('--- block', ++i)
      console.log(JSON.stringify(JSON.parse(m[1]), null, 2))
    }
    if (!i) console.log('no ld+json found')
  })
})
