import { $page, $clicks, $timer, setPage, setClicks, setTimer } from './state'

const CHANNEL_NAME = 'slidastro'

export function initSync() {
  let isReceiving = false

  const syncStores = {
    page: [$page, setPage],
    clicks: [$clicks, setClicks],
    timer: [$timer, setTimer],
  } as const

  // 1. BroadcastChannel (same-origin tabs)
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CHANNEL_NAME)

    for (const [key, [store, setter]] of Object.entries(syncStores)) {
      store.listen((value) => {
        if (isReceiving) return
        channel.postMessage({ type: key, value })
      })
    }

    // Listen for changes from other tabs
    channel.onmessage = (event) => {
      const { type, value } = event.data
      if (syncStores[type as keyof typeof syncStores]) {
        isReceiving = true
        try {
          // @ts-ignore
          syncStores[type][1](value)
        } finally {
          isReceiving = false
        }
      }
    }
  }

  // 2. WebSocket Relay (Vite HMR channel for cross-network sync)
  // @ts-ignore
  if (import.meta.hot) {
    for (const [key, [store, setter]] of Object.entries(syncStores)) {
      store.listen((value) => {
        if (isReceiving) return
        // @ts-ignore
        import.meta.hot.send('slidastro:sync', { type: key, value })
      })
    }

    // @ts-ignore
    import.meta.hot.on('slidastro:sync', ({ type, value }) => {
      if (syncStores[type as keyof typeof syncStores]) {
        isReceiving = true
        try {
          // @ts-ignore
          syncStores[type][1](value)
        } finally {
          isReceiving = false
        }
      }
    })
  }
}
