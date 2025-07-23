

'use client'

import { useEffect } from 'react'
import { registerServiceWorker, networkUtils } from '@/lib/pwa-utils'
import { toast } from '@/components/ui/use-toast'

export function PWAManager() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker()

    // Listen for network changes
    const cleanupNetworkListener = networkUtils.onNetworkChange((online) => {
      if (online) {
        toast({
          title: "Connection restored",
          description: "You're back online!",
          duration: 3000,
        })
      } else {
        toast({
          title: "You're offline",
          description: "Some features may not be available",
          variant: "destructive",
          duration: 5000,
        })
      }
    })

    // Cleanup on unmount
    return cleanupNetworkListener
  }, [])

  return null // This component doesn't render anything
}
