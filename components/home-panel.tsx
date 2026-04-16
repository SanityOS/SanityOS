"use client"

import {
  Sparkles,
  Music,
  Flame,
  ArrowRight,
  Activity,
  Coins,
  Github,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditsRedeemer } from "@/components/credits-redeemer"
import { useCredits } from "@/components/credits-context"
import { GITHUB_URL } from "@/components/app-sidebar"

type View = "home" | "ai" | "router" | "music"

interface HomePanelProps {
  onNavigate: (view: View) => void
  ultra: boolean
}

export function HomePanel({ onNavigate, ultra }: HomePanelProps) {
  const { credits } = useCredits()

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Flame className="h-3 w-3" aria-hidden="true" />
            v0.2 Beta
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Activity className="h-3 w-3 text-primary" aria-hidden="true" />
            All systems operational
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs backdrop-blur">
            <Coins className="h-3 w-3 text-accent" aria-hidden="true" />
            <span className="tabular-nums text-foreground">
              {credits.toLocaleString()}
            </span>
            <span className="text-muted-foreground">credits</span>
          </div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="View SanityOS on GitHub"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <Github className="h-3 w-3" aria-hidden="true" />
            GitHub
          </a>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Welcome to SanityOS
        </h1>
        <p className="max-w-2xl text-pretty text-base text-muted-foreground leading-relaxed sm:text-lg">
          A creative workspace for generating maps, scripts, GUIs, 3D models,
          and music with AI. Pick a tool from the sidebar to begin.
        </p>
      </header>

      <div className="stagger-in grid gap-4 sm:grid-cols-2">
        <Card className="hover-elastic border-border/60 frosted hover:border-primary/40">
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle className="text-lg sm:text-xl">AI Builder</CardTitle>
            <CardDescription className="leading-relaxed">
              Describe what you want — a map, a script, a UI, or a 3D model —
              and let the AI scaffold it for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => onNavigate("ai")}
            >
              Open Builder
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elastic border-border/60 frosted hover:border-primary/40">
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Music className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle className="text-lg sm:text-xl">Music Player</CardTitle>
            <CardDescription className="leading-relaxed">
              Curated tracks for building and focus. Playback continues in the
              background when you switch pages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => onNavigate("music")}
            >
              Open Player
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <CreditsRedeemer />

      <Card className="border-border/60 frosted">
        <CardContent className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent">
              <Flame className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold sm:text-lg">
                Ultra Mega Mode
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {ultra
                  ? "Ultra is active. A hue-shifting overlay is applied across the app."
                  : "Toggle the mode from the sidebar to apply an animated overlay."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-medium">
            <span
              className={
                ultra
                  ? "h-1.5 w-1.5 rounded-full bg-accent"
                  : "h-1.5 w-1.5 rounded-full bg-muted-foreground"
              }
              aria-hidden="true"
            />
            <span className={ultra ? "text-accent" : "text-muted-foreground"}>
              {ultra ? "Active" : "Standby"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
