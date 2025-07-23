

'use client'

import { useState, useEffect } from 'react'

interface ImageOptimizationOptions {
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'avif'
  width?: number
  height?: number
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  sizes?: string
}

export class ImageOptimizer {
  private static cache: Map<string, string> = new Map()
  private static observer: IntersectionObserver | null = null

  static initLazyLoading(): void {
    if (typeof window === 'undefined' || this.observer) return

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.classList.remove('opacity-0')
              img.classList.add('opacity-100')
              this.observer?.unobserve(img)
            }
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    )
  }

  static optimizeImageUrl(src: string, options: ImageOptimizationOptions = {}): string {
    const cacheKey = `${src}_${JSON.stringify(options)}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const {
      quality = 85,
      format = 'webp',
      width,
      height,
    } = options

    // For external images, use a CDN service (like Cloudinary, ImageKit, etc.)
    // For now, we'll return the original URL with optimization parameters
    let optimizedUrl = src

    // Add optimization parameters if using a CDN
    if (src.includes('http')) {
      const url = new URL(src)
      url.searchParams.set('q', quality.toString())
      url.searchParams.set('f', format)
      if (width) url.searchParams.set('w', width.toString())
      if (height) url.searchParams.set('h', height.toString())
      optimizedUrl = url.toString()
    }

    this.cache.set(cacheKey, optimizedUrl)
    return optimizedUrl
  }

  static preloadCriticalImages(images: string[]): void {
    if (typeof window === 'undefined') return

    images.forEach((src) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })
  }

  static generateSrcSet(src: string, sizes: number[] = [400, 800, 1200, 1600]): string {
    return sizes
      .map((size) => `${this.optimizeImageUrl(src, { width: size })} ${size}w`)
      .join(', ')
  }

  static generateSizes(breakpoints: { size: string; width: string }[] = [
    { size: '(max-width: 640px)', width: '100vw' },
    { size: '(max-width: 1024px)', width: '50vw' },
    { size: '(max-width: 1536px)', width: '33vw' },
    { size: '', width: '25vw' },
  ]): string {
    return breakpoints
      .map(({ size, width }) => (size ? `${size} ${width}` : width))
      .join(', ')
  }
}

export function useImageOptimization(src: string, options: ImageOptimizationOptions = {}) {
  const [optimizedSrc, setOptimizedSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!src) return

    setIsLoading(true)
    setError(null)

    try {
      const optimized = ImageOptimizer.optimizeImageUrl(src, options)
      setOptimizedSrc(optimized)
      
      // Preload the image
      const img = new Image()
      img.onload = () => setIsLoading(false)
      img.onerror = () => {
        setError('Failed to load image')
        setIsLoading(false)
      }
      img.src = optimized
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image optimization failed')
      setIsLoading(false)
    }
  }, [src, options])

  return { optimizedSrc, isLoading, error }
}

export function useWebPSupport() {
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, 1, 1)
      
      canvas.toBlob((blob) => {
        setSupportsWebP(blob?.type === 'image/webp')
      }, 'image/webp')
    } else {
      setSupportsWebP(false)
    }
  }, [])

  return supportsWebP
}
