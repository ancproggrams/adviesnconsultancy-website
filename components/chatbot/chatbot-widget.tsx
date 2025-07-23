
'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Phone, 
  Mail, 
  Building,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { ChatMessage, ChatConversation } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatbotWidgetProps {
  isOpen: boolean
  onToggle: () => void
}

export function ChatbotWidget({ isOpen, onToggle }: ChatbotWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadInfo, setLeadInfo] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  })
  const [hasProvidedInfo, setHasProvidedInfo] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Initialize chat session
  useEffect(() => {
    if (isOpen && !sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        conversationId: newSessionId,
        role: 'ASSISTANT',
        content: `Hallo! Ik ben de virtuele assistent van Advies N Consultancy. Ik help u graag met vragen over business continuïteit, compliance, en onze diensten. Waarmee kan ik u helpen?`,
        createdAt: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, sessionId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId: sessionId,
      role: 'USER',
      content: inputMessage,
      createdAt: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId,
          userInfo: hasProvidedInfo ? leadInfo : null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      if (reader) {
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          conversationId: sessionId,
          role: 'ASSISTANT',
          content: '',
          createdAt: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                // Check if we should show lead form
                const shouldShowLeadForm = buffer.includes('TRIGGER_LEAD_FORM')
                if (shouldShowLeadForm && !hasProvidedInfo) {
                  setShowLeadForm(true)
                }
                return
              }
              
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  buffer += parsed.content
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: buffer }
                      : msg
                  ))
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        conversationId: sessionId,
        role: 'ASSISTANT',
        content: 'Sorry, er is iets misgegaan. Probeer het later opnieuw of neem direct contact met ons op.',
        createdAt: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeadFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadInfo.name || !leadInfo.email) return

    try {
      const response = await fetch('/api/chatbot/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          ...leadInfo
        })
      })

      if (response.ok) {
        setHasProvidedInfo(true)
        setShowLeadForm(false)
        
        const thankYouMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          conversationId: sessionId,
          role: 'ASSISTANT',
          content: `Bedankt ${leadInfo.name}! Ik heb uw gegevens ontvangen. Nu kan ik u nog beter helpen met specifieke vragen over uw bedrijf en compliance behoeften.`,
          createdAt: new Date()
        }
        setMessages(prev => [...prev, thankYouMessage])
      }
    } catch (error) {
      console.error('Error submitting lead form:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={onToggle}
          size="lg"
          className="rounded-full w-16 h-16 shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </motion.div>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed bottom-24 right-4 w-96 max-w-[calc(100vw-2rem)] z-50"
          >
            <Card className="shadow-2xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Virtuele Assistent
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="text-white hover:bg-blue-800"
                    >
                      {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggle}
                      className="text-white hover:bg-blue-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Online - Meestal binnen 1 minuut antwoord
                </div>
              </CardHeader>

              {!isMinimized && (
                <CardContent className="p-0">
                  {/* Messages Area */}
                  <ScrollArea className="h-96 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === 'USER'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {message.role === 'ASSISTANT' && (
                                <Bot className="h-4 w-4 mt-0.5 text-blue-600" />
                              )}
                              {message.role === 'USER' && (
                                <User className="h-4 w-4 mt-0.5" />
                              )}
                              <div className="text-sm">{message.content}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4 text-blue-600" />
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Typ uw vraag hier..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {hasProvidedInfo && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Contactgegevens ontvangen
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lead Form Modal */}
      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contactgegevens</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLeadFormSubmit} className="space-y-4">
            <div className="text-sm text-gray-600">
              Om u beter te kunnen helpen, zou ik graag uw contactgegevens willen ontvangen.
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Naam *</label>
                <Input
                  required
                  value={leadInfo.name}
                  onChange={(e) => setLeadInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Uw volledige naam"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">E-mail *</label>
                <Input
                  required
                  type="email"
                  value={leadInfo.email}
                  onChange={(e) => setLeadInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="uw.email@bedrijf.nl"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Bedrijf</label>
                <Input
                  value={leadInfo.company}
                  onChange={(e) => setLeadInfo(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Uw bedrijfsnaam"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Telefoon</label>
                <Input
                  value={leadInfo.phone}
                  onChange={(e) => setLeadInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="06-12345678"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Versturen
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowLeadForm(false)}>
                Later
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
