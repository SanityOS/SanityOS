"use client"

/**
 * CornerFlames
 * Four fixed flame/glow blobs in each viewport corner with a flicker animation.
 * Intensifies when Ultra Mega Mode is on. Pointer-events: none so it never
 * blocks interaction and uses a very low z-index under all UI.
 */
export function CornerFlames({ ultra }: { ultra: boolean }) {
  const intensity = ultra ? "opacity-70" : "opacity-40"
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${intensity}`}
    >
      {/* Top-left — amber/accent flame */}
      <span
        className="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl animate-flame-flicker"
        style={{
          background:
            "radial-gradient(circle, oklch(0.75 0.17 55 / 0.55) 0%, oklch(0.75 0.17 55 / 0) 70%)",
          animationDelay: "0s",
        }}
      />
      {/* Top-right — primary blue glow */}
      <span
        className="absolute -right-24 -top-28 h-80 w-80 rounded-full blur-3xl animate-flame-flicker"
        style={{
          background:
            "radial-gradient(circle, oklch(0.62 0.19 255 / 0.55) 0%, oklch(0.62 0.19 255 / 0) 70%)",
          animationDelay: "0.6s",
        }}
      />
      {/* Bottom-left — primary blue */}
      <span
        className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full blur-3xl animate-flame-flicker"
        style={{
          background:
            "radial-gradient(circle, oklch(0.62 0.19 255 / 0.5) 0%, oklch(0.62 0.19 255 / 0) 70%)",
          animationDelay: "1.2s",
        }}
      />
      {/* Bottom-right — amber/accent flame */}
      <span
        className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl animate-flame-flicker"
        style={{
          background:
            "radial-gradient(circle, oklch(0.75 0.17 55 / 0.55) 0%, oklch(0.75 0.17 55 / 0) 70%)",
          animationDelay: "1.8s",
        }}
      />
    </div>
  )
}
