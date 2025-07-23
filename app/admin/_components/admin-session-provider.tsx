
'use client'

import { SessionProvider } from 'next-auth/react'
import { AdminLayoutClient } from './admin-layout-client'

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </SessionProvider>
  )
}
