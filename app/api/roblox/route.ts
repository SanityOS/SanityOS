import { NextResponse } from "next/server"

type BuildType = "map" | "script" | "gui" | "model"

interface RouterPayload {
  type?: BuildType | string
  prompt?: string
}

const ROUTES: Record<BuildType, { label: string; hint: string }> = {
  map: { label: "Map", hint: "Terrain and world layout" },
  script: { label: "Script", hint: "Server or client Lua code" },
  gui: { label: "GUI", hint: "ScreenGui layouts" },
  model: { label: "Model", hint: "3D primitives and meshes" },
}

function isValidType(t: unknown): t is BuildType {
  return typeof t === "string" && t in ROUTES
}

function demoLuaForType(type: BuildType, prompt: string): string {
  const safePrompt = prompt.replace(/"/g, '\\"').slice(0, 120)
  switch (type) {
    case "script":
      return [
        `-- SanityOS generated script`,
        `-- Prompt: ${safePrompt}`,
        `local Players = game:GetService("Players")`,
        `Players.PlayerAdded:Connect(function(player)`,
        `    print("Welcome,", player.Name)`,
        `end)`,
      ].join("\n")
    case "map":
      return [
        `-- SanityOS generated map seed`,
        `-- Prompt: ${safePrompt}`,
        `local Terrain = workspace.Terrain`,
        `Terrain:FillBlock(CFrame.new(0,0,0), Vector3.new(512,4,512), Enum.Material.Grass)`,
      ].join("\n")
    case "gui":
      return [
        `-- SanityOS generated GUI`,
        `-- Prompt: ${safePrompt}`,
        `local gui = Instance.new("ScreenGui")`,
        `local label = Instance.new("TextLabel", gui)`,
        `label.Size = UDim2.fromOffset(240, 48)`,
        `label.Text = "SanityOS"`,
        `gui.Parent = game:GetService("StarterGui")`,
      ].join("\n")
    case "model":
      return [
        `-- SanityOS generated model`,
        `-- Prompt: ${safePrompt}`,
        `local part = Instance.new("Part")`,
        `part.Size = Vector3.new(8,8,8)`,
        `part.Anchored = true`,
        `part.Parent = workspace`,
      ].join("\n")
  }
}

export async function GET() {
  return NextResponse.json({
    service: "SanityOS AI Router",
    version: "0.1.0",
    routes: Object.entries(ROUTES).map(([id, r]) => ({ id, ...r })),
  })
}

export async function POST(request: Request) {
  let body: RouterPayload
  try {
    body = (await request.json()) as RouterPayload
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    )
  }

  const { type, prompt } = body

  if (!isValidType(type)) {
    return NextResponse.json(
      {
        error: "Unknown route type",
        allowed: Object.keys(ROUTES),
      },
      { status: 400 },
    )
  }
  if (typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json(
      { error: "Missing prompt" },
      { status: 400 },
    )
  }

  return NextResponse.json({
    ok: true,
    route: type,
    label: ROUTES[type].label,
    output: demoLuaForType(type, prompt),
    note: "Demo response. Wire this to an LLM for real generation.",
  })
}
