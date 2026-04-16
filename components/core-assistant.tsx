"use client"

import * as React from "react"
import {
  Bot,
  Send,
  Sparkles,
  Map as MapIcon,
  Code,
  LayoutPanelLeft,
  Box,
  HelpCircle,
  Lightbulb,
  LifeBuoy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type BuildType = "map" | "script" | "gui" | "3d"

type Msg = {
  id: string
  role: "core" | "user"
  text: string
}

interface CoreAssistantProps {
  buildType: BuildType
  promptLength: number
  hasOutput: boolean
  onUsePrompt: (prompt: string) => void
  onSwitchType?: (t: BuildType) => void
}

/**
 * SanityOS Core Intelligence — the "human-centric" coach layer.
 *
 * This is a persona on top of your app state, not a general chat model.
 * It detects three classes of intent locally:
 *   - greeting / "how does this work"  -> capability breakdown
 *   - "I don't know / I'm lost"        -> next-step suggestion from state
 *   - anything else                    -> offers a starter prompt
 *
 * It also surfaces an Evolutionary Phase disclaimer so users know the
 * core is still learning. Quick-action chips keep new users unstuck.
 */
export function CoreAssistant({
  buildType,
  promptLength,
  hasOutput,
  onUsePrompt,
  onSwitchType,
}: CoreAssistantProps) {
  const [messages, setMessages] = React.useState<Msg[]>(() => [
    {
      id: "welcome",
      role: "core",
      text:
        "Hi — I'm the SanityOS Core. I can help you build maps, scripts, GUIs, and 3D models. What's your goal right now?",
    },
  ])
  const [input, setInput] = React.useState("")
  const logRef = React.useRef<HTMLDivElement | null>(null)

  // Auto-scroll log to newest message.
  React.useEffect(() => {
    const el = logRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  function push(role: Msg["role"], text: string) {
    setMessages((m) => [
      ...m,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role, text },
    ])
  }

  function suggestNextStep(): string {
    if (hasOutput) {
      return "You've got a draft. Want me to generate a lighting environment, a spawn script, or a matching UI next?"
    }
    if (promptLength === 0) {
      switch (buildType) {
        case "map":
          return "Let's start with a map. Try: 'A foggy volcanic island with a winding coastal path and a lighthouse.'"
        case "script":
          return "Start a script. Try: 'A round-based system with a 60s timer, team scoring, and a winner screen.'"
        case "gui":
          return "Try a GUI: 'An inventory panel with 5 category tabs and a search bar at the top.'"
        case "3d":
          return "Try a 3D model: 'A low-poly medieval blacksmith with an anvil, hammer, and forge.'"
      }
    }
    return "You've got a prompt drafted. Hit Generate when you're ready — or ask me to refine it first."
  }

  function classify(raw: string):
    | { kind: "greet" }
    | { kind: "lost" }
    | { kind: "capability" }
    | { kind: "switch"; to: BuildType }
    | { kind: "other" } {
    const t = raw.toLowerCase().trim()
    if (!t) return { kind: "other" }
    if (/^(hi|hey|hello|yo|sup|howdy)\b/.test(t)) return { kind: "greet" }
    if (
      t.includes("how does this work") ||
      t.includes("what can you do") ||
      t.includes("what do you do")
    ) {
      return { kind: "capability" }
    }
    if (
      t.includes("i don't know") ||
      t.includes("i dont know") ||
      t.includes("i'm lost") ||
      t.includes("im lost") ||
      t.includes("help") ||
      t.includes("stuck")
    ) {
      return { kind: "lost" }
    }
    if (t.includes("map")) return { kind: "switch", to: "map" }
    if (t.includes("script")) return { kind: "switch", to: "script" }
    if (t.includes("gui") || t.includes("ui") || t.includes("menu")) {
      return { kind: "switch", to: "gui" }
    }
    if (t.includes("3d") || t.includes("model")) {
      return { kind: "switch", to: "3d" }
    }
    return { kind: "other" }
  }

  function respond(userText: string) {
    const intent = classify(userText)
    switch (intent.kind) {
      case "greet":
        push(
          "core",
          "Hey. I'm still learning your creative style — my logic core is at 65% capacity. Are we building a map, scripting a system, or designing a UI?",
        )
        return
      case "capability":
        push(
          "core",
          "I can scaffold four things: Maps (environments), Scripts (logic), GUIs (UIs), and 3D Models. Tell me what you want and I'll draft it.",
        )
        return
      case "lost":
        push("core", suggestNextStep())
        return
      case "switch":
        onSwitchType?.(intent.to)
        push(
          "core",
          `Switched to ${LABEL[intent.to]}. ${STARTERS[intent.to]} I'll drop a starter prompt you can edit.`,
        )
        onUsePrompt(STARTERS[intent.to])
        return
      case "other":
      default:
        push(
          "core",
          "Got it. I'll turn that into a starter prompt — tweak it, then hit Generate.",
        )
        onUsePrompt(userText)
        return
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = input.trim()
    if (!t) return
    push("user", t)
    setInput("")
    // Small delay so the reply feels intentional, not instant.
    window.setTimeout(() => respond(t), 220)
  }

  const CHIPS: { label: string; icon: typeof HelpCircle; send: string }[] = [
    { label: "How does this work?", icon: HelpCircle, send: "How does this work?" },
    { label: "I'm lost", icon: LifeBuoy, send: "I'm lost" },
    { label: "Build a map", icon: MapIcon, send: "Build a map" },
    { label: "Script a system", icon: Code, send: "Script a system" },
    { label: "Design a GUI", icon: LayoutPanelLeft, send: "Design a GUI" },
    { label: "3D model", icon: Box, send: "Make a 3D model" },
  ]

  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/60 frosted">
      {/* Ambient diffuse glow behind the panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl animate-pulse-soft"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl animate-pulse-soft"
      />

      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
            aria-hidden="true"
          >
            <Bot className="h-5 w-5" />
            <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-card" />
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base sm:text-lg">Core Intelligence</CardTitle>
            <CardDescription className="text-xs sm:text-sm leading-relaxed">
              Your coach inside SanityOS. Ask for guidance, request a starter
              prompt, or say &quot;I&apos;m lost&quot;.
            </CardDescription>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 border-accent/40 text-accent">
          Logic 65%
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Message log */}
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label="Core Intelligence conversation"
          className="flex max-h-64 min-h-32 flex-col gap-2 overflow-y-auto rounded-lg border border-border/60 bg-background/40 p-3"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex w-full animate-fade-in",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card/80 text-foreground border border-border/60",
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick-action chips */}
        <div className="stagger-in flex flex-wrap gap-2">
          {CHIPS.map((c) => {
            const Icon = c.icon
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => {
                  push("user", c.send)
                  window.setTimeout(() => respond(c.send), 180)
                }}
                className="hover-elastic inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <Icon className="h-3 w-3" aria-hidden="true" />
                {c.label}
              </button>
            )
          })}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <label htmlFor="core-input" className="sr-only">
            Message the Core
          </label>
          <Input
            id="core-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell the Core what you want to build..."
            className="bg-background/60"
          />
          <Button
            type="submit"
            disabled={!input.trim()}
            className="gap-2"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Send
          </Button>
        </form>

        {/* Improvement disclaimer */}
        <p className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
          <Sparkles
            className="mt-0.5 h-3 w-3 shrink-0 text-accent"
            aria-hidden="true"
          />
          <span>
            I&apos;m still learning the nuances of your creative style. My
            logic core is at 65% capacity — help me improve by giving specific
            feedback.
          </span>
        </p>
      </CardContent>
    </Card>
  )
}

const LABEL: Record<BuildType, string> = {
  map: "Map",
  script: "Script",
  gui: "GUI",
  "3d": "3D Model",
}

const STARTERS: Record<BuildType, string> = {
  map: "A foggy volcanic island with a winding coastal path and a lighthouse at the summit.",
  script: "A round-based system with a 60-second timer, team scoring, and a winner announcement screen.",
  gui: "An inventory panel with 5 category tabs, a search bar, and hover-to-preview tooltips.",
  "3d": "A low-poly medieval blacksmith shop with an anvil, hammer, and glowing forge.",
}

// Provide a Lightbulb re-export so the chip row keeps a consistent icon set
// even if you later swap chips around. (Not rendered by default.)
export const _CoreIcons = { Lightbulb }
