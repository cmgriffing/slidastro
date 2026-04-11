import { atom } from 'nanostores'

export interface TimerState {
  status: 'stopped' | 'running' | 'paused'
  elapsed: number
  slideElapsed: number
  lastStarted: number
}

export const $page = atom<number>(1)
export const $clicks = atom<number>(0)
export const $clicksTotal = atom<number>(0)

const defaultTimer: TimerState = {
  status: 'stopped',
  elapsed: 0,
  slideElapsed: 0,
  lastStarted: 0,
}

// Load from localStorage if available
const savedElapsed = typeof localStorage !== 'undefined'
  ? Number(localStorage.getItem('slidastro-elapsed')) || 0
  : 0

export const $timer = atom<TimerState>({
  ...defaultTimer,
  elapsed: savedElapsed,
})

// Timer actions
export function resetSlideTimer() {
  const current = $timer.get()
  if (current.status === 'running') {
    const now = Date.now()
    const delta = now - current.lastStarted
    $timer.set({
      ...current,
      elapsed: current.elapsed + delta,
      slideElapsed: 0,
      lastStarted: now,
    })
  } else {
    $timer.set({
      ...current,
      slideElapsed: 0,
    })
  }
}

// Validation helpers
export function setPage(page: number) {
  if (page < 1) return
  const oldPage = $page.get()
  const newPage = Math.floor(page)
  if (oldPage !== newPage) {
    $page.set(newPage)
    resetSlideTimer()
  }
}

export function setClicks(clicks: number) {
  if (clicks < 0) return
  $clicks.set(Math.floor(clicks))
}

export function setClicksTotal(total: number) {
  if (total < 0) return
  $clicksTotal.set(Math.floor(total))
}

// Timer actions
export function startTimer() {
  const current = $timer.get()
  if (current.status === 'running') return
  $timer.set({
    ...current,
    status: 'running',
    lastStarted: Date.now(),
  })
}

export function pauseTimer() {
  const current = $timer.get()
  if (current.status !== 'running') return
  const now = Date.now()
  const delta = now - current.lastStarted
  const newElapsed = current.elapsed + delta
  const newSlideElapsed = current.slideElapsed + delta
  $timer.set({
    ...current,
    status: 'paused',
    elapsed: newElapsed,
    slideElapsed: newSlideElapsed,
    lastStarted: 0,
  })
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('slidastro-elapsed', String(newElapsed))
  }
}

export function resetTimer() {
  $timer.set(defaultTimer)
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('slidastro-elapsed')
  }
}

export function setTimer(state: TimerState) {
  $timer.set(state)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('slidastro-elapsed', String(state.elapsed))
  }
}
