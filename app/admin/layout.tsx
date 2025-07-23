
import { Inter } from 'next/font/google'
import { AdminSessionProvider } from './_components/admin-session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CMS Admin - Advies N Consultancy BV',
  description: 'Content Management System voor Advies N Consultancy BV',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <AdminSessionProvider>
          {children}
        </AdminSessionProvider>
      </body>
    </html>
  )
}
