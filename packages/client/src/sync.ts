import { $page, $clicks, setPage, setClicks } from './state'

const CHANNEL_NAME = 'slidastro'

export function initSync() {
  if (typeof BroadcastChannel === 'undefined') return

  const channel = new BroadcastChannel(CHANNEL_NAME)
  let isReceiving = false

  // Broadcast changes from local stores
  $page.listen((value) => {
    if (isReceiving) return
    channel.postMessage({ type: 'page', value })
  })

  $clicks.listen((value) => {
    if (isReceiving) return
    channel.postMessage({ type: 'clicks', value })
  })

  // Listen for changes from other tabs
  channel.onmessage = (event) => {
    const { type, value } = event.data
    isReceiving = true

    try {
      if (type === 'page') {
        setPage(value)
      } else if (type === 'clicks') {
        setClicks(value)
      }
    } finally {
      isReceiving = false
    }
  }

  return channel
}
