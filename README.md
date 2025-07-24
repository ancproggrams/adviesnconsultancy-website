# 🏢 Advies & Consultancy Website

Een moderne, veilige business website gebouwd met Next.js 14, React 18, en TypeScript. De site biedt een volledig geïntegreerde consultancy platform met geavanceerde security features, admin dashboard, en geautomatiseerde dependency monitoring.

## ✨ Key Features

- **🎨 Modern UI/UX**: Responsive design met Tailwind CSS en Framer Motion animaties
- **🛡️ Enterprise Security**: Multi-layer beveiliging met rate limiting, XSS protection, en CSRF validation
- **👑 Admin Dashboard**: Volledig geïntegreerde content management met role-based access control
- **🤖 AI Chatbot Integration**: LLM-powered customer support via AbacusAI API
- **📊 Analytics & Monitoring**: Real-time performance tracking en security monitoring
- **🔍 Quick Scan Tool**: Interactive business assessment voor lead generation
- **📱 PWA Ready**: Progressive Web App met offline support
- **♿ Accessibility**: WCAG compliant met screen reader support

## 🔍 Automated Dependency Monitoring

Het project heeft uitgebreide dependency monitoring en security audits geconfigureerd voor maximale beveiliging en stabiliteit:

### 🤖 Dependabot Configuration

**Automatische Dependency Updates:**
- **Schedule**: Dagelijkse controle om 06:00 CET (Europa/Amsterdam timezone)
- **PR Limit**: Maximum 5 open pull requests tegelijk voor beheersbaarheid
- **Commit Messages**: Gestructureerd met `chore(deps)` prefix voor consistentie
- **Target Branch**: Alle updates naar `main` branch

**Smart Grouping Strategy:**
```yaml
react:            # React ecosystem (react, next, @types/react)
ui-components:    # UI libraries (@radix-ui, framer-motion, lucide-react)
dev-dependencies: # Development tools (@types, eslint, typescript, tailwindcss)
security:         # Security packages (next-auth, bcryptjs, jsonwebtoken)
```

**Advanced Configuration:**
- **Assignees & Reviewers**: Automatische toewijzing aan project maintainers
- **Rebase Strategy**: Automatische rebase voor conflict resolution
- **Dependency Types**: Both direct en indirect dependencies included
- **Version Control**: Major version updates voor stable packages ignored

### 🚀 Renovate Configuration

**Enhanced Dependency Management:**
Het project gebruikt **Renovate** als aanvulling op Dependabot voor geavanceerde dependency management met intelligente automerge regels en uitgebreide configuratiemogelijkheden.

**Scheduling Strategy:**
- **Schedule**: Avonden en weekends (na 22:00, voor 05:00, weekends)
- **Coordination**: Complementeert Dependabot (dagelijks 06:00) zonder overlap
- **Rate Limiting**: Max 3 PR's per uur, 5 gelijktijdig, 10 branches totaal
- **Stability**: 3-dagen minimum release age voor productie dependencies

**Smart Automerge Rules:**
```json
Production Dependencies:
  - patch/minor: ✅ Automerge (na 3 dagen stabiliteit)
  - major: ❌ Manual review vereist

Development Dependencies:  
  - patch: ✅ Automerge (na 1 dag stabiliteit)
  - minor/major: ❌ Manual review

Security Updates:
  - alle types: ✅ Immediate automerge (hoogste prioriteit)
```

**Advanced Package Rules:**
- **React Ecosystem**: Gecoördineerde updates op zondag (samen met Dependabot)
- **UI Components**: Gegroepeerde updates (@radix-ui, framer-motion, lucide-react)
- **TypeScript/Linting**: Vrijdag avond updates voor weekend testing
- **Database/ORM**: 7-dagen stabiliteit, altijd manual review
- **Security Packages**: Onmiddellijke updates met vulnerability alerts

**Intelligent Grouping:**
```yaml
UI Components:     # @radix-ui/*, framer-motion, lucide-react
TypeScript & Linting: # @types/*, eslint, typescript, @typescript-eslint/*
Testing Tools:     # jest, @testing-library/*, cypress, playwright
Lock File Maintenance: # Maandag ochtend (voor 05:00)
```

### 🔄 Renovate vs Dependabot Comparison

| Aspect | **Dependabot** | **Renovate** |
|--------|----------------|--------------|
| **Scheduling** | ⭐ Dagelijks 06:00 CET | ⭐ Avonden/weekends |
| **Automerge** | ❌ Geen native support | ✅ Geavanceerde regels |
| **Grouping** | ✅ Basis grouping | ⭐ Intelligente grouping |
| **Stability** | ❌ Geen release age check | ✅ Configureerbare stabiliteit |
| **Security** | ✅ GitHub security alerts | ⭐ OSV + GitHub alerts |
| **Configuration** | ✅ YAML-based (.github/) | ⭐ JSON schema validation |
| **Ecosystem** | ✅ Native GitHub integration | ✅ Multi-platform support |
| **Customization** | ⭐ GitHub-optimized | ⭐ Highly customizable |

**Waarom Beide Systemen?**

**Dependabot Voordelen:**
- 🔐 **Native GitHub Security**: Directe integratie met GitHub Security tab
- 🚀 **Reliable & Fast**: Bewezen track record en snelle updates  
- 📋 **Simple Configuration**: Eenvoudige YAML configuratie in .github/
- 🛡️ **Security Focus**: Prioriteit op security alerts en vulnerability patches

**Renovate Voordelen:**
- 🤖 **Intelligent Automerge**: Geavanceerde regels gebaseerd op update type
- ⏰ **Flexible Scheduling**: Complexe scheduling met timezone support
- 📊 **Dependency Dashboard**: Uitgebreide visibility en management UI
- 🔧 **Advanced Customization**: Regex managers, custom rules, en workflows
- 📈 **Release Stability**: Minimum age checks voor productie-ready updates
- 🔍 **Better Grouping**: Semantische grouping van gerelateerde dependencies

### 🔧 Integration Guidelines

**Conflict Prevention:**
- **Time Separation**: Dependabot (06:00), Renovate (22:00-05:00)
- **Different Strengths**: Dependabot voor security, Renovate voor automation
- **Coordinated Updates**: React ecosystem updates op vaste tijden
- **Branch Management**: Verschillende branch prefixes (`dependabot/` vs `renovate/`)

**Maintainer Workflow:**

**Daily (06:00-09:00):**
1. Review Dependabot security updates (hoogste prioriteit)
2. Check GitHub Security tab voor vulnerability alerts
3. Manual merge van critical security patches

**Weekly (Maandag ochtend):**
1. Review Renovate dependency dashboard
2. Approve/merge accumulated minor updates
3. Review major version updates in batches
4. Check lock file maintenance results

**Emergency Protocol:**
1. **Critical Security**: Beide systemen triggeren immediate updates
2. **Breaking Changes**: Manual review altijd vereist voor major versions
3. **Failed Updates**: Automatic rollback en incident creation
4. **Dependency Conflicts**: Manual resolution met priority op security

**Best Practices:**

**Voor Developers:**
```bash
# Check dependency status
npm audit
npm outdated

# Review Renovate dashboard
# → GitHub repository → Insights → Dependency graph → Dependabot/Renovate

# Test updates locally
npm ci
npm run build
npm run test
```

**Voor Maintainers:**
```bash
# Enable/disable Renovate
# Edit renovate.json → "enabled": false

# Emergency dependency freeze
# Add to renovate.json → "ignorePresets": [":all"]

# Override automerge temporarily  
# Label PR met "renovate:stop-updating"
```

### 🛡️ Security Workflows

#### 1. Dependency Security Audit (`dependency-audit.yml`)

**Comprehensive Security Scanning:**
- **Multi-Node Testing**: Parallel testing op Node.js 16, 18, en 20
- **Vulnerability Assessment**: NPM audit met configureerbare severity levels
- **Package Health Check**: Dependency count, deprecation warnings, en metrics
- **Fix Suggestions**: Automated remediation recommendations
- **Outdated Analysis**: Package versioning en update recommendations

**Execution Schedule:**
- **Weekly**: Elke maandag om 08:00 CET voor consistent review
- **On Push**: Automatische scan bij dependency file changes
- **Pull Requests**: Security feedback op alle PR's met dependency changes
- **Manual Trigger**: On-demand scans met configureerbare audit levels

**Advanced Features:**
```yaml
Audit Levels:
  - low:      Alle kwetsbaarheden (inclusief informatief)
  - moderate: Standaard niveau (matige+ severity)
  - high:     Alleen hoge en kritieke kwetsbaarheden  
  - critical: Alleen kritieke kwetsbaarheden (blocking)
```

**Artifact Generation:**
- JSON reports voor programmatic analysis
- Human-readable summaries voor quick review
- Fix suggestions met impact assessment
- Package health metrics en dependency graphs
- Comprehensive markdown reports voor documentation

#### 2. CodeQL Security Analysis (`codeql-analysis.yml`)

**Static Code Analysis:**
- **Languages**: JavaScript en TypeScript comprehensive scanning
- **Query Sets**: `security-extended` en `security-and-quality` rulesets
- **SARIF Integration**: Results direct naar GitHub Security tab
- **Schedule**: Wekelijkse deep scan elke dinsdag om 04:00 UTC

**Analysis Coverage:**
- Security vulnerabilities in source code
- Code quality issues en technical debt
- Best practice violations en anti-patterns
- Potential injection points en XSS vulnerabilities
- Authentication en authorization flaws

#### 3. Comprehensive Security Scanning (`security-scanning.yml`)

**Multi-Layer Security Approach:**

**Secret Detection:**
- **TruffleHog Integration**: Credential en API key scanning
- **Git History Analysis**: Full repository history scan
- **Verified Secrets Only**: Focus op confirmed security issues
- **Debug Mode**: Detailed logging voor troubleshooting

**OWASP Dependency Check:**
- **CVE Database**: Known vulnerability matching
- **Multiple Formats**: JSON, XML, HTML, CSV reporting
- **Retired Dependencies**: Detection van deprecated packages
- **Experimental Features**: Latest security detection methods

**Advanced Reporting:**
- **PR Comments**: Automated security feedback op pull requests
- **Artifact Storage**: 30-day retention voor audit trails
- **Security Summary**: Executive-level security status reports
- **Trend Analysis**: Historical security posture tracking

### 📊 Security Reporting & Analytics

**Comprehensive Audit Reports Include:**

**Vulnerability Metrics:**
- Total vulnerability count per severity level
- New vulnerabilities sinds laatste scan
- Fixed vulnerabilities tracking
- Mean time to resolution (MTTR)
- Security posture trend analysis

**Package Health Metrics:**
- Total dependency count (direct + indirect)
- Deprecated package identification
- Outdated package analysis met update recommendations
- License compliance checking
- Maintenance status en community health scores

**Security Assessment Features:**
- Risk scoring algorithm voor prioritization
- Impact assessment voor business continuity
- Compliance reporting voor audit requirements
- Security debt tracking en technical debt analysis
- Automated escalation voor critical issues

**Artifact Management:**
- **Retention Policy**: 30 dagen voor audit compliance
- **Export Formats**: JSON, CSV, PDF voor verschillende stakeholders
- **Historical Tracking**: Long-term trend analysis
- **Integration Ready**: API endpoints voor external tools

### 🔧 Configuration Management

**Environment-Specific Settings:**

**Development Environment:**
```bash
# Local development dependency audit
npm audit --audit-level=low --json
npm outdated --depth=0
```

**Production Environment:**
```bash
# Production security scanning
npm audit --audit-level=moderate --production
npm ci --audit=true --fund=false
```

**CI/CD Integration:**
```yaml
# Workflow triggers optimized voor efficiency
on:
  schedule: [cron: '0 6 * * 1']  # Weekly Monday 08:00 CET
  push: [branches: main, paths: ['package*.json', 'yarn.lock']]
  pull_request: [branches: main, paths: dependency files]
  workflow_dispatch: [manual trigger met audit level selection]
```

### 📋 Maintenance Guidelines

**Weekly Security Review Process:**

**Monday - Dependency Audit Review:**
1. Review automated dependency audit results
2. Prioritize high/critical vulnerability fixes
3. Assess impact van recommended updates
4. Plan security update deployment schedule

**Tuesday - Code Security Analysis:**
1. Review CodeQL analysis results in Security tab
2. Triage new security findings
3. Create issues voor confirmed vulnerabilities
4. Update security documentation

**Wednesday - Comprehensive Security Scan:**
1. Review OWASP dependency check results
2. Analyze secret scanning findings
3. Validate TruffleHog alerts
4. Update security policies if needed

**Ongoing - Dependabot PR Management:**
1. **Low Risk**: Auto-merge na automated tests pass
2. **Medium Risk**: Manual review + testing in staging
3. **High Risk**: Full security assessment + stakeholder approval
4. **Critical**: Immediate escalation + emergency patch process

**Critical Vulnerability Response Procedure:**

**Immediate Actions (Within 1 hour):**
1. **Detection**: Automated workflow failure notification
2. **Assessment**: Impact analysis on production systems
3. **Containment**: Block deployment pipeline if necessary
4. **Communication**: Notify stakeholders via emergency channels

**Short-term Actions (Within 24 hours):**
1. **Investigation**: Root cause analysis en affected components
2. **Remediation**: Apply security patches of workarounds
3. **Testing**: Comprehensive security testing in staging
4. **Documentation**: Update incident response documentation

**Long-term Actions (Within 1 week):**
1. **Post-mortem**: Lessons learned en process improvements
2. **Prevention**: Update security policies en monitoring rules
3. **Training**: Team education on new security threats
4. **Monitoring**: Enhanced monitoring voor similar issues

### 🚀 Performance Optimization

**Build Performance:**
- **Caching Strategy**: Intelligent node_modules caching across workflow runs
- **Parallel Execution**: Matrix builds voor multi-version testing
- **Selective Triggers**: Smart path-based triggering om onnodige runs te voorkomen
- **Resource Optimization**: Memory en CPU usage optimization

**Storage Management:**
- **Artifact Compression**: Reduced storage costs via intelligent compression
- **Retention Policies**: Automated cleanup voor old artifacts
- **Selective Storage**: Only critical artifacts preserved long-term
- **Cost Optimization**: GitHub Actions minutes en storage optimization

## 🏗️ Tech Stack

### Core Framework
- **Frontend**: Next.js 14 (App Router) + React 18
- **Language**: TypeScript 5.2+ met strict mode
- **Styling**: Tailwind CSS 3.3+ met custom design system
- **Animations**: Framer Motion voor smooth interactions

### UI Components
- **Component Library**: Radix UI primitives
- **Icons**: Lucide React icon library
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts voor data visualization
- **Date Handling**: date-fns voor date manipulation

### Security & Authentication
- **Authentication**: NextAuth.js v4 met Prisma adapter
- **Database ORM**: Prisma 6.7 met PostgreSQL
- **Password Hashing**: bcryptjs voor secure password storage
- **Session Management**: JWT tokens met secure cookies
- **Rate Limiting**: Redis-based rate limiting

### AI & APIs
- **LLM Integration**: AbacusAI API voor chatbot functionality
- **API Routes**: Next.js API routes met comprehensive validation
- **File Processing**: PDF, DOCX, image processing capabilities
- **Real-time Features**: Server-Sent Events voor live updates

### Development Tools
- **Package Manager**: Yarn v1 (klassiek) voor dependency management
- **Code Quality**: ESLint + Prettier met custom rules
- **Type Checking**: TypeScript strict mode
- **Git Hooks**: Husky voor pre-commit validation
- **Testing**: Comprehensive test setup ready

## 🛡️ Security Architecture

### Multi-Layer Security Implementation

**Layer 1: Network Security**
- HTTPS-only communication met HSTS headers
- Content Security Policy (CSP) headers
- CORS configuration voor API endpoints
- Rate limiting per IP address en user session

**Layer 2: Application Security**
- Input validation met Zod schemas
- XSS protection via content sanitization
- SQL injection prevention via Prisma ORM
- CSRF token validation voor state-changing operations

**Layer 3: Authentication & Authorization**
- Multi-factor authentication (2FA) support
- Role-based access control (RBAC)
- Session timeout en automatic logout
- Account lockout na failed login attempts

**Layer 4: Data Security**
- Database encryption at rest
- Sensitive data masking in logs
- GDPR-compliant data handling
- Audit trail voor all admin actions

**Layer 5: Monitoring & Response**
- Real-time security monitoring
- Automated threat detection
- Incident response automation
- Security metrics dashboard

### Security Headers Configuration
```typescript
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  // ... additional security headers
];
```

## 🚀 Deployment & Infrastructure

### Production Environment
- **Platform**: Vercel (recommended) of custom server deployment
- **Domain**: https://www.adviesnconsultancy.nl
- **Database**: PostgreSQL met connection pooling
- **CDN**: Automatic asset optimization via Vercel
- **Monitoring**: Real-time performance en error tracking

### Environment Variables
```bash
# Authentication
NEXTAUTH_URL=https://www.adviesnconsultancy.nl
NEXTAUTH_SECRET=[secure-random-string]

# Database
DATABASE_URL=[postgresql-connection-string]

# AI Integration
ABACUSAI_API_KEY=[api-key]

# Application
NEXT_PUBLIC_BASE_URL=https://www.adviesnconsultancy.nl
API_URL=https://www.adviesnconsultancy.nl/api
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database schema migrated
- [ ] Admin user seeded
- [ ] Security headers verified
- [ ] Performance monitoring enabled
- [ ] Error tracking configured
- [ ] Backup procedures tested
- [ ] Security audit passed

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- PostgreSQL 14+ database
- Yarn package manager
- Git voor version control

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/ancproggrams/adviesnconsultancy-website.git
cd adviesnconsultancy-website

# 2. Install dependencies
yarn install

# 3. Environment setup
cp .env.example .env.local
# Edit .env.local met your configuration

# 4. Database setup
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. Start development server
yarn dev
```

### Available Scripts
```bash
yarn dev          # Start development server
yarn build        # Build production version
yarn start        # Start production server
yarn lint         # Run ESLint
yarn type-check   # Run TypeScript checker
yarn db:migrate   # Run database migrations
yarn db:seed      # Seed database met test data
yarn security:audit # Run security audit
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── (public)/          # Public pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── sections/         # Page sections
├── lib/                  # Utility libraries
│   ├── auth/             # Authentication logic
│   ├── security/         # Security utilities
│   └── utils.ts          # General utilities
├── prisma/               # Database schema
├── public/               # Static assets
├── scripts/              # Database seeds & utilities
└── .github/              # GitHub workflows & config
```

## 🤝 Contributing

### Development Workflow
1. **Fork** het repository
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'feat: add amazing feature'`
4. **Push branch**: `git push origin feature/amazing-feature`
5. **Create Pull Request** met detailed description

### Code Standards
- **TypeScript**: Strict mode enabled, no implicit any
- **ESLint**: Custom rules voor code quality
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Structured commit messages
- **Security**: All contributions must pass security audit

### Testing Requirements
- **Unit Tests**: Critical business logic coverage
- **Integration Tests**: API endpoint validation
- **Security Tests**: Input validation en auth flows
- **Performance Tests**: Core user journey optimization

## 📊 Performance Metrics

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms

### Security Metrics
- **Vulnerability Response Time**: < 24 hours voor critical
- **Security Audit Frequency**: Weekly automated scans
- **Dependency Updates**: 95% within 7 days
- **Security Score**: Maintain A+ rating

## 📞 Support & Contact

### Admin Access
- **Admin URL**: https://www.adviesnconsultancy.nl/admin/login
- **Test Account**: john@doe.com / johndoe123 (development only)

### Development Support
- **Repository**: https://github.com/ancproggrams/adviesnconsultancy-website
- **Documentation**: Available in `/docs` directory
- **Issue Tracking**: GitHub Issues voor bug reports
- **Security Issues**: security@adviesnconsultancy.nl

### Emergency Contacts
- **Critical Security Issues**: Immediate escalation procedures
- **Production Outages**: 24/7 monitoring en response
- **Data Incidents**: GDPR compliance procedures

---

**Built with ❤️ voor modern, secure, en performant web experiences.**

**Last Updated**: January 2024 | **Version**: 2.0.0 | **Security Level**: Enterprise
