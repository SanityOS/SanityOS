"use client"

import * as React from "react"
import { Check, Gift, Sparkles, Ticket, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCredits } from "@/components/credits-context"

type Feedback =
  | { tone: "success"; text: string }
  | { tone: "error"; text: string }
  | null

export function CreditsRedeemer() {
  const { credits, redeemed, redeem, codes } = useCredits()
  const [value, setValue] = React.useState("")
  const [feedback, setFeedback] = React.useState<Feedback>(null)
  const [submitting, setSubmitting] = React.useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    // Tiny delay so the button feedback feels real, not jarring.
    window.setTimeout(() => {
      const result = redeem(value)
      if (result.ok) {
        setFeedback({
          tone: "success",
          text: `Redeemed ${result.code}. +${result.credits} credits added.`,
        })
        setValue("")
      } else if (result.reason === "already") {
        setFeedback({ tone: "error", text: "That code was already redeemed." })
      } else if (result.reason === "unknown") {
        setFeedback({ tone: "error", text: "That code isn't valid." })
      } else {
        setFeedback({ tone: "error", text: "Enter a code to redeem." })
      }
      setSubmitting(false)
    }, 180)
  }

  function applyCode(code: string) {
    setValue(code)
    setFeedback(null)
  }

  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent">
            <Gift className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg sm:text-xl">Redeem a code</CardTitle>
            <CardDescription className="leading-relaxed">
              Enter a promo code to earn credits. Available codes are shown
              below.
            </CardDescription>
          </div>
          <div
            className="ml-auto flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-medium"
            aria-live="polite"
          >
            <Sparkles
              className="h-3.5 w-3.5 text-accent"
              aria-hidden="true"
            />
            <span className="tabular-nums">
              {credits.toLocaleString()} credits
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
        >
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="redeem-code">Code</Label>
            <Input
              id="redeem-code"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                if (feedback) setFeedback(null)
              }}
              placeholder="e.g. Release2026"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="bg-background/60"
            />
          </div>
          <Button
            type="submit"
            className="gap-2 sm:w-auto"
            disabled={submitting || !value.trim()}
          >
            <Ticket className="h-4 w-4" aria-hidden="true" />
            Redeem
          </Button>
        </form>

        {feedback && (
          <div
            role="status"
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2 text-sm animate-fade-in",
              feedback.tone === "success"
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-destructive/40 bg-destructive/10 text-foreground",
            )}
          >
            {feedback.tone === "success" ? (
              <Check
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
            ) : (
              <X
                className="h-4 w-4 text-destructive"
                aria-hidden="true"
              />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Available codes</h3>
            <span className="text-xs text-muted-foreground">
              Tap a code to fill it in
            </span>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {codes.map((c) => {
              const used = redeemed.includes(c.code)
              return (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => !used && applyCode(c.code)}
                    disabled={used}
                    aria-label={`Use code ${c.code} for ${c.credits} credits`}
                    className={cn(
                      "group flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      used
                        ? "cursor-not-allowed border-border/40 bg-background/30 text-muted-foreground"
                        : "border-border/60 bg-background/40 hover:border-primary/50 hover:bg-primary/5",
                    )}
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-mono text-sm font-semibold">
                        {c.code}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {c.label}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums",
                        used
                          ? "border-border/40 text-muted-foreground"
                          : "border-accent/40 bg-accent/10 text-accent-foreground",
                      )}
                    >
                      {used ? "Redeemed" : `+${c.credits}`}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
