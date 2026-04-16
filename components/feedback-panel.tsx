"use client"

import * as React from "react"
import { Star, Send, Check, MessageSquare, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type FeedbackEntry = {
  id: string
  rating: number
  comment: string
  name: string
  createdAt: number
}

const STORAGE_KEY = "sanityos:feedback:v1"
const MAX_COMMENT = 500

function loadFeedback(): FeedbackEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is FeedbackEntry =>
        x &&
        typeof x.id === "string" &&
        typeof x.rating === "number" &&
        typeof x.comment === "string" &&
        typeof x.name === "string" &&
        typeof x.createdAt === "number",
    )
  } catch {
    return []
  }
}

function saveFeedback(list: FeedbackEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {}
}

function formatDate(ts: number) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

export function FeedbackPanel() {
  const [rating, setRating] = React.useState(0)
  const [hover, setHover] = React.useState(0)
  const [comment, setComment] = React.useState("")
  const [name, setName] = React.useState("")
  const [entries, setEntries] = React.useState<FeedbackEntry[]>([])
  const [submitted, setSubmitted] = React.useState(false)

  React.useEffect(() => {
    setEntries(loadFeedback())
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating < 1) return
    const entry: FeedbackEntry = {
      id: crypto.randomUUID(),
      rating,
      comment: comment.trim().slice(0, MAX_COMMENT),
      name: name.trim().slice(0, 40),
      createdAt: Date.now(),
    }
    const next = [entry, ...entries].slice(0, 50)
    setEntries(next)
    saveFeedback(next)
    setSubmitted(true)
    setRating(0)
    setComment("")
    setName("")
    window.setTimeout(() => setSubmitted(false), 2500)
  }

  function handleDelete(id: string) {
    const next = entries.filter((e) => e.id !== id)
    setEntries(next)
    saveFeedback(next)
  }

  const activeStars = hover || rating
  const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"]
  const average =
    entries.length > 0
      ? entries.reduce((sum, e) => sum + e.rating, 0) / entries.length
      : 0

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Feedback
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Rate SanityOS and tell us what to improve. Your input guides the next
          release.
        </p>
      </header>

      <Card className="border-border/60 frosted">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent">
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg sm:text-xl">
                Rate your experience
              </CardTitle>
              <CardDescription className="leading-relaxed">
                Stored locally for now. We&apos;re piloting feedback before
                wiring a backend.
              </CardDescription>
            </div>
            {entries.length > 0 && (
              <div className="ml-auto hidden items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-medium sm:flex">
                <Star
                  className="h-3.5 w-3.5 fill-accent text-accent"
                  aria-hidden="true"
                />
                <span className="tabular-nums">
                  {average.toFixed(1)} avg · {entries.length}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            aria-label="Submit feedback"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="feedback-rating">Rating</Label>
              <div
                id="feedback-rating"
                role="radiogroup"
                aria-label="Star rating"
                className="flex items-center gap-2"
              >
                {[1, 2, 3, 4, 5].map((n) => {
                  const filled = n <= activeStars
                  return (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={`${n} star${n === 1 ? "" : "s"}`}
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      onFocus={() => setHover(n)}
                      onBlur={() => setHover(0)}
                      onClick={() => setRating(n)}
                      className={cn(
                        "hover-elastic rounded-md p-1.5 transition-colors",
                        filled
                          ? "text-accent"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Star
                        className={cn(
                          "h-7 w-7 transition-transform",
                          filled && "fill-accent drop-shadow-[0_0_8px_oklch(0.75_0.17_55/0.6)]",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  )
                })}
                <span
                  className="ml-2 text-sm text-muted-foreground"
                  aria-live="polite"
                >
                  {activeStars > 0 ? ratingLabels[activeStars] : "Tap a star"}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="feedback-name">
                  Name{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="feedback-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anonymous"
                  maxLength={40}
                  autoComplete="off"
                  className="bg-background/60"
                />
              </div>
              <div className="hidden sm:block" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="feedback-comment">What&apos;s on your mind?</Label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {comment.length}/{MAX_COMMENT}
                </span>
              </div>
              <Textarea
                id="feedback-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
                placeholder="Bugs, ideas, what worked, what didn't…"
                rows={4}
                className="resize-none bg-background/60"
              />
            </div>

            <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p
                className={cn(
                  "inline-flex items-center gap-2 text-sm",
                  submitted
                    ? "text-foreground animate-fade-in"
                    : "text-muted-foreground",
                )}
                role="status"
                aria-live="polite"
              >
                {submitted ? (
                  <>
                    <Check
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                    Thanks — your feedback was saved.
                  </>
                ) : (
                  "Your rating helps the next release."
                )}
              </p>
              <Button
                type="submit"
                className="gap-2 sm:w-auto"
                disabled={rating < 1}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Submit feedback
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <Card className="border-border/60 frosted">
          <CardHeader>
            <CardTitle className="text-base">Your past feedback</CardTitle>
            <CardDescription>
              Saved to this device. Only you can see this.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="stagger-in flex flex-col gap-3">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background/40 p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="flex items-center gap-0.5"
                      aria-label={`${e.rating} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={cn(
                            "h-4 w-4",
                            n <= e.rating
                              ? "fill-accent text-accent"
                              : "text-muted-foreground/40",
                          )}
                          aria-hidden="true"
                        />
                      ))}
                      <span className="ml-2 truncate text-sm font-medium">
                        {e.name || "Anonymous"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(e.createdAt)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(e.id)}
                        aria-label="Delete feedback entry"
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  {e.comment && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {e.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
