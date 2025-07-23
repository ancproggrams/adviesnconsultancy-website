
'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult {
  id: string
  question: string
  answer: string
  category: string
}

export function FaqSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Mock search function - in real app, this would call an API
  const searchFaqs = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    // Simulate API call
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          question: 'Wat is ISO 22301 en waarom is het belangrijk?',
          answer: 'ISO 22301 is de internationale standaard voor Business Continuity Management Systems (BCMS)...',
          category: 'Compliance'
        },
        {
          id: '2',
          question: 'Hoe lang duurt een ISO 22301 certificering?',
          answer: 'Een ISO 22301 certificering duurt gemiddeld 6-12 maanden...',
          category: 'Compliance'
        },
        {
          id: '3',
          question: 'Wat is de BCM QuickScan en hoe werkt het?',
          answer: 'De BCM QuickScan is een gratis online assessment tool...',
          category: 'QuickScan'
        }
      ].filter(item => 
        item.question.toLowerCase().includes(term.toLowerCase()) ||
        item.answer.toLowerCase().includes(term.toLowerCase())
      )

      setSearchResults(mockResults)
      setIsSearching(false)
    }, 300)
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchFaqs(searchTerm)
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchTerm])

  const clearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Zoek in veelgestelde vragen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 py-3 text-lg"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="shadow-lg">
              <CardContent className="p-4">
                {isSearching ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Zoeken...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      {searchResults.length} resultaten gevonden
                    </div>
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          // Scroll to the relevant section
                          const element = document.getElementById(result.category.toLowerCase())
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' })
                          }
                          clearSearch()
                        }}
                      >
                        <div className="font-medium text-sm mb-1">{result.question}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {result.answer}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">{result.category}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Geen resultaten gevonden voor "{searchTerm}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Probeer andere zoektermen of neem contact met ons op
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
