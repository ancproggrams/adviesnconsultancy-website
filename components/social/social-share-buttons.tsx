
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { 
  Linkedin, 
  Twitter, 
  Facebook, 
  MessageCircle, 
  Mail, 
  Link,
  Share2,
  Copy,
  Check
} from 'lucide-react'
import { SocialMediaService } from '@/lib/social-media'
import { SocialShareData } from '@/lib/types'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface SocialShareButtonsProps {
  url: string
  title: string
  description: string
  image?: string
  postId?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal' | 'colorful'
  className?: string
}

export function SocialShareButtons({
  url,
  title,
  description,
  image,
  postId,
  size = 'md',
  variant = 'default',
  className = ''
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  
  const socialService = SocialMediaService.getInstance()
  
  const shareData: SocialShareData = {
    url,
    title,
    description,
    image
  }
  
  const shareUrls = socialService.generateShareUrls(shareData)
  
  const handleShare = async (platform: string) => {
    setIsSharing(true)
    
    try {
      // Track share in analytics
      if (postId) {
        await fetch('/api/social/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, platform })
        })
      }
      
      // Track in Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'share', {
          method: platform,
          content_type: 'blog_post',
          item_id: postId || url
        })
      }
      
      toast.success(`Gedeeld op ${platform}!`)
    } catch (error) {
      console.error('Share tracking error:', error)
    } finally {
      setIsSharing(false)
    }
  }
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link gekopieerd!')
      
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('Kon link niet kopiëren')
    }
  }
  
  const openShareUrl = (platform: string, shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400')
    handleShare(platform)
  }
  
  const shareButtons = [
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: shareUrls.linkedin,
      color: 'bg-[#0077b5] hover:bg-[#005885]',
      colorful: 'text-[#0077b5] hover:bg-[#0077b5] hover:text-white'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: shareUrls.twitter,
      color: 'bg-[#1da1f2] hover:bg-[#0d95e8]',
      colorful: 'text-[#1da1f2] hover:bg-[#1da1f2] hover:text-white'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: shareUrls.facebook,
      color: 'bg-[#1877f2] hover:bg-[#166fe5]',
      colorful: 'text-[#1877f2] hover:bg-[#1877f2] hover:text-white'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: shareUrls.whatsapp,
      color: 'bg-[#25d366] hover:bg-[#20bd5a]',
      colorful: 'text-[#25d366] hover:bg-[#25d366] hover:text-white'
    },
    {
      name: 'Email',
      icon: Mail,
      url: shareUrls.email,
      color: 'bg-gray-600 hover:bg-gray-700',
      colorful: 'text-gray-600 hover:bg-gray-600 hover:text-white'
    }
  ]
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <div className={`flex items-center gap-2 ${className}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="text-gray-600 hover:text-gray-800"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </Button>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-600 mr-2 hidden sm:inline">Delen:</span>
        
        <div className="flex items-center gap-2">
          {shareButtons.map((button) => (
            <Tooltip key={button.name}>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={variant === 'colorful' ? 'outline' : 'ghost'}
                    size="sm"
                    onClick={() => openShareUrl(button.name, button.url)}
                    disabled={isSharing}
                    className={`
                      ${sizeClasses[size]}
                      ${variant === 'colorful' 
                        ? `border-2 transition-all duration-200 ${button.colorful}`
                        : variant === 'default'
                        ? `text-white transition-all duration-200 ${button.color}`
                        : 'text-gray-600 hover:text-gray-800'
                      }
                    `}
                  >
                    <button.icon className={iconSizes[size]} />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delen op {button.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={variant === 'colorful' ? 'outline' : 'ghost'}
                  size="sm"
                  onClick={copyToClipboard}
                  className={`
                    ${sizeClasses[size]}
                    ${variant === 'colorful' 
                      ? 'border-2 text-gray-600 hover:bg-gray-600 hover:text-white'
                      : variant === 'default'
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                >
                  {copied ? (
                    <Check className={iconSizes[size]} />
                  ) : (
                    <Copy className={iconSizes[size]} />
                  )}
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? 'Gekopieerd!' : 'Kopieer link'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
