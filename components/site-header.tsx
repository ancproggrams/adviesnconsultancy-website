


'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import React from 'react'

export function SiteHeader() {
  return (
    <>
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="skip-link focus-visible"
        tabIndex={1}
      >
        Skip to main content
      </a>
      
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center space-x-3 focus-visible"
            aria-label="Advies N Consultancy BV - Go to homepage"
          >
            <div className="relative h-12 w-12">
              <Image
                src="/ANCLOGO.jpeg"
                alt="Advies N Consultancy BV Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Advies N Consultancy BV
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Main navigation">
            <NavigationMenu>
              <NavigationMenuList className="flex items-center space-x-6">
                <NavigationMenuItem>
                  <Link 
                    href="/"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible"
                  >
                    Home
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                    Diensten
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/diensten"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              IT Consultancy Diensten
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Professionele IT-consultancy diensten voor business continuiteit en compliance.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/diensten" title="Alle Diensten">
                        Overzicht van al onze IT consultancy diensten
                      </ListItem>
                      <ListItem href="/compliance-automation" title="Compliance Automation Platform">
                        Automatiseer uw compliance processen met onze platform
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                    Kenniscentrum
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/kenniscentrum"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Kenniscentrum
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Waardevolle inzichten, resources en best practices voor business continuiteit.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/kenniscentrum" title="Artikelen & Blogs">
                        Nieuwste inzichten over business continuiteit en compliance
                      </ListItem>
                      <ListItem href="/resources" title="Resources & Tools">
                        Gratis templates, tools en gidsen voor BCM
                      </ListItem>
                      <ListItem href="/faq" title="Veelgestelde Vragen">
                        Antwoorden op veelgestelde vragen over onze diensten
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                    Over Ons
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/over-ons"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Over Ons
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Leer meer over onze expertise en aanpak in business continuity management.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/over-ons" title="Bedrijf">
                        Onze missie, visie en werkwijze
                      </ListItem>
                      <ListItem href="/team" title="Ons Team">
                        Ontmoet onze BCM experts en consultants
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link 
                    href="/adviesgesprek"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible"
                  >
                    Adviesgesprek
                  </Link>
                </NavigationMenuItem>
                

              </NavigationMenuList>
            </NavigationMenu>
            
            <Button asChild className="btn-primary focus-visible ml-4">
              <Link href="/compliance-automation#quickscan">
                Quick Scan
              </Link>
            </Button>
          </nav>

          {/* Mobile Navigation - simplified for SSR */}
          <div className="md:hidden">
            <Button asChild className="btn-primary focus-visible">
              <Link href="/compliance-automation#quickscan">
                Quick Scan
              </Link>
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & { title: string; href: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
