

'use client'

// Service Worker registration
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      console.log('Service Worker registered successfully:', registration)
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              showUpdateAvailable()
            }
          })
        }
      })
      
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }
  return null
}

// Show update notification
function showUpdateAvailable() {
  if (confirm('A new version is available. Would you like to reload to update?')) {
    window.location.reload()
  }
}

// Cache management utilities
export const cacheUtils = {
  // Add item to cache
  async addToCache(cacheName: string, request: string | Request, response: Response) {
    try {
      const cache = await caches.open(cacheName)
      await cache.put(request, response)
    } catch (error) {
      console.error('Error adding to cache:', error)
    }
  },

  // Get item from cache
  async getFromCache(request: string | Request): Promise<Response | undefined> {
    try {
      return await caches.match(request)
    } catch (error) {
      console.error('Error getting from cache:', error)
      return undefined
    }
  },

  // Clear specific cache
  async clearCache(cacheName: string) {
    try {
      await caches.delete(cacheName)
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  },

  // Get cache size info
  async getCacheInfo() {
    try {
      const cacheNames = await caches.keys()
      const info = []
      
      for (const name of cacheNames) {
        const cache = await caches.open(name)
        const keys = await cache.keys()
        info.push({
          name,
          size: keys.length
        })
      }
      
      return info
    } catch (error) {
      console.error('Error getting cache info:', error)
      return []
    }
  }
}

// Offline form submission handler
export async function handleOfflineFormSubmission(formData: any, endpoint: string) {
  try {
    // Try to submit immediately
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    
    if (response.ok) {
      return { success: true, offline: false }
    }
    
    throw new Error('Network request failed')
  } catch (error) {
    // Store for background sync
    try {
      const db = await openOfflineDB()
      const tx = db.transaction(['pending-forms'], 'readwrite')
      const store = tx.objectStore('pending-forms')
      
      await store.add({
        data: formData,
        endpoint,
        timestamp: Date.now()
      })
      
      // Register background sync if available
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        if ('sync' in registration) {
          await (registration as any).sync.register('contact-form')
        }
      }
      
      return { success: true, offline: true }
    } catch (dbError) {
      console.error('Error storing offline form:', dbError)
      return { success: false, offline: true, error: dbError }
    }
  }
}

// IndexedDB utilities
function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('anc-offline', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      if (!db.objectStoreNames.contains('pending-forms')) {
        db.createObjectStore('pending-forms', { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

// Network status utilities
export const networkUtils = {
  // Check if online
  isOnline(): boolean {
    return navigator.onLine
  },

  // Listen for network changes
  onNetworkChange(callback: (online: boolean) => void) {
    const handleOnline = () => callback(true)
    const handleOffline = () => callback(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }
}

// Performance utilities for PWA
export const performanceUtils = {
  // Preload critical resources
  async preloadCriticalResources(urls: string[]) {
    const promises = urls.map(url => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = url
      document.head.appendChild(link)
      
      return fetch(url).catch(console.warn)
    })
    
    await Promise.allSettled(promises)
  },

  // Lazy load non-critical resources
  lazyLoadResource(url: string, type: 'script' | 'style' = 'script') {
    return new Promise((resolve, reject) => {
      const element = type === 'script' 
        ? document.createElement('script')
        : document.createElement('link')
      
      element.onload = resolve
      element.onerror = reject
      
      if (type === 'script') {
        const scriptElement = element as HTMLScriptElement
        scriptElement.src = url
        scriptElement.async = true
      } else {
        const linkElement = element as HTMLLinkElement
        linkElement.href = url
        linkElement.rel = 'stylesheet'
      }
      
      document.head.appendChild(element)
    })
  }
}
