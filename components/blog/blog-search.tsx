
'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, X, Filter } from 'lucide-react'
import { BlogCategory, BlogTag } from '@/lib/types'
import { motion } from 'framer-motion'

interface BlogSearchProps {
  categories: BlogCategory[]
  tags: BlogTag[]
  onSearch: (params: {
    query?: string
    category?: string
    tag?: string
  }) => void
  isLoading?: boolean
}

export function BlogSearch({ categories, tags, onSearch, isLoading }: BlogSearchProps) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>()
  const [selectedTag, setSelectedTag] = useState<string>()
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    onSearch({
      query: query.trim() || undefined,
      category: selectedCategory,
      tag: selectedTag
    })
  }

  const handleClear = () => {
    setQuery('')
    setSelectedCategory(undefined)
    setSelectedTag(undefined)
    onSearch({})
  }

  const hasFilters = query || selectedCategory || selectedTag

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.length > 2 || query.length === 0) {
        handleSearch()
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, selectedCategory, selectedTag])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border-0 mb-8"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Zoek in artikelen, titels, inhoud..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-2 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery('')}
              className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasFilters && (
              <Badge variant="destructive" className="ml-2 px-2 py-1 text-xs">
                {[query, selectedCategory, selectedTag].filter(Boolean).length}
              </Badge>
            )}
          </Button>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Wis filters
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Categorie</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle categorieën</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tag</label>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle tags</SelectItem>
                  {tags?.map((tag) => (
                    <SelectItem key={tag.id} value={tag.slug}>
                      #{tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}

        {/* Active Filters */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 pt-2">
            {query && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                "{query}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery('')}
                  className="h-4 w-4 p-0 ml-1 hover:bg-gray-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="outline" className="flex items-center gap-1">
                Categorie: {categories?.find(c => c.slug === selectedCategory)?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(undefined)}
                  className="h-4 w-4 p-0 ml-1 hover:bg-gray-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedTag && (
              <Badge variant="outline" className="flex items-center gap-1">
                Tag: {tags?.find(t => t.slug === selectedTag)?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTag(undefined)}
                  className="h-4 w-4 p-0 ml-1 hover:bg-gray-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Zoeken...
          </div>
        </div>
      )}
    </motion.div>
  )
}
