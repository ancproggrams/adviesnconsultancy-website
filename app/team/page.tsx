import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Mail, 
  Phone, 
  Linkedin, 
  Award, 
  Users, 
  Calendar,
  MapPin
} from 'lucide-react'
import Image from 'next/image'
import { prisma } from '@/lib/db'

export default async function TeamPage() {
  // Fetch team members from database
  const teamMembers = await prisma.teamMember.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      order: 'asc'
    }
  })

  const companyStats = [
    { label: "Jaar ervaring", value: "15+", icon: Award },
    { label: "Team Members", value: teamMembers.length.toString(), icon: Users },
    { label: "Voltooide projecten", value: "500+", icon: Calendar },
    { label: "Landen", value: "5", icon: MapPin }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Ons Expert Team
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Ontmoet onze ervaren consultants die u helpen bij het implementeren van effectieve business continuity oplossingen.
        </p>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {companyStats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-6">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {teamMembers.map((member: any) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="relative w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {member.imageUrl ? (
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Users className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.position}</p>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {member.bio}
                  </p>
                  
                  {/* Contact Info */}
                  <div className="flex items-center gap-4 mb-4">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600"
                      >
                        <Mail className="h-4 w-4" />
                        <span className="hidden sm:inline">Email</span>
                      </a>
                    )}
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="hidden sm:inline">Bel</span>
                      </a>
                    )}
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span className="hidden sm:inline">LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Expertise */}
              {member.expertise && member.expertise.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill: any, skillIndex: number) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Company Culture */}
      <Card className="mb-16">
        <CardHeader>
          <CardTitle>Onze Werkwijze</CardTitle>
          <CardDescription>
            Wat ons onderscheidt als BCM consultancy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Klantgericht</h3>
              <p className="text-sm text-muted-foreground">
                Wij stellen uw specifieke behoeften en uitdagingen centraal in elke fase van het project.
              </p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Expertise</h3>
              <p className="text-sm text-muted-foreground">
                Onze consultants hebben jarenlange ervaring en zijn gecertificeerd in de nieuwste BCM standaarden.
              </p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Pragmatisch</h3>
              <p className="text-sm text-muted-foreground">
                Wij leveren praktische, implementeerbare oplossingen die direct waarde toevoegen aan uw organisatie.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <h3 className="text-2xl font-semibold mb-4">
              Klaar om te beginnen?
            </h3>
            <p className="text-muted-foreground mb-6">
              Neem contact op met ons team voor een vrijblijvend adviesgesprek over uw BCM uitdagingen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/adviesgesprek">
                  Plan een gesprek
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="mailto:info@adviesnconsultancy.nl">
                  Email ons
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
