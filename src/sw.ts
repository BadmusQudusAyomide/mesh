/// <reference lib="webworker" />

// This is the custom Service Worker used by VitePWA (injectManifest)
// Precache will be injected into self.__WB_MANIFEST by the plugin at build time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any }

// Basic install/activate to take control quickly
self.addEventListener('install', (_event) => {
  self.skipWaiting()
})
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Handle incoming push messages
self.addEventListener('push', (event: PushEvent) => {
  let data: any = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'Mesh', body: event.data?.text?.() || 'You have a new notification' }
  }

  const title = data.title || 'Mesh'
  const body = data.body || 'You have a new notification'
  const icon = data.icon || '/icon-192x192.png'
  const badge = data.badge || '/icon-192x192.png'
  const tag = data.tag || 'mesh-alert'
  const url = data.url || '/alerts'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      data: { url },
    })
  )
})

// Focus/open the app when the user clicks the notification
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const targetUrl = (event.notification.data && (event.notification.data as any).url) || '/'

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const client of allClients) {
        const url = new URL(client.url)
        if (url.pathname === targetUrl) {
          ;(client as WindowClient).focus()
          return
        }
      }
      await self.clients.openWindow(targetUrl)
    })()
  )
})
