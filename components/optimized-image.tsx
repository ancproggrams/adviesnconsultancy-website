
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useImageOptimization, useWebPSupport, ImageOptimizer } from '@/lib/image-optimization'
import { cdn } from '@/lib/cdn-utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  quality?: number
  priority?: boolean
  className?: string
  sizes?: string
  fill?: boolean
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  lazy?: boolean
  onLoad?: () => void
  onError?: (error: Error) => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 85,
  priority = false,
  className = '',
  sizes,
  fill = false,
  objectFit = 'cover',
  placeholder = 'empty',
  blurDataURL,
  lazy = true,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(!lazy || priority)
  const imgRef = useRef<HTMLImageElement>(null)
  const supportsWebP = useWebPSupport()

  // Optimize image source
  const optimizedSrc = src.startsWith('http') 
    ? cdn.getOptimizedAssetUrl(src, {
        width,
        height,
        quality,
        format: supportsWebP ? 'webp' : 'jpeg',
      })
    : src

  // Generate responsive srcset - handled by Next.js Image component
  const srcSet = undefined

  // Generate sizes attribute
  const sizesAttribute = sizes || (width ? `${width}px` : '100vw')

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isVisible) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, priority, isVisible])

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  // Handle image error
  const handleError = () => {
    const errorMsg = 'Failed to load image'
    setError(errorMsg)
    setIsLoading(false)
    onError?.(new Error(errorMsg))
  }

  // Preload critical images
  useEffect(() => {
    if (priority && optimizedSrc) {
      ImageOptimizer.preloadCriticalImages([optimizedSrc])
    }
  }, [priority, optimizedSrc])

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: fill ? '100%' : width, 
        height: fill ? '100%' : height,
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
    >
      {isVisible && (
        <>
          {/* Loading placeholder */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error placeholder */}
          {error && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-gray-400 text-sm text-center p-4">
                <div className="w-8 h-8 mx-auto mb-2">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                </div>
                <p>Image niet beschikbaar</p>
              </div>
            </div>
          )}

          {/* Actual image */}
          <Image
            src={optimizedSrc}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            quality={quality}
            priority={priority}
            sizes={sizesAttribute}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            className={`transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            } ${fill ? 'object-cover' : ''}`}
            style={{ objectFit: fill ? objectFit : undefined }}
            onLoad={handleLoad}
            onError={handleError}
          />
        </>
      )}

      {/* Lazy loading placeholder */}
      {!isVisible && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
    </div>
  )
}

// Hook for batch image preloading
export function useImagePreloader() {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())

  const preloadImages = (urls: string[]) => {
    if (typeof window === 'undefined') return
    
    urls.forEach((url) => {
      if (!preloadedImages.has(url)) {
        const img = document.createElement('img')
        img.src = url
        img.onload = () => {
          setPreloadedImages(prev => new Set(prev).add(url))
        }
      }
    })
  }

  return { preloadImages, preloadedImages }
}
