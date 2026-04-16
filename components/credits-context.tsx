"use client"

import * as React from "react"

export type RedeemCode = {
  code: string
  credits: number
  label: string
}

// Visible codes users can redeem. Shown next to the redeemer by design.
export const REDEEM_CODES: RedeemCode[] = [
  { code: "Release2026", credits: 50, label: "Launch bonus" },
  { code: "SanityFan", credits: 25, label: "Community" },
  { code: "BuilderBoost", credits: 30, label: "Creators" },
  { code: "Beta02", credits: 75, label: "0.2 Beta drop" },
  { code: "FlameOn", credits: 40, label: "Ultra promo" },
  { code: "RobloxDev", credits: 60, label: "Studio plugin" },
  { code: "NightOwl", credits: 20, label: "Late-night build" },
  { code: "SecureMe", credits: 35, label: "Safety first" },
]

const STORAGE_KEY = "sanityos:credits:v1"
const REDEEMED_KEY = "sanityos:redeemed:v1"
const STARTING_CREDITS = 100

export type RedeemResult =
  | { ok: true; credits: number; code: string }
  | { ok: false; reason: "unknown" | "already" | "empty" }

type CreditsContextValue = {
  credits: number
  redeemed: string[]
  redeem: (input: string) => RedeemResult
  codes: RedeemCode[]
}

const CreditsContext = React.createContext<CreditsContextValue | null>(null)

export function useCredits() {
  const ctx = React.useContext(CreditsContext)
  if (!ctx) throw new Error("useCredits must be used inside CreditsProvider")
  return ctx
}

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = React.useState<number>(STARTING_CREDITS)
  const [redeemed, setRedeemed] = React.useState<string[]>([])
  const hydrated = React.useRef(false)

  // Load persisted state on mount (client only).
  React.useEffect(() => {
    try {
      const rawCredits = window.localStorage.getItem(STORAGE_KEY)
      if (rawCredits !== null) {
        const n = Number.parseInt(rawCredits, 10)
        if (!Number.isNaN(n)) setCredits(n)
      }
      const rawRedeemed = window.localStorage.getItem(REDEEMED_KEY)
      if (rawRedeemed) {
        const arr = JSON.parse(rawRedeemed)
        if (Array.isArray(arr)) setRedeemed(arr.filter((v) => typeof v === "string"))
      }
    } catch {
      // ignore storage errors
    }
    hydrated.current = true
  }, [])

  React.useEffect(() => {
    if (!hydrated.current) return
    try {
      window.localStorage.setItem(STORAGE_KEY, String(credits))
    } catch {}
  }, [credits])

  React.useEffect(() => {
    if (!hydrated.current) return
    try {
      window.localStorage.setItem(REDEEMED_KEY, JSON.stringify(redeemed))
    } catch {}
  }, [redeemed])

  const redeem = React.useCallback(
    (input: string): RedeemResult => {
      const trimmed = input.trim()
      if (!trimmed) return { ok: false, reason: "empty" }

      const match = REDEEM_CODES.find(
        (c) => c.code.toLowerCase() === trimmed.toLowerCase(),
      )
      if (!match) return { ok: false, reason: "unknown" }

      if (redeemed.includes(match.code)) {
        return { ok: false, reason: "already" }
      }

      setCredits((prev) => prev + match.credits)
      setRedeemed((prev) => [...prev, match.code])
      return { ok: true, credits: match.credits, code: match.code }
    },
    [redeemed],
  )

  const value: CreditsContextValue = {
    credits,
    redeemed,
    redeem,
    codes: REDEEM_CODES,
  }

  return (
    <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>
  )
}
