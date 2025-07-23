


import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="hero-landscape-bg py-20 lg:py-32 overflow-hidden rounded-xl mx-4 md:mx-6 mt-4">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight relative">
                <span className="gradient-text-hero">
                  Uw Strategische Partner in{' '}
                </span>
                <span className="gradient-text-hero-secondary block">
                  Business & IT Continuiteit & Compliance
                </span>
                {/* Subtle background glow effect */}
                <div className="absolute inset-0 gradient-text-glow blur-3xl opacity-20 -z-10"></div>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed relative z-10">
                Transformeer uw bedrijf met het automatiseren van uw Continuïteit en Compliance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 hover:text-black text-lg px-8 py-6">
                <Link href="/compliance-automation#quickscan">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Start Quick Scan
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-black hover:bg-white hover:text-black text-lg px-8 py-6">
                <Link href="/adviesgesprek">
                  Plan Adviesgesprek
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="relative lg:pl-8">
            <div className="relative">
              {/* Main illustration container */}
              <div className="relative z-10">
                <svg
                  viewBox="0 0 600 500"
                  className="w-full h-auto max-w-lg mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background elements */}
                  <defs>
                    <linearGradient id="phoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#1E40AF', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#EFF6FF', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#DBEAFE', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="personGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>

                  {/* Floating elements */}
                  <g className="animate-pulse">
                    {/* Cloud elements */}
                    <ellipse cx="100" cy="80" rx="20" ry="10" fill="rgba(255,255,255,0.1)" />
                    <ellipse cx="480" cy="120" rx="25" ry="12" fill="rgba(255,255,255,0.1)" />
                    <ellipse cx="520" cy="350" rx="18" ry="9" fill="rgba(255,255,255,0.1)" />
                  </g>

                  {/* Main server/device in center */}
                  <rect x="230" y="150" width="140" height="200" rx="20" fill="url(#phoneGradient)" />
                  <rect x="240" y="170" width="120" height="160" rx="10" fill="url(#screenGradient)" />
                  
                  {/* Screen content - dashboard/compliance icons */}
                  <rect x="250" y="185" width="100" height="8" rx="4" fill="#3B82F6" />
                  <rect x="250" y="200" width="80" height="6" rx="3" fill="#60A5FA" />
                  <rect x="250" y="215" width="90" height="6" rx="3" fill="#93C5FD" />
                  
                  {/* Chart/graph representation */}
                  <rect x="250" y="235" width="15" height="30" rx="2" fill="#10B981" />
                  <rect x="270" y="245" width="15" height="20" rx="2" fill="#3B82F6" />
                  <rect x="290" y="240" width="15" height="25" rx="2" fill="#8B5CF6" />
                  <rect x="310" y="230" width="15" height="35" rx="2" fill="#F59E0B" />
                  
                  {/* Compliance checkmarks */}
                  <circle cx="260" cy="285" r="6" fill="#10B981" />
                  <path d="M257 285 L259 287 L263 283" stroke="white" strokeWidth="2" fill="none" />
                  <circle cx="285" cy="285" r="6" fill="#10B981" />
                  <path d="M282 285 L284 287 L288 283" stroke="white" strokeWidth="2" fill="none" />
                  <circle cx="310" cy="285" r="6" fill="#10B981" />
                  <path d="M307 285 L309 287 L313 283" stroke="white" strokeWidth="2" fill="none" />

                  {/* Person 1 - Left side working with laptop */}
                  <g transform="translate(80, 250)">
                    {/* Body */}
                    <ellipse cx="25" cy="45" rx="15" ry="20" fill="#60A5FA" />
                    {/* Head */}
                    <circle cx="25" cy="15" r="12" fill="#F3A574" />
                    {/* Hair */}
                    <path d="M15 10 Q25 5 35 10 Q35 15 25 15 Q15 15 15 10" fill="#8B4513" />
                    {/* Laptop */}
                    <rect x="10" y="35" width="30" height="20" rx="2" fill="#374151" />
                    <rect x="12" y="37" width="26" height="15" rx="1" fill="#60A5FA" />
                    {/* Arms */}
                    <ellipse cx="15" cy="35" rx="3" ry="8" fill="#F3A574" />
                    <ellipse cx="35" cy="35" rx="3" ry="8" fill="#F3A574" />
                  </g>

                  {/* Person 2 - Right side with documents */}
                  <g transform="translate(420, 280)">
                    {/* Body */}
                    <ellipse cx="25" cy="35" rx="12" ry="18" fill="#34D399" />
                    {/* Head */}
                    <circle cx="25" cy="12" r="10" fill="#F3A574" />
                    {/* Hair */}
                    <path d="M17 8 Q25 3 33 8 Q33 12 25 12 Q17 12 17 8" fill="#654321" />
                    {/* Document */}
                    <rect x="35" y="20" width="20" height="25" rx="2" fill="white" />
                    <rect x="37" y="22" width="16" height="2" rx="1" fill="#3B82F6" />
                    <rect x="37" y="26" width="12" height="1" rx="0.5" fill="#6B7280" />
                    <rect x="37" y="29" width="14" height="1" rx="0.5" fill="#6B7280" />
                    <rect x="37" y="32" width="10" height="1" rx="0.5" fill="#6B7280" />
                    {/* Checkmark on document */}
                    <circle cx="45" cy="38" r="4" fill="#10B981" />
                    <path d="M43 38 L44.5 39.5 L47 37" stroke="white" strokeWidth="1" fill="none" />
                    {/* Arm holding document */}
                    <ellipse cx="32" cy="25" rx="2" ry="6" fill="#F3A574" />
                  </g>

                  {/* Person 3 - Bottom working with tablet */}
                  <g transform="translate(160, 350)">
                    {/* Body */}
                    <ellipse cx="20" cy="30" rx="10" ry="15" fill="#8B5CF6" />
                    {/* Head */}
                    <circle cx="20" cy="10" r="8" fill="#F3A574" />
                    {/* Hair */}
                    <path d="M14 6 Q20 2 26 6 Q26 10 20 10 Q14 10 14 6" fill="#2D1B69" />
                    {/* Tablet */}
                    <rect x="10" y="20" width="20" height="15" rx="2" fill="#1F2937" />
                    <rect x="12" y="22" width="16" height="11" rx="1" fill="#3B82F6" />
                    {/* Security/lock icon on tablet */}
                    <rect x="18" y="26" width="4" height="3" rx="0.5" fill="white" />
                    <rect x="19" y="24" width="2" height="2" rx="1" fill="transparent" stroke="white" strokeWidth="0.5" />
                    {/* Arms */}
                    <ellipse cx="12" cy="22" rx="2" ry="5" fill="#F3A574" />
                    <ellipse cx="28" cy="22" rx="2" ry="5" fill="#F3A574" />
                  </g>

                  {/* Data flow lines */}
                  <g stroke="#60A5FA" strokeWidth="2" fill="none" opacity="0.6">
                    <path d="M180 280 Q200 260 230 220" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" values="0;-10" dur="2s" repeatCount="indefinite" />
                    </path>
                    <path d="M420 300 Q400 280 370 240" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" values="0;-10" dur="2s" repeatCount="indefinite" />
                    </path>
                    <path d="M210 360 Q220 340 240 320" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" values="0;-10" dur="2s" repeatCount="indefinite" />
                    </path>
                  </g>

                  {/* Additional floating icons */}
                  <g fill="rgba(255,255,255,0.8)">
                    {/* Shield icon */}
                    <g transform="translate(450, 180)">
                      <path d="M8 2 L8 8 Q8 10 6 10 Q2 10 2 8 L2 2 Q2 1 3 1 L7 1 Q8 1 8 2 Z" />
                      <path d="M4 4 L5 5 L7 3" stroke="#10B981" strokeWidth="0.5" fill="none" />
                    </g>
                    {/* Gear icon */}
                    <g transform="translate(120, 180)">
                      <circle cx="5" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="5" cy="5" r="1" fill="currentColor" />
                      <path d="M5 1 L5 3 M5 7 L5 9 M9 5 L7 5 M3 5 L1 5 M7.5 2.5 L6.5 3.5 M3.5 6.5 L2.5 7.5 M7.5 7.5 L6.5 6.5 M3.5 3.5 L2.5 2.5" stroke="currentColor" strokeWidth="0.5" />
                    </g>
                  </g>
                </svg>
              </div>

              {/* Background decoration */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-20 left-5 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
                <div className="absolute top-1/2 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
