
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import type { NextAuthOptions } from "next-auth"
import { SessionManager, SecurityLogger } from "@/lib/security-week2"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Get request info for security logging
          const ipAddress = req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown'
          const userAgent = req?.headers?.['user-agent'] || 'unknown'

          // Find admin user
          const admin = await prisma.admin.findUnique({
            where: { email: credentials.email }
          })

          if (!admin) {
            // Log failed login attempt
            await SecurityLogger.logEvent('AUTHENTICATION_FAILURE', 'MEDIUM', {
              email: credentials.email,
              reason: 'User not found',
              ipAddress,
              userAgent
            }, 'auth', undefined, undefined, ipAddress, userAgent)
            return null
          }

          // Check if account is active
          if (!admin.isActive) {
            await SecurityLogger.logEvent('AUTHENTICATION_FAILURE', 'MEDIUM', {
              email: credentials.email,
              adminId: admin.id,
              reason: 'Account inactive',
              ipAddress,
              userAgent
            }, 'auth', admin.id, undefined, ipAddress, userAgent)
            return null
          }

          // Check for lockout
          if (admin.lockoutUntil && admin.lockoutUntil > new Date()) {
            await SecurityLogger.logEvent('AUTHENTICATION_FAILURE', 'HIGH', {
              email: credentials.email,
              adminId: admin.id,
              reason: 'Account locked',
              lockoutUntil: admin.lockoutUntil,
              ipAddress,
              userAgent
            }, 'auth', admin.id, undefined, ipAddress, userAgent)
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            admin.hashedPassword
          )

          if (!isPasswordValid) {
            // Increment failed login attempts
            const newFailedLogins = admin.failedLogins + 1
            const shouldLockout = newFailedLogins >= 5
            
            await prisma.admin.update({
              where: { id: admin.id },
              data: {
                failedLogins: newFailedLogins,
                lockoutUntil: shouldLockout ? new Date(Date.now() + 15 * 60 * 1000) : null
              }
            })

            await SecurityLogger.logEvent('AUTHENTICATION_FAILURE', shouldLockout ? 'HIGH' : 'MEDIUM', {
              email: credentials.email,
              adminId: admin.id,
              reason: 'Invalid password',
              failedAttempts: newFailedLogins,
              lockedOut: shouldLockout,
              ipAddress,
              userAgent
            }, 'auth', admin.id, undefined, ipAddress, userAgent)

            // Check for brute force attack
            if (newFailedLogins > 10) {
              await SecurityLogger.logEvent('BRUTE_FORCE_ATTACK', 'CRITICAL', {
                email: credentials.email,
                adminId: admin.id,
                failedAttempts: newFailedLogins,
                ipAddress,
                userAgent
              }, 'auth', admin.id, undefined, ipAddress, userAgent)
            }

            return null
          }

          // ==== WEEK 2: ENHANCED SESSION MANAGEMENT ====
          
          // Check for suspicious activity before allowing login
          const suspiciousCheck = await SessionManager.detectSuspiciousActivity(
            admin.id,
            ipAddress,
            userAgent
          )

          if (suspiciousCheck.suspicious) {
            await SecurityLogger.logEvent('SUSPICIOUS_ACTIVITY', 'HIGH', {
              adminId: admin.id,
              email: credentials.email,
              reasons: suspiciousCheck.reasons,
              ipAddress,
              userAgent,
              action: 'Login blocked due to suspicious activity'
            }, 'auth', admin.id, undefined, ipAddress, userAgent)

            // For high-risk suspicious activity, temporarily lock account
            if (suspiciousCheck.reasons.length > 2) {
              await prisma.admin.update({
                where: { id: admin.id },
                data: {
                  lockoutUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 min lockout
                }
              })
              return null
            }
          }

          // Reset failed login attempts and update last login
          await prisma.admin.update({
            where: { id: admin.id },
            data: {
              failedLogins: 0,
              lockoutUntil: null,
              lastLogin: new Date()
            }
          })

          // Enhanced admin activity logging
          await prisma.adminActivityLog.create({
            data: {
              adminId: admin.id,
              action: 'LOGIN',
              resource: 'AUTH',
              details: { 
                success: true,
                ipAddress,
                userAgent,
                suspiciousActivity: suspiciousCheck.suspicious,
                suspiciousReasons: suspiciousCheck.reasons
              },
              ipAddress,
              userAgent
            }
          })

          // Log successful authentication
          await SecurityLogger.logEvent('AUTHENTICATION_SUCCESS', 'LOW', {
            adminId: admin.id,
            email: credentials.email,
            role: admin.role,
            ipAddress,
            userAgent
          }, 'auth', admin.id, undefined, ipAddress, userAgent)

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            isActive: admin.isActive
          }
        } catch (error) {
          console.error('Authentication error:', error)
          
          // Log authentication system error
          await SecurityLogger.logEvent('AUTHENTICATION_FAILURE', 'HIGH', {
            email: credentials.email,
            error: error instanceof Error ? error.message : 'Unknown error',
            type: 'System error'
          }, 'auth')
          
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours (reduced from 24)
    updateAge: 30 * 60, // Update session every 30 minutes
  },

  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.adviesnconsultancy.nl' : undefined
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.role = user.role
        token.isActive = user.isActive
        token.loginTime = Date.now()
        token.lastActivity = Date.now()
        token.sessionToken = account?.access_token || `session_${Date.now()}_${Math.random()}`
      }
      
      // ==== WEEK 2: ENHANCED JWT VALIDATION ====
      
      // Session timeout validation (8 hours)
      if (token.loginTime && Date.now() - (token.loginTime as number) > 8 * 60 * 60 * 1000) {
        token.isActive = false
        token.expired = true
        
        // Log session expiration
        await SecurityLogger.logEvent('SESSION_EXPIRED', 'MEDIUM', {
          adminId: token.sub,
          sessionToken: token.sessionToken,
          loginTime: token.loginTime,
          expiredAfter: '8 hours'
        }, 'auth', token.sub as string)
      }
      
      // Activity timeout validation (2 hours inactivity)
      if (token.lastActivity && Date.now() - (token.lastActivity as number) > 2 * 60 * 60 * 1000) {
        token.isActive = false
        token.inactive = true
        
        // Log session inactivity
        await SecurityLogger.logEvent('SESSION_INACTIVE', 'MEDIUM', {
          adminId: token.sub,
          sessionToken: token.sessionToken,
          lastActivity: token.lastActivity,
          inactiveAfter: '2 hours'
        }, 'auth', token.sub as string)
      }
      
      // Update last activity if still active and not a background refresh
      if (token.isActive && trigger !== 'update') {
        token.lastActivity = Date.now()
        
        // Update session activity in database
        if (token.sessionToken) {
          await SessionManager.updateSessionActivity(token.sessionToken as string)
        }
      }
      
      // Validate admin status in database periodically (every 10 minutes)
      if (token.sub && token.lastActivity && 
          Date.now() - (token.lastActivity as number) > 10 * 60 * 1000) {
        try {
          const admin = await prisma.admin.findUnique({
            where: { id: token.sub }
          })
          
          if (!admin || !admin.isActive) {
            token.isActive = false
            token.accountDeactivated = true
            
            await SecurityLogger.logEvent('SESSION_INVALIDATED', 'HIGH', {
              adminId: token.sub,
              reason: admin ? 'Account deactivated' : 'Account deleted',
              sessionToken: token.sessionToken
            }, 'auth', token.sub)
          }
        } catch (error) {
          console.error('Admin validation error:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.isActive = token.isActive as boolean
        session.sessionToken = token.sessionToken as string
        
        // ==== WEEK 2: ENHANCED SESSION VALIDATION ====
        
        // Additional security check in session
        if (!token.isActive || token.expired || token.inactive || token.accountDeactivated) {
          // Log session rejection reason
          const reason = token.expired ? 'expired' : 
                        token.inactive ? 'inactive' : 
                        token.accountDeactivated ? 'account deactivated' : 'not active'
          
          await SecurityLogger.logEvent('SESSION_REJECTED', 'MEDIUM', {
            adminId: token.sub,
            reason,
            sessionToken: token.sessionToken
          }, 'auth', token.sub as string)
          
          throw new Error(`Session ${reason}`)
        }
        
        // Track active session
        if (token.sessionToken) {
          await SessionManager.trackSessionActivity(
            token.sessionToken as string,
            token.sub as string,
            'session_access',
            'unknown', // IP not available in session callback
            'unknown', // User agent not available in session callback
            true
          )
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // ==== WEEK 2: ENHANCED SIGN-IN VALIDATION ====
      
      if (!user?.isActive) {
        await SecurityLogger.logEvent('AUTHENTICATION_FAILURE', 'MEDIUM', {
          userId: user?.id,
          email: user?.email,
          reason: 'Account not active during sign-in'
        }, 'auth', user?.id)
        return false
      }
      
      // Create active session record
      if (user?.id && account) {
        const sessionToken = account.access_token || `session_${Date.now()}_${Math.random()}`
        
        await SessionManager.createActiveSession(
          sessionToken,
          user.id,
          'unknown', // IP not available in signIn callback
          'unknown'  // User agent not available in signIn callback
        )
      }
      
      // Log successful sign-in
      await SecurityLogger.logEvent('AUTHENTICATION_SUCCESS', 'LOW', {
        userId: user?.id,
        email: user?.email,
        role: user?.role
      }, 'auth', user?.id)
      
      console.log(`🔐 Successful sign-in: ${user?.email} at ${new Date().toISOString()}`)
      
      return true
    },
    async redirect({ url, baseUrl }) {
      // ==== ENHANCED REDIRECT LOGIC ====
      
      // Ensure we always use the correct base URL
      const productionBaseUrl = process.env.NEXTAUTH_URL || baseUrl
      
      // If URL is relative, prepend the base URL
      if (url.startsWith('/')) {
        return `${productionBaseUrl}${url}`
      }
      
      // If URL is absolute but matches our domain, allow it
      if (url.startsWith(productionBaseUrl)) {
        return url
      }
      
      // If URL matches www.adviesnconsultancy.nl variations, normalize it
      if (url.includes('adviesnconsultancy.nl')) {
        try {
          const urlObj = new URL(url)
          // Always redirect to www version
          urlObj.hostname = 'www.adviesnconsultancy.nl'
          urlObj.protocol = 'https:'
          return urlObj.toString()
        } catch (error) {
          console.error('URL parsing error in redirect:', error)
        }
      }
      
      // For OAuth callbacks and external redirects, verify domain
      try {
        const urlObj = new URL(url)
        const baseUrlObj = new URL(productionBaseUrl)
        
        // Only allow redirects to the same domain
        if (urlObj.hostname === baseUrlObj.hostname) {
          return url
        }
      } catch (error) {
        console.error('URL validation error in redirect:', error)
      }
      
      // Default fallback to admin dashboard
      return `${productionBaseUrl}/admin`
    }
  },
  // Enhanced JWT configuration
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours (reduced from 24)
    secret: process.env.NEXTAUTH_SECRET,
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  debug: process.env.NODE_ENV === 'development',
}
