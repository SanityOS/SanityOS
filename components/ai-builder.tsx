"use client"

import { useState } from "react"
import {
  Sparkles,
  Map,
  Code,
  LayoutPanelLeft,
  Box,
  Loader2,
  Wand2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CoreAssistant } from "@/components/core-assistant"

type BuildType = "map" | "script" | "gui" | "3d"

const TYPES: { id: BuildType; label: string; icon: typeof Map }[] = [
  { id: "map", label: "Map", icon: Map },
  { id: "script", label: "Script", icon: Code },
  { id: "gui", label: "GUI", icon: LayoutPanelLeft },
  { id: "3d", label: "3D Model", icon: Box },
]

export function AIBuilder() {
  const [buildType, setBuildType] = useState<BuildType>("map")
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<string | null>(null)

  function handleGenerate() {
    if (!prompt.trim()) return
    setLoading(true)
    setOutput(null)
    setTimeout(() => {
      setLoading(false)
      setOutput(
        `Generated a ${buildType.toUpperCase()} draft from your description. (Demo output — wire this to an AI route handler to make it real.)`,
      )
    }, 900)
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <header className="relative flex flex-col gap-2">
        {/* Soft animated glow behind the header */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 left-0 -z-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl animate-pulse-soft"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-4 right-0 -z-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl animate-pulse-soft"
        />
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Wand2 className="h-3 w-3 text-accent animate-wiggle" aria-hidden="true" />
          Creative Hub
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          AI Builder
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
          Describe your idea. Pick a build type. Let SanityOS scaffold it.
        </p>
      </header>

      <Card className="relative overflow-hidden border-border/60 frosted">
        <CardHeader>
          <CardTitle className="text-base">Build Type</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div
            role="radiogroup"
            aria-label="Build type"
            className="stagger-in grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {TYPES.map((t) => {
              const Icon = t.icon
              const active = buildType === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setBuildType(t.id)}
                  data-glow={active ? "true" : undefined}
                  className={cn(
                    "hover-elastic group relative flex flex-col items-center gap-2 overflow-hidden rounded-lg border p-4 text-sm font-medium",
                    active
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border/60 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 -top-10 h-20 bg-gradient-to-b from-primary/25 to-transparent blur-xl"
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      active
                        ? "scale-110 text-primary"
                        : "group-hover:scale-110",
                    )}
                    aria-hidden="true"
                  />
                  {t.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ai-prompt">Describe your idea</Label>
            <Textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A foggy volcanic island with a winding coastal path and a lighthouse..."
              className="min-h-32 resize-y bg-background/60 transition-shadow focus-visible:shadow-[0_0_0_4px_oklch(0.62_0.19_255/0.15)]"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              {prompt.length} characters
            </p>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className={cn(
                "gap-2 transition-all duration-300",
                !loading &&
                  prompt.trim() &&
                  "shadow-[0_0_0_0_var(--color-primary)] hover:shadow-[0_0_24px_-4px_var(--color-primary)]",
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles
                  className="h-4 w-4 animate-wiggle"
                  aria-hidden="true"
                />
              )}
              {loading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </CardContent>

        {loading && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden"
          >
            <div className="h-full w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
        )}
      </Card>

      {output && (
        <Card className="border-border/60 frosted animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {output}
            </p>
          </CardContent>
        </Card>
      )}

      <CoreAssistant
        buildType={buildType}
        promptLength={prompt.length}
        hasOutput={output !== null}
        onUsePrompt={(p) => setPrompt(p)}
        onSwitchType={(t) => setBuildType(t)}
      />
    </div>
  )
}
