import { useEffect, useRef, useState } from 'react'

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))

/** 0 → 1 progress while a tall section scrolls past its sticky viewport. */
export function useSectionProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const distance = rect.height - window.innerHeight
      setProgress(distance > 0 ? clamp(-rect.top / distance) : 0)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return [ref, progress] as const
}

/** Page-level scroll progress plus whether the user has left the top. */
export function usePageScroll() {
  const [state, setState] = useState({ progress: 0, scrolled: false })
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setState({ progress: max > 0 ? clamp(window.scrollY / max) : 0, scrolled: window.scrollY > 40 })
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  return state
}

/** Flags every [data-reveal] element with data-in="true" once it enters the viewport. */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-in', 'true')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/** Linear map of a sub-range of progress to 0 → 1. */
export const segment = (p: number, start: number, end: number) =>
  clamp((p - start) / (end - start))
