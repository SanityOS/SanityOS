"use client"

import { Play, Pause, Music2, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useMusic } from "@/components/music-context"

function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00"
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, "0")}`
}

export function MusicPlayer() {
  const {
    tracks,
    current,
    playing,
    progress,
    duration,
    volume,
    playTrack,
    seek,
    setVolume,
  } = useMusic()

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Music
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
          Playback keeps running when you switch pages. Pick a track to start.
        </p>
      </header>

      {current && (
        <Card className="border-border/60 bg-card/70 backdrop-blur">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wider">
              Now Playing
            </CardDescription>
            <CardTitle className="text-lg sm:text-xl">{current.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Slider
              value={[Math.min(progress, duration || 0)]}
              max={duration || 0}
              step={1}
              onValueChange={(v) => seek(v[0] ?? 0)}
              aria-label="Seek"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Volume2
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Slider
                value={[Math.round(volume * 100)]}
                max={100}
                step={1}
                onValueChange={(v) => setVolume((v[0] ?? 0) / 100)}
                aria-label="Volume"
                className="max-w-48"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 bg-card/70 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Music2 className="h-4 w-4" aria-hidden="true" />
            Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {tracks.map((track) => {
              const isCurrent = current?.id === track.id
              const isPlaying = isCurrent && playing
              return (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => playTrack(track)}
                    aria-pressed={isPlaying}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border border-transparent bg-background/40 px-3 py-3 text-left transition-colors sm:gap-4 sm:px-4",
                      "hover:border-border hover:bg-background/60",
                      isCurrent && "border-primary/50 bg-primary/10",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground",
                      )}
                      aria-hidden="true"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">
                        {track.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {track.genre}
                      </span>
                    </div>
                    {isPlaying && (
                      <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                        Live
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
