
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { CustomerDashboard } from '@/components/customer-portal/customer-dashboard'
import { CustomerLoginForm } from '@/components/customer-portal/customer-login-form'

export default async function CustomerPortalPage() {
  const session = await getServerSession()
  
  // For now, we'll show a login form - in a real app, this would check for customer authentication
  const isCustomerLoggedIn = false // This would check customer session

  if (!isCustomerLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <CustomerLoginForm />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CustomerDashboard />
    </div>
  )
}
