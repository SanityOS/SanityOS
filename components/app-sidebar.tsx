"use client"

import { Home, Sparkles, Music, Flame, Zap, Plug, Github, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export type View = "home" | "ai" | "router" | "music"

// Update this to your real repo URL any time. Single source of truth.
export const GITHUB_URL = "https://github.com/sanityos/sanityos"

const NAV: { id: View; label: string; icon: typeof Home; hint: string }[] = [
  { id: "home", label: "Home", icon: Home, hint: "Overview" },
  { id: "ai", label: "AI Builder", icon: Sparkles, hint: "Generate" },
  { id: "router", label: "AI Router", icon: Plug, hint: "Roblox" },
  { id: "music", label: "Music", icon: Music, hint: "Listen" },
]

interface AppSidebarProps {
  view: View
  onChangeView: (v: View) => void
  ultra: boolean
  onToggleUltra: (v: boolean) => void
}

export function AppSidebar({
  view,
  onChangeView,
  ultra,
  onToggleUltra,
}: AppSidebarProps) {
  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground animate-brand-glow">
          <Zap className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight leading-none">
            SanityOS
          </span>
          <span
            className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent"
            aria-label="Version 0.2 Beta"
          >
            <Flame className="h-3 w-3" aria-hidden="true" />
            v0.2 Beta
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Primary">
        <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        {NAV.map((item) => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeView(item.id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-[0_0_24px_-6px_oklch(0.62_0.19_255/0.7)]"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-left">{item.label}</span>
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wider",
                  active
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground/60",
                )}
              >
                {item.hint}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        {/* GitHub promo */}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="View SanityOS on GitHub"
          className="group flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 text-sm transition-colors hover:border-primary/50 hover:bg-primary/5"
        >
          <span className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground">
              <Github className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-medium">GitHub</span>
              <span className="text-[11px] text-muted-foreground">
                Star the project
              </span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
            <Star className="h-3 w-3" aria-hidden="true" />
            Star
          </span>
        </a>

        {/* Ultra toggle */}
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  ultra
                    ? "bg-accent/20 text-accent"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                <Flame className="h-4 w-4" aria-hidden="true" />
              </div>
              <Label
                htmlFor="ultra-toggle"
                className="cursor-pointer text-sm font-medium"
              >
                Ultra Mega Mode
              </Label>
            </div>
            <Switch
              id="ultra-toggle"
              checked={ultra}
              onCheckedChange={onToggleUltra}
              aria-label="Toggle Ultra Mega Mode"
            />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Cranks up corner flames and adds a hue-shifting overlay.
          </p>
        </div>
      </div>
    </div>
  )
}
