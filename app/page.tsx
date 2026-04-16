"use client"

import { useState } from "react"
import { Menu, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { HomePanel } from "@/components/home-panel"
import { AIBuilder } from "@/components/ai-builder"
import { AIRouter } from "@/components/ai-router"
import { MusicPlayer } from "@/components/music-player"
import { AppSidebar, type View } from "@/components/app-sidebar"
import { MusicProvider } from "@/components/music-context"
import { CreditsProvider } from "@/components/credits-context"
import { MiniPlayer } from "@/components/mini-player"
import { CornerFlames } from "@/components/corner-flames"
import { ParticleField } from "@/components/particle-field"

export default function Page() {
  const [view, setView] = useState<View>("home")
  const [ultra, setUltra] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleChangeView(v: View) {
    setView(v)
    setMobileOpen(false)
  }

  return (
    <CreditsProvider>
     <MusicProvider>
      <div className={cn("relative min-h-svh w-full overflow-hidden", ultra && "ultra-mode")}>
        <ParticleField />
        <CornerFlames ultra={ultra} />
        <div className="relative z-10 flex min-h-svh w-full">
          {/* Desktop sidebar */}
          <aside
            aria-label="Primary navigation"
            className="sticky top-0 hidden h-svh w-64 shrink-0 border-r border-border/60 bg-card/80 backdrop-blur-xl md:block"
          >
            <AppSidebar
              view={view}
              onChangeView={handleChangeView}
              ultra={ultra}
              onToggleUltra={setUltra}
            />
          </aside>

          {/* Main column */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Mobile top bar */}
            <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur md:hidden">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Zap className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="text-sm font-semibold tracking-tight">
                  SanityOS
                </span>
              </div>
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Open navigation"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-72 border-border/60 bg-card p-0"
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <AppSidebar
                    view={view}
                    onChangeView={handleChangeView}
                    ultra={ultra}
                    onToggleUltra={setUltra}
                  />
                </SheetContent>
              </Sheet>
            </header>

            {/* Scrollable content */}
            <main className="min-w-0 flex-1">
              <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                <div key={view} className="animate-fade-in">
                  {view === "home" && (
                    <HomePanel onNavigate={handleChangeView} ultra={ultra} />
                  )}
                  {view === "ai" && <AIBuilder />}
                  {view === "router" && <AIRouter />}
                  {view === "music" && <MusicPlayer />}
                </div>
              </div>
            </main>

            {/* Persistent mini player — stays mounted so audio never restarts */}
            <MiniPlayer />
          </div>
        </div>
      </div>
     </MusicProvider>
    </CreditsProvider>
  )
}
