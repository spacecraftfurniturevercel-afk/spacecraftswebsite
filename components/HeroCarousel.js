"use client"
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

export default function HeroCarousel({images}){
  const slides = images && images.length ? images : ['/hero-1.svg','/hero-1.svg','/hero-1.svg']
  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  useEffect(()=>{
    start()
    return () => stop()
  },[])

  function start(){
    stop()
    timer.current = setInterval(()=>{
      setIndex(i => (i+1) % slides.length)
    },4000)
  }
  function stop(){ if(timer.current) clearInterval(timer.current) }
  function go(i){ setIndex(((i%slides.length)+slides.length)%slides.length) }

  return (
    <section className="hero">
      <div className="hero-inner">
        {slides.map((src,i)=> (
          <div key={i} className={`hero-slide ${i===index? 'active':''}`} aria-hidden={i!==index} onMouseEnter={stop} onMouseLeave={start}>
            <div style={{position:'relative', width:'100%', height:'100%'}}>
              <Image src={src} alt={`Slide ${i+1}`} fill style={{objectFit:'cover'}} priority={i===0} />
            </div>
          </div>
        ))}

        <button className="hero-prev" onClick={()=>go(index-1)} aria-label="Previous">‹</button>
        <button className="hero-next" onClick={()=>go(index+1)} aria-label="Next">›</button>

        <div className="hero-dots">
          {slides.map((_,i)=> (
            <button key={i} className={`hero-dot ${i===index? 'active':''}`} onClick={()=>go(i)} aria-label={`Go to slide ${i+1}`}></button>
          ))}
        </div>
      </div>
    </section>
  )
}
