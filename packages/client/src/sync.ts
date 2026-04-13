import { $page, $clicks, $timer, $drawings, setPage, setClicks, setTimer } from './state'

const CHANNEL_NAME = 'slidastro'

export function initSync() {
  let isReceiving = false

  const syncStores = {
    page: [$page, setPage],
    clicks: [$clicks, setClicks],
    timer: [$timer, setTimer],
    drawings: [$drawings, (v: any) => $drawings.set(v)],
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

    // Generic sync for drawings etc
    window.addEventListener('slidastro:sync', (e: any) => {
      if (isReceiving) return
      channel.postMessage(e.detail)
    })

    // Listen for changes from other tabs
    channel.onmessage = (event) => {
      const { type, value, ...rest } = event.data
      if (syncStores[type as keyof typeof syncStores]) {
        isReceiving = true
        try {
          // @ts-ignore
          syncStores[type][1](value)
        } finally {
          isReceiving = false
        }
      } else {
        // Broadcast custom events to components
        window.dispatchEvent(new CustomEvent('slidastro:sync-received', { detail: event.data }))
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

    // Generic sync for drawings etc
    window.addEventListener('slidastro:sync', (e: any) => {
      if (isReceiving) return
      // @ts-ignore
      import.meta.hot.send('slidastro:sync', e.detail)
    })

    // @ts-ignore
    import.meta.hot.on('slidastro:sync', (data) => {
      const { type, value } = data
      if (syncStores[type as keyof typeof syncStores]) {
        isReceiving = true
        try {
          // @ts-ignore
          syncStores[type][1](value)
        } finally {
          isReceiving = false
        }
      } else {
        // Broadcast custom events to components
        window.dispatchEvent(new CustomEvent('slidastro:sync-received', { detail: data }))
      }
    })
  }
}
