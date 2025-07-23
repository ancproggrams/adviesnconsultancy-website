
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search,
  HelpCircle,
  ChevronRight,
  Users,
  FileText,
  Shield,
  Settings
} from 'lucide-react'
import { FaqSection } from '@/components/faq/faq-section'
import { FaqSearch } from '@/components/faq/faq-search'

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Veelgestelde Vragen
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Vind snel antwoorden op uw vragen over business continuïteit, compliance en onze diensten.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <FaqSearch />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Compliance</h3>
            <p className="text-sm text-muted-foreground">
              ISO 22301, GDPR, en andere compliance vragen
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">QuickScan</h3>
            <p className="text-sm text-muted-foreground">
              Vragen over onze BCM assessment tool
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Diensten</h3>
            <p className="text-sm text-muted-foreground">
              Informatie over onze consultancy diensten
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-4">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Implementatie</h3>
            <p className="text-sm text-muted-foreground">
              Vragen over project implementatie
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-8">
        <FaqSection 
          title="Compliance & Regelgeving"
          icon={<Shield className="h-5 w-5" />}
          faqs={[
            {
              question: "Wat is ISO 22301 en waarom is het belangrijk?",
              answer: "ISO 22301 is de internationale standaard voor Business Continuity Management Systems (BCMS). Het helpt organisaties om zich voor te bereiden op, te reageren op en te herstellen van verstorende incidenten. Het is belangrijk omdat het bedrijfsrisico's vermindert, de weerbaarheid verhoogt en vertrouwen van stakeholders vergroot."
            },
            {
              question: "Hoe lang duurt een ISO 22301 certificering?",
              answer: "Een ISO 22301 certificering duurt gemiddeld 6-12 maanden, afhankelijk van de grootte en complexiteit van uw organisatie. Dit omvat de voorbereidingsfase, implementatie, interne audits, management review en de externe certificering audit."
            },
            {
              question: "Welke sectoren zijn verplicht om BCM te implementeren?",
              answer: "Financiële instellingen, nutsbedrijven, zorginstellingen en kritieke infrastructuur hebben vaak wettelijke verplichtingen voor BCM. Echter, elke organisatie kan baat hebben bij een robuust business continuity plan."
            },
            {
              question: "Wat is het verschil tussen BCM en disaster recovery?",
              answer: "BCM (Business Continuity Management) is een holistische aanpak die alle aspecten van bedrijfscontinuïteit omvat, inclusief mensen, processen, technologie en faciliteiten. Disaster recovery richt zich specifiek op IT-herstel en is een onderdeel van BCM."
            }
          ]}
        />

        <FaqSection 
          title="BCM QuickScan"
          icon={<FileText className="h-5 w-5" />}
          faqs={[
            {
              question: "Wat is de BCM QuickScan en hoe werkt het?",
              answer: "De BCM QuickScan is een gratis online assessment tool die uw huidige BCM volwassenheid evalueert aan de hand van ISO 22301 criteria. Het bestaat uit 20 vragen verdeeld over 7 controlegebieden en duurt ongeveer 10-15 minuten om te voltooien."
            },
            {
              question: "Krijg ik direct mijn resultaten?",
              answer: "Ja, direct na het voltooien van de scan ontvangt u een gedetailleerd rapport met uw scores per controlegebied, uw volwassenheid niveau en specifieke aanbevelingen voor verbetering."
            },
            {
              question: "Kan ik de scan meerdere keren uitvoeren?",
              answer: "Ja, u kunt de QuickScan zo vaak uitvoeren als u wilt. Dit is handig om uw voortgang te monitoren na implementatie van verbeteringen."
            },
            {
              question: "Worden mijn gegevens veilig opgeslagen?",
              answer: "Ja, alle gegevens worden veilig opgeslagen conform GDPR-regelgeving. Uw gegevens worden alleen gebruikt voor het genereren van uw rapport en eventuele follow-up communicatie als u daar toestemming voor geeft."
            }
          ]}
        />

        <FaqSection 
          title="Diensten & Consultancy"
          icon={<Users className="h-5 w-5" />}
          faqs={[
            {
              question: "Welke diensten biedt Advies N Consultancy?",
              answer: "Wij bieden uitgebreide BCM consultancy diensten inclusief gap analyses, beleidsontwerp, implementatie ondersteuning, training en coaching, audit ondersteuning en compliance monitoring. Ook bieden wij AI-automatisering en digitale transformatie diensten."
            },
            {
              question: "Hoe bepalen jullie de kosten van een project?",
              answer: "Onze tarieven zijn gebaseerd op de complexiteit van uw organisatie, gewenste scope, en tijdsduur van het project. Na een intake gesprek maken wij een op maat gemaakte offerte. Neem contact op voor een vrijblijvende kostenraming."
            },
            {
              question: "Bieden jullie ook training aan medewerkers?",
              answer: "Ja, wij verzorgen BCM awareness trainingen, workshops voor crisis teams, en gespecialiseerde training voor BCM coördinatoren. Trainingen kunnen zowel on-site als online worden gegeven."
            },
            {
              question: "Hoe lang duurt een typisch BCM implementatie project?",
              answer: "Een volledige BCM implementatie duurt gemiddeld 6-12 maanden, afhankelijk van organisatiegrootte en complexiteit. Kleinere projecten zoals beleidsontwikkeling kunnen binnen 2-3 maanden worden afgerond."
            }
          ]}
        />

        <FaqSection 
          title="Implementatie & Ondersteuning"
          icon={<Settings className="h-5 w-5" />}
          faqs={[
            {
              question: "Hoe beginnen we met BCM implementatie?",
              answer: "We starten altijd met een intake gesprek en gap analyse om uw huidige situatie te begrijpen. Vervolgens maken we een implementatie roadmap met duidelijke mijlpalen, tijdlijnen en verantwoordelijkheden."
            },
            {
              question: "Kunnen jullie helpen met het opzetten van een crisis team?",
              answer: "Ja, we helpen bij het identificeren en trainen van crisis team leden, het opstellen van procedures, en het inrichten van communicatie structuren. We begeleiden ook bij het uitvoeren van crisis oefeningen."
            },
            {
              question: "Bieden jullie ondersteuning na implementatie?",
              answer: "Ja, we bieden verschillende ondersteuningsmodellen zoals periodieke reviews, management rapportages, bijscholing, en assistentie bij interne audits. Dit zorgt voor continuïteit en continue verbetering."
            },
            {
              question: "Hoe meten we het succes van BCM implementatie?",
              answer: "Succes wordt gemeten aan KPI's zoals incident response tijd, herstel tijd doelstellingen (RTO), business impact reductie, en medewerker awareness levels. We stellen samen met u relevante meetpunten vast."
            }
          ]}
        />
      </div>

      {/* Contact CTA */}
      <div className="mt-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <HelpCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">
              Staat uw vraag er niet bij?
            </h3>
            <p className="text-muted-foreground mb-6">
              Neem contact met ons op voor persoonlijk advies of om een vrijblijvend gesprek in te plannen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/adviesgesprek"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Plan een gesprek
                <ChevronRight className="h-4 w-4 ml-2" />
              </a>
              <a
                href="mailto:info@adviesnconsultancy.nl"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Email ons
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
