
'use client'

import { useState, useEffect } from 'react'
import { ChatbotWidget } from './chatbot-widget'

export function ChatbotManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)

  // Check if chatbot is enabled
  useEffect(() => {
    const checkChatbotStatus = async () => {
      try {
        const response = await fetch('/api/chatbot/config')
        const data = await response.json()
        setIsEnabled(data.isActive)
      } catch (error) {
        console.error('Error checking chatbot status:', error)
      }
    }
    
    checkChatbotStatus()
  }, [])

  // Track analytics
  useEffect(() => {
    if (isOpen) {
      // Track chatbot open event
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'chatbot_opened',
          eventData: { timestamp: new Date().toISOString() }
        })
      }).catch(console.error)
    }
  }, [isOpen])

  if (!isEnabled) return null

  return (
    <ChatbotWidget
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    />
  )
}
