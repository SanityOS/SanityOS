"use client"

import * as React from "react"
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  LockOpen,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Bell,
  Timer,
  Fingerprint,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const SETTINGS_KEY = "sanityos:security:v1"

type Settings = {
  pinHash: string | null
  recoveryCode: string | null
  loginAlerts: boolean
  autoLock: boolean
  autoLockMinutes: number
  biometricHint: boolean
  lastChangedAt: number | null
}

const DEFAULTS: Settings = {
  pinHash: null,
  recoveryCode: null,
  loginAlerts: true,
  autoLock: true,
  autoLockMinutes: 15,
  biometricHint: false,
  lastChangedAt: null,
}

async function sha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input)
  const buf = await crypto.subtle.digest("SHA-256", encoded)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULTS
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw)
    return { ...DEFAULTS, ...parsed }
  } catch {
    return DEFAULTS
  }
}

function saveSettings(s: Settings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {}
}

function generateRecoveryCode() {
  // 4 groups of 4 uppercase alphanumerics, minus ambiguous chars.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length])
  return [
    chars.slice(0, 4).join(""),
    chars.slice(4, 8).join(""),
    chars.slice(8, 12).join(""),
    chars.slice(12, 16).join(""),
  ].join("-")
}

function scorePin(pin: string): { score: number; label: string; tone: "low" | "mid" | "high" } {
  if (!pin) return { score: 0, label: "Empty", tone: "low" }
  let score = 0
  if (pin.length >= 4) score += 1
  if (pin.length >= 6) score += 1
  if (/[a-z]/.test(pin) && /[A-Z]/.test(pin)) score += 1
  if (/\d/.test(pin)) score += 1
  if (/[^A-Za-z0-9]/.test(pin)) score += 1
  if (/^(\d)\1+$/.test(pin)) score = Math.min(score, 1)
  if (/^1234|0000|1111|abcd|qwer/i.test(pin)) score = Math.min(score, 1)
  const tone = score <= 1 ? "low" : score <= 3 ? "mid" : "high"
  const label =
    score <= 1 ? "Weak" : score === 2 ? "Okay" : score === 3 ? "Strong" : "Excellent"
  return { score: Math.min(score, 5), label, tone }
}

export function AccountSecurity() {
  const [settings, setSettings] = React.useState<Settings>(DEFAULTS)
  const [hydrated, setHydrated] = React.useState(false)

  // PIN form state
  const [pin, setPin] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [showPin, setShowPin] = React.useState(false)
  const [currentPin, setCurrentPin] = React.useState("")
  const [formMsg, setFormMsg] = React.useState<
    { tone: "ok" | "err"; text: string } | null
  >(null)
  const [busy, setBusy] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    setSettings(loadSettings())
    setHydrated(true)
  }, [])

  function update(patch: Partial<Settings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }

  async function handleSetPin(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setFormMsg(null)
    setBusy(true)
    try {
      if (settings.pinHash) {
        const currentHash = await sha256(currentPin)
        if (currentHash !== settings.pinHash) {
          setFormMsg({ tone: "err", text: "Current PIN is incorrect." })
          return
        }
      }
      if (pin.length < 4) {
        setFormMsg({ tone: "err", text: "PIN must be at least 4 characters." })
        return
      }
      if (pin !== confirm) {
        setFormMsg({ tone: "err", text: "New PIN and confirmation don't match." })
        return
      }
      const pinHash = await sha256(pin)
      const recoveryCode = settings.recoveryCode ?? generateRecoveryCode()
      const next: Settings = {
        ...settings,
        pinHash,
        recoveryCode,
        lastChangedAt: Date.now(),
      }
      setSettings(next)
      saveSettings(next)
      setPin("")
      setConfirm("")
      setCurrentPin("")
      setFormMsg({ tone: "ok", text: "PIN saved. Recovery code issued below." })
    } finally {
      setBusy(false)
    }
  }

  function handleRemovePin() {
    update({ pinHash: null, recoveryCode: null, lastChangedAt: Date.now() })
    setFormMsg({ tone: "ok", text: "PIN removed from this device." })
  }

  function handleRegenRecovery() {
    update({ recoveryCode: generateRecoveryCode(), lastChangedAt: Date.now() })
  }

  async function handleCopyRecovery() {
    if (!settings.recoveryCode) return
    try {
      await navigator.clipboard.writeText(settings.recoveryCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const pinScore = scorePin(pin)
  const strongCount =
    Number(Boolean(settings.pinHash)) +
    Number(settings.loginAlerts) +
    Number(settings.autoLock) +
    Number(settings.biometricHint)
  const maxCount = 4
  const pct = Math.round((strongCount / maxCount) * 100)
  const shieldTone =
    pct >= 75 ? "text-primary" : pct >= 50 ? "text-accent" : "text-destructive"

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Account &amp; Security
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          High Guard protects this workspace on this device. Your PIN is hashed
          with SHA-256 before being stored.
        </p>
      </header>

      {/* Protection score */}
      <Card className="border-border/60 frosted">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-background/60 ring-1 ring-border/60",
              shieldTone,
            )}
            data-glow={pct >= 75 ? "true" : undefined}
          >
            {pct >= 75 ? (
              <ShieldCheck className="h-7 w-7" aria-hidden="true" />
            ) : (
              <ShieldAlert className="h-7 w-7" aria-hidden="true" />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Protection level</h2>
              <span className="text-sm tabular-nums text-muted-foreground">
                {strongCount}/{maxCount} enabled
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Protection level"
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  pct >= 75
                    ? "bg-primary"
                    : pct >= 50
                      ? "bg-accent"
                      : "bg-destructive",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {pct >= 75
                ? "Your workspace is well-protected."
                : pct >= 50
                  ? "Good start — turn on a PIN and alerts for full coverage."
                  : "Set a PIN and enable alerts to raise your shield."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* PIN setup */}
      <Card className="border-border/60 frosted">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg sm:text-xl">
                Workspace PIN
              </CardTitle>
              <CardDescription className="leading-relaxed">
                A PIN locks this workspace on this device. Stored as a hash
                only; we never keep the plain value.
              </CardDescription>
            </div>
            <div className="ml-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-medium">
              {settings.pinHash ? (
                <>
                  <Lock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <LockOpen
                    className="h-3.5 w-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>Not set</span>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetPin} className="flex flex-col gap-4">
            {settings.pinHash && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="sec-current">Current PIN</Label>
                <Input
                  id="sec-current"
                  type={showPin ? "text" : "password"}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  autoComplete="current-password"
                  className="bg-background/60"
                  required
                />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="sec-pin">
                  {settings.pinHash ? "New PIN" : "Set PIN"}
                </Label>
                <div className="relative">
                  <Input
                    id="sec-pin"
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    autoComplete="new-password"
                    minLength={4}
                    className="bg-background/60 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((v) => !v)}
                    aria-label={showPin ? "Hide PIN" : "Show PIN"}
                    className="absolute inset-y-0 right-2 my-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {showPin ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {pin && (
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
                      aria-hidden="true"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={cn(
                            "flex-1 transition-colors",
                            n <= pinScore.score
                              ? pinScore.tone === "low"
                                ? "bg-destructive"
                                : pinScore.tone === "mid"
                                  ? "bg-accent"
                                  : "bg-primary"
                              : "bg-transparent",
                          )}
                        />
                      ))}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium tabular-nums",
                        pinScore.tone === "low"
                          ? "text-destructive"
                          : pinScore.tone === "mid"
                            ? "text-accent"
                            : "text-primary",
                      )}
                      aria-live="polite"
                    >
                      {pinScore.label}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="sec-confirm">Confirm PIN</Label>
                <Input
                  id="sec-confirm"
                  type={showPin ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  minLength={4}
                  className="bg-background/60"
                  required
                />
              </div>
            </div>

            {formMsg && (
              <div
                role="status"
                className={cn(
                  "rounded-md border px-3 py-2 text-sm animate-fade-in",
                  formMsg.tone === "ok"
                    ? "border-primary/40 bg-primary/10"
                    : "border-destructive/40 bg-destructive/10",
                )}
              >
                {formMsg.text}
              </div>
            )}

            <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {settings.lastChangedAt
                  ? `Last changed ${new Date(settings.lastChangedAt).toLocaleString()}`
                  : "Never changed on this device."}
              </p>
              <div className="flex items-center gap-2">
                {settings.pinHash && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemovePin}
                  >
                    Remove PIN
                  </Button>
                )}
                <Button type="submit" disabled={busy} className="gap-2">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  {settings.pinHash ? "Update PIN" : "Set PIN"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recovery code */}
      {settings.recoveryCode && (
        <Card className="border-border/60 frosted">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent">
                <Fingerprint className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-lg sm:text-xl">
                  Recovery code
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  Save this offline. It can unlock the workspace if you forget
                  your PIN.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 rounded-lg border border-dashed border-border/60 bg-background/60 px-4 py-3 text-center font-mono text-base tracking-[0.2em]">
                {settings.recoveryCode}
              </code>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyRecovery}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleRegenRecovery}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Rotate
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Rotating invalidates the previous code.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Guards */}
      <Card className="border-border/60 frosted">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">High Guard</CardTitle>
          <CardDescription>
            Extra layers on top of your PIN.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <GuardRow
            icon={<Bell className="h-5 w-5" aria-hidden="true" />}
            title="Login alerts"
            description="Notify in this workspace when a new session starts."
            checked={hydrated && settings.loginAlerts}
            onChange={(v) => update({ loginAlerts: v })}
          />
          <GuardRow
            icon={<Timer className="h-5 w-5" aria-hidden="true" />}
            title="Auto-lock"
            description={`Lock after ${settings.autoLockMinutes} minutes of inactivity.`}
            checked={hydrated && settings.autoLock}
            onChange={(v) => update({ autoLock: v })}
          />
          <GuardRow
            icon={<Fingerprint className="h-5 w-5" aria-hidden="true" />}
            title="Biometric hint"
            description="Prompt for device biometrics when available."
            checked={hydrated && settings.biometricHint}
            onChange={(v) => update({ biometricHint: v })}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function GuardRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  const id = React.useId()
  return (
    <div className="flex items-start gap-3 border-b border-border/60 py-4 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
          {title}
        </Label>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-label={title}
      />
    </div>
  )
}
