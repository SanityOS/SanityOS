"use client"

import { useMemo, useState } from "react"
import {
  Plug,
  Copy,
  Check,
  Circle,
  ArrowRight,
  Map,
  Code,
  LayoutPanelLeft,
  Box,
  Loader2,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type RouteId = "map" | "script" | "gui" | "model"

const ROUTES: { id: RouteId; label: string; hint: string; icon: typeof Map }[] =
  [
    { id: "map", label: "Map", hint: "Terrain + worldgen", icon: Map },
    { id: "script", label: "Script", hint: "Server / client Lua", icon: Code },
    { id: "gui", label: "GUI", hint: "ScreenGui layouts", icon: LayoutPanelLeft },
    { id: "model", label: "Model", hint: "3D primitives", icon: Box },
  ]

function buildLuaPlugin(endpoint: string, apiKey: string) {
  return `-- SanityOS AI Router Plugin for Roblox Studio
-- Paste into a Script inside your Plugins folder, then "Save as Local Plugin".

local HttpService = game:GetService("HttpService")

local ENDPOINT = "${endpoint}"
local API_KEY  = "${apiKey}"

local toolbar = plugin:CreateToolbar("SanityOS")
local button = toolbar:CreateButton(
    "AI Router",
    "Send a prompt to SanityOS and insert the result",
    "rbxassetid://0"
)

local function request(routeType, prompt)
    local body = HttpService:JSONEncode({ type = routeType, prompt = prompt })
    local ok, response = pcall(function()
        return HttpService:PostAsync(
            ENDPOINT,
            body,
            Enum.HttpContentType.ApplicationJson,
            false,
            { ["x-sanityos-key"] = API_KEY }
        )
    end)
    if not ok then
        warn("[SanityOS] request failed:", response)
        return nil
    end
    return HttpService:JSONDecode(response)
end

button.Click:Connect(function()
    local result = request("script", "A welcome message for new players")
    if result and result.output then
        print("[SanityOS]", result.route)
        print(result.output)
    end
end)`
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }
  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      onClick={handleCopy}
      className="gap-2"
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {copied ? "Copied" : "Copy"}
    </Button>
  )
}

export function AIRouter() {
  const [endpoint, setEndpoint] = useState("/api/roblox")
  const [apiKey] = useState("sk_demo_" + Math.random().toString(36).slice(2, 10))
  const [route, setRoute] = useState<RouteId>("script")
  const [prompt, setPrompt] = useState("A welcome message for new players")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    ok: boolean
    route?: string
    output?: string
    error?: string
  } | null>(null)

  const luaPlugin = useMemo(
    () => buildLuaPlugin(endpoint, apiKey),
    [endpoint, apiKey],
  )

  async function handleTest() {
    if (!prompt.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: route, prompt }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        route?: string
        output?: string
        error?: string
      }
      setResult({
        ok: Boolean(data.ok),
        route: data.route,
        output: data.output,
        error: data.error,
      })
    } catch (err) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : "Request failed",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            AI Router
          </h1>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed sm:text-base">
          A plugin bridge between Roblox Studio and SanityOS. Install the Lua
          plugin, point it at your endpoint, and prompts route to the right
          generator.
        </p>
      </header>

      {/* Connection panel */}
      <Card className="border-border/60 bg-card/70 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base">Connection</CardTitle>
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Circle
              className="h-2 w-2 fill-primary text-primary"
              aria-hidden="true"
            />
            Online
          </span>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="router-endpoint">Endpoint URL</Label>
            <div className="flex gap-2">
              <Input
                id="router-endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                spellCheck={false}
                className="bg-background/60 font-mono text-xs"
              />
              <CopyButton value={endpoint} label="endpoint" />
            </div>
            <p className="text-xs text-muted-foreground">
              Replace with your deployed URL, e.g.{" "}
              <span className="font-mono">
                https://your-app.vercel.app/api/roblox
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="router-key">API key</Label>
            <div className="flex gap-2">
              <Input
                id="router-key"
                value={apiKey}
                readOnly
                spellCheck={false}
                className="bg-background/60 font-mono text-xs"
              />
              <CopyButton value={apiKey} label="API key" />
            </div>
            <p className="text-xs text-muted-foreground">
              Demo key regenerated per session.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Route map */}
      <Card className="border-border/60 bg-card/70 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base">Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {ROUTES.map((r) => {
              const Icon = r.icon
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-foreground">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium">{r.label}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {r.hint}
                    </span>
                  </div>
                  <code className="rounded bg-background/60 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                    type: &quot;{r.id}&quot;
                  </code>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Install plugin */}
      <Card className="border-border/60 bg-card/70 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base">Roblox Studio plugin</CardTitle>
          <CopyButton value={luaPlugin} label="Lua plugin" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ol className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">
                1
              </span>
              Open Roblox Studio and enable{" "}
              <span className="font-medium text-foreground">
                HTTP Requests
              </span>{" "}
              in Game Settings &rarr; Security.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">
                2
              </span>
              Create a new Script, paste the code, then right-click and pick{" "}
              <span className="font-medium text-foreground">
                Save as Local Plugin
              </span>
              .
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">
                3
              </span>
              Click the SanityOS toolbar button to route a prompt to your
              endpoint.
            </li>
          </ol>

          <pre
            className="max-h-96 overflow-auto rounded-lg border border-border/60 bg-background/80 p-4 font-mono text-xs leading-relaxed"
            aria-label="Lua plugin source"
          >
            <code>{luaPlugin}</code>
          </pre>
        </CardContent>
      </Card>

      {/* Test request */}
      <Card className="border-border/60 bg-card/70 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base">Test request</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div
            role="radiogroup"
            aria-label="Route"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {ROUTES.map((r) => {
              const Icon = r.icon
              const active = route === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setRoute(r.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border/60 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {r.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="router-prompt">Prompt</Label>
            <Textarea
              id="router-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-24 resize-y bg-background/60"
              placeholder="Describe what the plugin should build..."
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              POST{" "}
              <code className="rounded bg-background/60 px-1.5 py-0.5 font-mono">
                {endpoint}
              </code>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
              <code className="rounded bg-background/60 px-1.5 py-0.5 font-mono">
                type: {route}
              </code>
            </p>
            <Button
              type="button"
              onClick={handleTest}
              disabled={!prompt.trim() || loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              {loading ? "Routing..." : "Send"}
            </Button>
          </div>

          {result && (
            <div
              className={cn(
                "rounded-lg border p-4 animate-fade-in",
                result.ok
                  ? "border-border/60 bg-background/40"
                  : "border-destructive/40 bg-destructive/10",
              )}
            >
              {result.ok ? (
                <>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Routed to{" "}
                    <span className="font-medium text-foreground">
                      {result.route}
                    </span>
                  </p>
                  <pre className="overflow-auto font-mono text-xs leading-relaxed">
                    <code>{result.output}</code>
                  </pre>
                </>
              ) : (
                <p className="text-sm text-destructive-foreground">
                  {result.error ?? "Request failed"}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
