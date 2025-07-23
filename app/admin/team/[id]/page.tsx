
export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Users } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { EditTeamMemberForm } from '../_components/edit-team-member-form'

export default async function EditTeamMemberPage({ params }: { params: { id: string } }) {
  const teamMember = await prisma.teamMember.findUnique({
    where: {
      id: params.id
    }
  })

  if (!teamMember) {
    notFound()
  }

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
          <h1 className="text-3xl font-bold">Bewerk Teamlid</h1>
          <p className="text-muted-foreground">
            Bewerk {teamMember.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Teamlid Informatie</span>
          </CardTitle>
          <CardDescription>
            Bewerk de informatie van {teamMember.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditTeamMemberForm teamMember={teamMember} />
        </CardContent>
      </Card>
    </div>
  )
}
