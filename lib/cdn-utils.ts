

export interface CDNConfig {
  baseUrl: string
  apiKey?: string
  defaultTransformations?: Record<string, any>
}

export class CDNManager {
  private config: CDNConfig
  private cache: Map<string, string> = new Map()

  constructor(config: CDNConfig) {
    this.config = config
  }

  // Generate optimized asset URLs
  getOptimizedAssetUrl(
    path: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'jpeg' | 'png' | 'avif'
      crop?: 'fill' | 'fit' | 'scale'
      gravity?: 'center' | 'north' | 'south' | 'east' | 'west'
    } = {}
  ): string {
    const cacheKey = `${path}_${JSON.stringify(options)}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const {
      width,
      height,
      quality = 85,
      format = 'webp',
      crop = 'fill',
      gravity = 'center',
    } = options

    // Build transformation string
    const transformations: string[] = []
    
    if (width) transformations.push(`w_${width}`)
    if (height) transformations.push(`h_${height}`)
    if (quality) transformations.push(`q_${quality}`)
    if (format) transformations.push(`f_${format}`)
    if (crop) transformations.push(`c_${crop}`)
    if (gravity) transformations.push(`g_${gravity}`)

    // Add performance optimizations
    transformations.push('fl_progressive', 'fl_immutable_cache')

    const transformString = transformations.join(',')
    const optimizedUrl = `${this.config.baseUrl}/${transformString}/${path}`

    this.cache.set(cacheKey, optimizedUrl)
    return optimizedUrl
  }

  // Generate responsive image srcset
  generateResponsiveSrcSet(
    path: string,
    sizes: number[] = [400, 800, 1200, 1600, 2000],
    options: { format?: 'webp' | 'jpeg' | 'png' | 'avif'; quality?: number } = {}
  ): string {
    return sizes
      .map((size) => {
        const url = this.getOptimizedAssetUrl(path, {
          width: size,
          ...options,
        })
        return `${url} ${size}w`
      })
      .join(', ')
  }

  // Preload critical assets
  preloadAssets(assets: Array<{ path: string; priority: 'high' | 'medium' | 'low' }>): void {
    if (typeof window === 'undefined') return

    const sortedAssets = assets.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 }
      return priorities[b.priority] - priorities[a.priority]
    })

    sortedAssets.forEach(({ path, priority }) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = this.getOptimizedAssetUrl(path)
      
      if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high')
      }
      
      document.head.appendChild(link)
    })
  }

  // Cache management
  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Asset compression utilities
export class AssetCompressor {
  static async compressCSS(css: string): Promise<string> {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove trailing semicolons
      .replace(/\s*{\s*/g, '{') // Remove spaces around braces
      .replace(/;\s*/g, ';') // Remove spaces after semicolons
      .trim()
  }

  static async compressJS(js: string): Promise<string> {
    // Basic minification (in production, use proper minifiers)
    return js
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Clean up semicolons
      .trim()
  }

  static getGzipSize(content: string): number {
    // Estimate gzip size (rough calculation)
    return Math.floor(content.length * 0.3) // ~30% compression ratio
  }
}

// Performance monitoring for assets
export class AssetPerformanceMonitor {
  private metrics: Map<string, any> = new Map()

  trackAssetLoad(url: string, startTime: number, endTime: number): void {
    const duration = endTime - startTime
    const existing = this.metrics.get(url) || { loads: 0, totalTime: 0 }
    
    this.metrics.set(url, {
      loads: existing.loads + 1,
      totalTime: existing.totalTime + duration,
      averageTime: (existing.totalTime + duration) / (existing.loads + 1),
      lastLoad: endTime,
    })
  }

  getSlowAssets(threshold: number = 1000): Array<{ url: string; averageTime: number }> {
    const slowAssets: Array<{ url: string; averageTime: number }> = []
    
    this.metrics.forEach((metrics, url) => {
      if (metrics.averageTime > threshold) {
        slowAssets.push({ url, averageTime: metrics.averageTime })
      }
    })
    
    return slowAssets.sort((a, b) => b.averageTime - a.averageTime)
  }

  generateReport(): any {
    const report: any = {
      totalAssets: this.metrics.size,
      slowAssets: this.getSlowAssets(),
      summary: {
        totalLoads: 0,
        averageLoadTime: 0,
        totalLoadTime: 0,
      },
    }

    let totalLoads = 0
    let totalLoadTime = 0

    this.metrics.forEach((metrics) => {
      totalLoads += metrics.loads
      totalLoadTime += metrics.totalTime
    })

    report.summary.totalLoads = totalLoads
    report.summary.totalLoadTime = totalLoadTime
    report.summary.averageLoadTime = totalLoads > 0 ? totalLoadTime / totalLoads : 0

    return report
  }
}

// Global CDN instance
export const cdn = new CDNManager({
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.adviesnconsultancy.nl',
  defaultTransformations: {
    quality: 85,
    format: 'webp',
  },
})

// Global asset performance monitor
export const assetMonitor = new AssetPerformanceMonitor()
