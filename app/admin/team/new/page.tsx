
export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import { NewTeamMemberForm } from '../_components/new-team-member-form'

export default function NewTeamMemberPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/team">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar Team
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nieuw Teamlid</h1>
          <p className="text-muted-foreground">
            Voeg een nieuw teamlid toe
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Teamlid Informatie</span>
          </CardTitle>
          <CardDescription>
            Vul alle vereiste informatie in voor het nieuwe teamlid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewTeamMemberForm />
        </CardContent>
      </Card>
    </div>
  )
}
