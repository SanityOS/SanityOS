"use client"

import * as React from "react"

/**
 * Low-CPU ambient particle field. Renders once, animates on a single rAF
 * loop at a capped frame rate. Disables itself for `prefers-reduced-motion`
 * and when offscreen (tab hidden) to keep battery use minimal.
 */
export function ParticleField({
  density = 0.00008, // particles per px^2 — tuned low
  className,
}: {
  density?: number
  className?: string
}) {
  const ref = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let particles: {
      x: number
      y: number
      vx: number
      vy: number
      r: number
      a: number
    }[] = []

    function resize() {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.max(24, Math.floor(width * height * density))
      particles = new Array(count).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.2 + 0.3,
        a: Math.random() * 0.5 + 0.2,
      }))
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let raf = 0
    let last = 0
    const fpsCap = 30 // cap to keep CPU low
    const frameMs = 1000 / fpsCap
    let running = !reduce

    function tick(now: number) {
      if (!running) return
      if (now - last < frameMs) {
        raf = requestAnimationFrame(tick)
        return
      }
      last = now

      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -2) p.x = width + 2
        if (p.x > width + 2) p.x = -2
        if (p.y < -2) p.y = height + 2
        if (p.y > height + 2) p.y = -2

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        // Primary blue particle with soft alpha.
        ctx.fillStyle = `oklch(0.82 0.08 255 / ${p.a})`
        ctx.fill()
      }

      raf = requestAnimationFrame(tick)
    }

    if (!reduce) raf = requestAnimationFrame(tick)

    function onVisibility() {
      running = document.visibilityState === "visible" && !reduce
      if (running && !raf) raf = requestAnimationFrame(tick)
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [density])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={
        "pointer-events-none absolute inset-0 h-full w-full " + (className ?? "")
      }
    />
  )
}
