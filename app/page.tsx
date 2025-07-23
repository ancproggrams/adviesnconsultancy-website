

import { HeroSection } from '@/components/sections/hero-section'
import { SpecializationSection } from '@/components/sections/specialization-section'
import { PricingSection } from '@/components/sections/pricing-section'
import { ComplianceMetricsSection } from '@/components/sections/compliance-metrics-section'
import { CTASection } from '@/components/sections/cta-section'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <SpecializationSection />
      <PricingSection />
      <ComplianceMetricsSection />
      <CTASection />
    </div>
  )
}
