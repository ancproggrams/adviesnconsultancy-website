 import express, { Request, Response, NextFunction } from 'express';
import next from 'next';
import cookie from 'cookie';
import { getToken } from 'next-auth/jwt';
import { SecurityLogger, SessionManager, ValidationManager, ApiKeyManager } from './lib/security-week2';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// Simple in-memory rate limit map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit = 100, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const current = rateLimitMap.get(ip);
  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

nextApp.prepare().then(() => {
  const server = express();
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  server.use(async (req: Request, res: Response, nextFn: NextFunction) => {
    const ip = (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown') as string;
    const userAgent = (req.headers['user-agent'] || 'unknown') as string;
    const pathname = req.path;
    const method = req.method;

    // Security validations similar to Next.js middleware
    if (ValidationManager.detectSqlInjection(pathname)) {
      await SecurityLogger.logEvent('SQL_INJECTION_ATTEMPT', 'HIGH', { url: pathname, ipAddress: ip, userAgent, method }, 'express');
      return res.status(403).send('Forbidden');
    }

    const searchParams = req.url.includes('?') ? req.url.substring(req.url.indexOf('?') + 1) : '';
    if (searchParams && ValidationManager.detectXss(searchParams)) {
      await SecurityLogger.logEvent('XSS_ATTEMPT', 'HIGH', { params: searchParams, ipAddress: ip, userAgent, method }, 'express');
      return res.status(403).send('Forbidden');
    }

    const isApiRoute = pathname.startsWith('/api/');
    const isPublicApiRoute = pathname.startsWith('/api/auth') || pathname.startsWith('/api/health') || pathname.startsWith('/api/contact');

    if (isApiRoute && !isPublicApiRoute && method !== 'OPTIONS') {
      const apiKey = req.headers['x-api-key'] as string | undefined;
      if (apiKey) {
        const validation = await ApiKeyManager.validateApiKey(apiKey);
        if (!validation.isValid) {
          await SecurityLogger.logEvent('UNAUTHORIZED_ACCESS', 'MEDIUM', { reason: validation.error, endpoint: pathname, ipAddress: ip, userAgent }, 'express');
          return res.status(401).send('Unauthorized');
        }
        const canProceed = await ApiKeyManager.checkRateLimit(validation.apiKey.id);
        if (!canProceed) {
          await SecurityLogger.logEvent('RATE_LIMIT_EXCEEDED', 'MEDIUM', { apiKeyId: validation.apiKey.id, endpoint: pathname, ipAddress: ip }, 'express');
          return res.status(429).send('Rate Limit Exceeded');
        }
      }
    }

    if (!checkRateLimit(ip)) {
      await SecurityLogger.logEvent('RATE_LIMIT_EXCEEDED', 'MEDIUM', { ipAddress: ip, userAgent, endpoint: pathname }, 'express');
      res.setHeader('Retry-After', '900');
      return res.status(429).send('Too Many Requests');
    }

    const suspiciousPatterns = [/sqlmap/i, /nikto/i, /nessus/i, /masscan/i, /nmap/i];
    if (suspiciousPatterns.some(p => p.test(userAgent))) {
      await SecurityLogger.logEvent('MALICIOUS_REQUEST', 'MEDIUM', { userAgent, ipAddress: ip, reason: 'Suspicious user agent' }, 'express');
      return res.status(403).send('Forbidden');
    }

    // Session check for admin routes
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const cookies = cookie.parse(req.headers.cookie || '');
      const token = await getToken({ req: { headers: req.headers, cookies } as any, secret: process.env.NEXTAUTH_SECRET });
      if (!token || !token.isActive) {
        await SecurityLogger.logEvent('UNAUTHORIZED_ACCESS', 'MEDIUM', { attemptedRoute: pathname, ipAddress: ip, userAgent, reason: 'No valid session token' }, 'express');
        return res.redirect(`/admin/login?callbackUrl=${encodeURIComponent(pathname)}`);
      }
      if (!token.role || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(token.role as string)) {
        await SecurityLogger.logEvent('PRIVILEGE_ESCALATION', 'HIGH', { userId: token.sub, userRole: token.role, attemptedRoute: pathname, ipAddress: ip, userAgent }, 'express');
        return res.redirect('/admin/login?error=insufficient_permissions');
      }
      await SessionManager.updateSessionActivity(token.sessionToken as string);
    }

    // Security headers
    res.setHeader('X-DNS-Prefetch-Control', 'on');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

    if (req.protocol === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    nextFn();
  });

  server.all('*', (req: Request, res: Response) => {
    return handle(req, res);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
