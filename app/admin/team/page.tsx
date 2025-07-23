
export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Mail, 
  Phone, 
  Linkedin,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'

export default async function TeamManagementPage() {
  const teamMembers = await prisma.teamMember.findMany({
    orderBy: {
      order: 'asc'
    }
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Beheer teamleden en hun informatie
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/team/new">
            <Plus className="mr-2 h-4 w-4" />
            Nieuw Teamlid
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Teamleden</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Teamleden</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter((member: any) => member.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactieve Teamleden</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter((member: any) => !member.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Teamleden</CardTitle>
          <CardDescription>
            Overzicht van alle teamleden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-lg font-semibold mb-2">Geen teamleden gevonden</div>
              <p className="text-muted-foreground mb-4">
                Voeg je eerste teamlid toe om te beginnen
              </p>
              <Button asChild>
                <Link href="/admin/team/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Nieuw Teamlid
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {member.imageUrl ? (
                        <Image
                          src={member.imageUrl}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{member.name}</h3>
                        <Badge variant={member.isActive ? "default" : "secondary"}>
                          {member.isActive ? 'Actief' : 'Inactief'}
                        </Badge>
                      </div>
                      <p className="text-sm text-blue-600 font-medium">{member.position}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {member.bio}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        {member.email && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                        {member.linkedinUrl && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Linkedin className="h-3 w-3" />
                            <span>LinkedIn</span>
                          </div>
                        )}
                      </div>
                      {member.expertise && member.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.expertise.slice(0, 3).map((skill: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.expertise.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.expertise.length - 3} meer
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/admin/team/${member.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
