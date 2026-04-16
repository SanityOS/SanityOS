"use client"

import { Play, Pause, SkipBack, SkipForward, Music2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMusic } from "@/components/music-context"

function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00"
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, "0")}`
}

export function MiniPlayer() {
  const { current, playing, progress, duration, togglePlay, next, previous } =
    useMusic()

  if (!current) return null

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div
      role="region"
      aria-label="Now playing"
      className="sticky bottom-0 z-20 border-t border-border/60 bg-card/95 backdrop-blur"
    >
      <div
        className="h-0.5 w-full bg-border/50"
        aria-hidden="true"
      >
        <div
          className="h-full bg-primary transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              playing
                ? "bg-primary/15 text-primary"
                : "bg-secondary text-muted-foreground",
            )}
            aria-hidden="true"
          >
            <Music2 className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{current.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {current.genre} · {formatTime(progress)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={previous}
            aria-label="Previous track"
            className="h-9 w-9"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            className="h-10 w-10"
          >
            {playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={next}
            aria-label="Next track"
            className="h-9 w-9"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
