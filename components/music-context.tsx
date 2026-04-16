"use client"

import * as React from "react"

export type Track = {
  id: string
  name: string
  genre: string
  src: string
}

export const TRACKS: Track[] = [
  {
    id: "t1",
    name: "Calm Ambient",
    genre: "Ambient",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "t2",
    name: "Rock Energy",
    genre: "Rock",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "t3",
    name: "Chill LoFi",
    genre: "LoFi",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "t4",
    name: "Dark Pulse",
    genre: "Electronic",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: "t5",
    name: "Dream Mode",
    genre: "Synthwave",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
  {
    id: "t6",
    name: "Storm Energy",
    genre: "Cinematic",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
  {
    id: "t7",
    name: "Neon Drive",
    genre: "Synthwave",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  },
  {
    id: "t8",
    name: "Midnight Focus",
    genre: "LoFi",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  },
  {
    id: "t9",
    name: "Heaven Echo",
    genre: "Ambient",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
  },
  {
    id: "t10",
    name: "Fire Beat",
    genre: "Electronic",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
  },
  {
    id: "t11",
    name: "Rage Rockstar",
    genre: "Rock",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
  },
  {
    id: "t12",
    name: "Brain Calm",
    genre: "Ambient",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
  },
]

type MusicContextValue = {
  tracks: Track[]
  current: Track | null
  playing: boolean
  progress: number
  duration: number
  volume: number
  playTrack: (track: Track) => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  seek: (seconds: number) => void
  setVolume: (v: number) => void
}

const MusicContext = React.createContext<MusicContextValue | null>(null)

export function useMusic() {
  const ctx = React.useContext(MusicContext)
  if (!ctx) throw new Error("useMusic must be used inside MusicProvider")
  return ctx
}

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [current, setCurrent] = React.useState<Track | null>(null)
  const [playing, setPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [volume, setVolumeState] = React.useState(0.8)

  // Stable ref to the latest "next" handler so the one-time audio effect's
  // onEnded callback always invokes the up-to-date version with the current
  // track in scope. Fixes a bug where auto-advance stopped after one track.
  const goNextRef = React.useRef<() => void>(() => {})

  // Lazily create the audio element on the client so it survives view switches.
  React.useEffect(() => {
    if (audioRef.current) return
    const audio = new Audio()
    audio.preload = "metadata"
    audio.volume = volume
    audioRef.current = audio

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTime = () => setProgress(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 0)
    const onEnded = () => {
      setPlaying(false)
      goNextRef.current()
    }

    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("timeupdate", onTime)
    audio.addEventListener("loadedmetadata", onMeta)
    audio.addEventListener("ended", onEnded)

    return () => {
      audio.pause()
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("timeupdate", onTime)
      audio.removeEventListener("loadedmetadata", onMeta)
      audio.removeEventListener("ended", onEnded)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const playTrack = React.useCallback((track: Track) => {
    const audio = audioRef.current
    if (!audio) return
    if (current?.id === track.id) {
      if (audio.paused) void audio.play()
      else audio.pause()
      return
    }
    setCurrent(track)
    audio.src = track.src
    audio.currentTime = 0
    void audio.play()
  }, [current])

  const togglePlay = React.useCallback(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    if (audio.paused) void audio.play()
    else audio.pause()
  }, [current])

  const goNext = React.useCallback(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    const i = TRACKS.findIndex((t) => t.id === current.id)
    const nextTrack = TRACKS[(i + 1) % TRACKS.length]
    setCurrent(nextTrack)
    audio.src = nextTrack.src
    audio.currentTime = 0
    void audio.play()
  }, [current])

  const goPrev = React.useCallback(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    const i = TRACKS.findIndex((t) => t.id === current.id)
    const prevTrack = TRACKS[(i - 1 + TRACKS.length) % TRACKS.length]
    setCurrent(prevTrack)
    audio.src = prevTrack.src
    audio.currentTime = 0
    void audio.play()
  }, [current])

  // Keep the ref pointing at the latest goNext so the `ended` listener
  // (registered once) always auto-advances with fresh state.
  React.useEffect(() => {
    goNextRef.current = goNext
  }, [goNext])

  const seek = React.useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = seconds
    setProgress(seconds)
  }, [])

  const setVolume = React.useCallback((v: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = v
    setVolumeState(v)
  }, [])

  const value: MusicContextValue = {
    tracks: TRACKS,
    current,
    playing,
    progress,
    duration,
    volume,
    playTrack,
    togglePlay,
    next: goNext,
    previous: goPrev,
    seek,
    setVolume,
  }

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}
