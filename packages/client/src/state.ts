import { atom } from 'nanostores'

export const $page = atom<number>(1)
export const $clicks = atom<number>(0)
export const $clicksTotal = atom<number>(0)

// Validation helpers
export function setPage(page: number) {
  if (page < 1) return
  $page.set(Math.floor(page))
}

export function setClicks(clicks: number) {
  if (clicks < 0) return
  $clicks.set(Math.floor(clicks))
}

export function setClicksTotal(total: number) {
  if (total < 0) return
  $clicksTotal.set(Math.floor(total))
}
