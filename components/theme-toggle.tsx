

'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 px-0"
        aria-label={t('a11y.toggleTheme', 'Toggle between light and dark theme')}
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">{t('a11y.toggleTheme', 'Toggle theme')}</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 px-0"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={t('a11y.toggleTheme', 'Toggle between light and dark theme')}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">{t('a11y.toggleTheme', 'Toggle theme')}</span>
    </Button>
  )
}
