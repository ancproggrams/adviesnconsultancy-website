
import { PrismaClient } from '@prisma/client'
import { BlogUtils } from '../lib/blog-utils'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    // Clean existing data
    await prisma.blogPost.deleteMany()
    await prisma.blogCategory.deleteMany()
    await prisma.blogTag.deleteMany()
    await prisma.newsletterSubscriber.deleteMany()
    await prisma.socialMediaPost.deleteMany()

    // Create categories
    const categories = await Promise.all([
      prisma.blogCategory.create({
        data: {
          name: 'IT Trends',
          slug: 'it-trends',
          description: 'Laatste ontwikkelingen in IT landschap',
          color: '#60B5FF'
        }
      }),
      prisma.blogCategory.create({
        data: {
          name: 'Compliance',
          slug: 'compliance',
          description: 'AVG, NIS2, ISO en andere compliance onderwerpen',
          color: '#FF9149'
        }
      }),
      prisma.blogCategory.create({
        data: {
          name: 'AI & Automatisering',
          slug: 'ai-automatisering',
          description: 'Artificial Intelligence en automatisering',
          color: '#FF90BB'
        }
      }),
      prisma.blogCategory.create({
        data: {
          name: 'Business Continuity',
          slug: 'business-continuity',
          description: 'BCP, disaster recovery en continuïteit',
          color: '#80D8C3'
        }
      }),
      prisma.blogCategory.create({
        data: {
          name: 'Case Studies',
          slug: 'case-studies',
          description: 'Real-world implementaties en successen',
          color: '#A19AD3'
        }
      })
    ])

    // Create tags
    const tags = await Promise.all([
      prisma.blogTag.create({
        data: { name: 'NIS2', slug: 'nis2' }
      }),
      prisma.blogTag.create({
        data: { name: 'AVG', slug: 'avg' }
      }),
      prisma.blogTag.create({
        data: { name: 'Cloud', slug: 'cloud' }
      }),
      prisma.blogTag.create({
        data: { name: 'Security', slug: 'security' }
      }),
      prisma.blogTag.create({
        data: { name: 'AI', slug: 'ai' }
      }),
      prisma.blogTag.create({
        data: { name: 'Digitalisering', slug: 'digitalisering' }
      }),
      prisma.blogTag.create({
        data: { name: 'MKB', slug: 'mkb' }
      }),
      prisma.blogTag.create({
        data: { name: 'Strategie', slug: 'strategie' }
      }),
      prisma.blogTag.create({
        data: { name: 'Implementatie', slug: 'implementatie' }
      }),
      prisma.blogTag.create({
        data: { name: 'Best Practices', slug: 'best-practices' }
      })
    ])

    // Create blog posts
    const posts = [
      {
        title: 'NIS2 Richtlijn: Wat Nederlandse Bedrijven Moeten Weten',
        content: `
          <p>De NIS2 richtlijn staat voor een nieuwe fase in cybersecurity regelgeving binnen de EU. Als opvolger van de oorspronkelijke NIS-richtlijn uit 2016, brengt NIS2 strengere eisen en een bredere scope met zich mee.</p>
          
          <h2>Wat is NIS2?</h2>
          <p>De Network and Information Security Directive 2 (NIS2) is een EU-richtlijn die tot doel heeft het cybersecurity niveau in Europa te verhogen. De richtlijn moet uiterlijk 17 oktober 2024 in nationale wetgeving worden omgezet.</p>
          
          <h2>Belangrijkste Veranderingen</h2>
          <ul>
            <li><strong>Uitgebreide scope:</strong> Meer sectoren vallen onder de richtlijn</li>
            <li><strong>Lagere drempels:</strong> Kleinere bedrijven kunnen nu ook verplicht zijn</li>
            <li><strong>Strengere boetes:</strong> Tot 2% van de wereldwijde omzet</li>
            <li><strong>Management aansprakelijkheid:</strong> Persoonlijke verantwoordelijkheid voor bestuurders</li>
          </ul>
          
          <h2>Welke Bedrijven Zijn Verplicht?</h2>
          <p>NIS2 geldt voor organisaties in kritieke sectoren zoals:</p>
          <ul>
            <li>Energie (elektriciteit, gas, waterstof)</li>
            <li>Transport (lucht, rail, water, weg)</li>
            <li>Bancaire diensten</li>
            <li>Financiële marktinfrastructuur</li>
            <li>Gezondheidszorg</li>
            <li>Drinkwater</li>
            <li>Afvalwater</li>
            <li>Digitale infrastructuur</li>
            <li>ICT-dienstverlening</li>
            <li>Openbaar bestuur</li>
            <li>Ruimte</li>
          </ul>
          
          <h2>Praktische Stappen voor Compliance</h2>
          <h3>1. Bepaal of uw organisatie valt onder NIS2</h3>
          <p>Controleer of uw organisatie actief is in een van de genoemde sectoren en of u voldoet aan de criteria voor bedrijfsgrootte.</p>
          
          <h3>2. Voer een risicoanalyse uit</h3>
          <p>Identificeer alle kritieke IT-systemen en -processen in uw organisatie. Analyseer welke risico's er zijn voor cyberaanvallen en wat de impact zou zijn.</p>
          
          <h3>3. Implementeer beveiligingsmaatregelen</h3>
          <p>NIS2 vereist passende technische en organisatorische maatregelen, waaronder:</p>
          <ul>
            <li>Incident response procedures</li>
            <li>Business continuity planning</li>
            <li>Supply chain security</li>
            <li>Network security monitoring</li>
            <li>Multi-factor authentication</li>
            <li>Encryption</li>
          </ul>
          
          <h3>4. Stel governance procedures in</h3>
          <p>Zorg voor duidelijke verantwoordelijkheden en rapportagestructuren. Het management moet aantoonbaar betrokken zijn bij cybersecurity.</p>
          
          <h3>5. Bereid incidentrapportage voor</h3>
          <p>Organisaties moeten significante incidenten binnen 24 uur melden aan de autoriteiten, met een gedetailleerd rapport binnen 72 uur.</p>
          
          <h2>Ondersteuning bij NIS2 Compliance</h2>
          <p>De implementatie van NIS2 kan complex zijn. Advies N Consultancy helpt organisaties bij:</p>
          <ul>
            <li>Gap analyses en compliance assessments</li>
            <li>Ontwikkeling van cybersecurity policies</li>
            <li>Implementatie van technische maatregelen</li>
            <li>Training en awareness programma's</li>
            <li>Incident response planning</li>
          </ul>
          
          <p>Wacht niet tot het te laat is. Start nu met uw NIS2 compliance traject en bescherm uw organisatie tegen cyber dreigingen.</p>
        `,
        excerpt: 'De NIS2 richtlijn brengt strengere cybersecurity eisen voor Nederlandse bedrijven. Leer wat dit betekent voor uw organisatie en hoe u compliance kunt bereiken.',
        featuredImage: 'https://img.freepik.com/premium-photo/cybersecurity-professional-working-multiple-monitors-displaying-various-aiassisted-cyber-defens_997534-8367.jpg',
        categories: [categories[1].id], // Compliance
        tags: [tags[0].id, tags[3].id], // NIS2, Security
        publishedAt: new Date('2024-01-15'),
        viewCount: 245
      },
      {
        title: 'AI Transformatie in het MKB: 5 Praktische Stappen',
        content: `
          <p>Artificial Intelligence is niet langer voorbehouden aan grote tech-bedrijven. Ook het MKB kan enorm profiteren van AI-technologieën. Maar waar begin je als MKB-ondernemer?</p>
          
          <h2>Waarom AI voor het MKB?</h2>
          <p>AI kan MKB-bedrijven helpen om:</p>
          <ul>
            <li>Processen te automatiseren en efficiënter te maken</li>
            <li>Betere beslissingen te nemen op basis van data</li>
            <li>Klantenservice te verbeteren</li>
            <li>Kosten te besparen</li>
            <li>Concurrentievoordeel te behalen</li>
          </ul>
          
          <h2>5 Praktische Stappen voor AI Implementatie</h2>
          
          <h3>Stap 1: Identificeer Kansen</h3>
          <p>Begin met het identificeren van repetitieve taken en processen die veel tijd kosten. Denk aan:</p>
          <ul>
            <li>Administratieve taken</li>
            <li>Klantenservice vragen</li>
            <li>Data-entry en -verwerking</li>
            <li>Planning en scheduling</li>
            <li>Voorraadbeheer</li>
          </ul>
          
          <h3>Stap 2: Start Klein</h3>
          <p>Kies één specifiek proces of probleem om mee te beginnen. Succesvolle AI-implementaties starten vaak met:</p>
          <ul>
            <li>Chatbots voor basis klantenservice</li>
            <li>Geautomatiseerde email classificatie</li>
            <li>Voorspellende voorraadanalyse</li>
            <li>Automatische factuurverwerking</li>
          </ul>
          
          <h3>Stap 3: Kies de Juiste Tools</h3>
          <p>Er zijn vele AI-tools beschikbaar voor het MKB:</p>
          <ul>
            <li><strong>No-code platforms:</strong> Microsoft Power Platform, Zapier</li>
            <li><strong>CRM met AI:</strong> HubSpot, Salesforce</li>
            <li><strong>Chatbots:</strong> Intercom, Zendesk</li>
            <li><strong>Documentverwerking:</strong> Rossum, Mindee</li>
            <li><strong>Business Intelligence:</strong> Power BI, Tableau</li>
          </ul>
          
          <h3>Stap 4: Investeer in Data Kwaliteit</h3>
          <p>AI is zo goed als de data die je eraan geeft. Zorg voor:</p>
          <ul>
            <li>Schone, gestructureerde data</li>
            <li>Consistente data-invoer processen</li>
            <li>Regelmatige data audits</li>
            <li>Privacy en security compliance</li>
          </ul>
          
          <h3>Stap 5: Train je Team</h3>
          <p>Succesvolle AI-implementatie vereist dat je team:</p>
          <ul>
            <li>Begrijpt wat AI wel en niet kan</li>
            <li>Leert werken met nieuwe tools</li>
            <li>Weet hoe resultaten te interpreteren</li>
            <li>Betrokken is bij het implementatieproces</li>
          </ul>
          
          <h2>Veelgemaakte Fouten Vermijden</h2>
          <h3>Te Grote Verwachtingen</h3>
          <p>AI is geen toverstaf. Stel realistische verwachtingen en meet success op basis van concrete KPI's.</p>
          
          <h3>Technologie Eerst</h3>
          <p>Begin niet met technologie, maar met het probleem dat je wilt oplossen. De technologie moet het probleem ondersteunen, niet andersom.</p>
          
          <h3>Gebrek aan Data Strategie</h3>
          <p>Zonder goede data kan AI niet functioneren. Investeer eerst in data kwaliteit voordat je AI implementeert.</p>
          
          <h2>ROI van AI in het MKB</h2>
          <p>Onderzoek toont aan dat MKB-bedrijven die AI succesvol implementeren gemiddeld:</p>
          <ul>
            <li>15-25% tijdsbesparing realiseren</li>
            <li>10-20% kostenverlaging behalen</li>
            <li>20-30% verbetering in klanttevredenheid zien</li>
            <li>Sneller kunnen schalen</li>
          </ul>
          
          <h2>Hulp bij AI Implementatie</h2>
          <p>Advies N Consultancy ondersteunt MKB-bedrijven bij hun AI transformatie:</p>
          <ul>
            <li>AI readiness assessments</li>
            <li>Use case identificatie</li>
            <li>Tool selectie en implementatie</li>
            <li>Team training en change management</li>
            <li>Monitoring en optimalisatie</li>
          </ul>
          
          <p>Klaar om te beginnen met AI? Neem contact op voor een gratis AI opportunities scan.</p>
        `,
        excerpt: 'AI is toegankelijk voor het MKB. Ontdek hoe u stap voor stap AI kunt implementeren en uw bedrijfsprocessen kunt transformeren.',
        featuredImage: 'https://img.freepik.com/free-psd/robot-working-modern-office-with-real-people-generative-ai_587448-1863.jpg',
        categories: [categories[2].id], // AI & Automatisering
        tags: [tags[4].id, tags[5].id, tags[6].id], // AI, Digitalisering, MKB
        publishedAt: new Date('2024-01-12'),
        viewCount: 189
      },
      {
        title: 'Business Continuity Planning: Lessen uit de Praktijk',
        content: `
          <p>Business Continuity Planning (BCP) is cruciaal voor elke organisatie, maar hoe zorg je ervoor dat jouw plan daadwerkelijk werkt wanneer het erop aankomt?</p>
          
          <h2>Wat is Business Continuity Planning?</h2>
          <p>BCP is het proces waarbij organisaties procedures ontwikkelen om kritieke bedrijfsfuncties te beschermen en snel te herstellen na een verstoring. Het gaat verder dan alleen IT disaster recovery.</p>
          
          <h2>Kritieke Succesfactoren</h2>
          
          <h3>1. Begin met Risk Assessment</h3>
          <p>Identificeer alle mogelijke risico's en hun impact:</p>
          <ul>
            <li>Natuurrampen</li>
            <li>Cyberaanvallen</li>
            <li>Pandemieën</li>
            <li>Leveranciersuitval</li>
            <li>Personeelstekorten</li>
            <li>Technische storingen</li>
          </ul>
          
          <h3>2. Prioriteer Kritieke Processen</h3>
          <p>Niet alle processen zijn even kritiek. Maak onderscheid tussen:</p>
          <ul>
            <li><strong>Kritiek:</strong> Moet binnen uren hersteld zijn</li>
            <li><strong>Belangrijk:</strong> Kan enkele dagen wachten</li>
            <li><strong>Gewenst:</strong> Kan een week of langer wachten</li>
          </ul>
          
          <h3>3. Ontwikkel Realistische Scenario's</h3>
          <p>Maak concrete plannen voor verschillende scenario's:</p>
          <ul>
            <li>Uitval van primaire locatie</li>
            <li>Verlies van IT-systemen</li>
            <li>Uitval van key personnel</li>
            <li>Leveranciersketen verstoring</li>
          </ul>
          
          <h2>Praktische Implementatie Tips</h2>
          
          <h3>Documentatie</h3>
          <p>Zorg voor heldere, toegankelijke documentatie:</p>
          <ul>
            <li>Contactinformatie (24/7 bereikbaar)</li>
            <li>Stap-voor-stap procedures</li>
            <li>Escalatie procedures</li>
            <li>Externe leveranciers en partners</li>
          </ul>
          
          <h3>Communicatie</h3>
          <p>Ontwikkel een communicatieplan voor:</p>
          <ul>
            <li>Interne teams</li>
            <li>Klanten en leveranciers</li>
            <li>Stakeholders</li>
            <li>Media (indien nodig)</li>
          </ul>
          
          <h3>Technische Voorzieningen</h3>
          <p>Zorg voor redundantie in kritieke systemen:</p>
          <ul>
            <li>Backup datacenters</li>
            <li>Cloud redundancy</li>
            <li>Alternatieve communicatiekanalen</li>
            <li>Remote work capabilities</li>
          </ul>
          
          <h2>Case Study: Succesvolle BCP Implementatie</h2>
          <p>Een middelgrote logistiek dienstverlener implementeerde een BCP na een cyberaanval die hun systemen 3 dagen plat legde. Hun nieuwe plan omvatte:</p>
          
          <h3>Voorbereidingen</h3>
          <ul>
            <li>Offline backup procedures</li>
            <li>Alternatieve communicatiekanalen</li>
            <li>Handmatige processes als fallback</li>
            <li>Partnerships met concurrenten voor noodhulp</li>
          </ul>
          
          <h3>Resultaat</h3>
          <p>Toen een jaar later een ransomware aanval plaatsvond:</p>
          <ul>
            <li>Systemen waren binnen 4 uur weer online</li>
            <li>Klanten werden proactief geïnformeerd</li>
            <li>Geen verlies van kritieke data</li>
            <li>Minimale impact op de business</li>
          </ul>
          
          <h2>Testen is Essentieel</h2>
          <p>Een BCP plan dat niet getest is, is waardeloos. Organiseer regelmatig:</p>
          
          <h3>Tabletop Exercises</h3>
          <p>Bespreek scenario's met key stakeholders en loop door de procedures.</p>
          
          <h3>Simulation Tests</h3>
          <p>Voer realistische tests uit zonder echte impact op de business.</p>
          
          <h3>Full Scale Tests</h3>
          <p>Test het complete plan, inclusief failover naar backup systemen.</p>
          
          <h2>Veelgemaakte Fouten</h2>
          
          <h3>Te Technisch Gefocust</h3>
          <p>BCP gaat over mensen en processen, niet alleen technologie.</p>
          
          <h3>Plan en Vergeet</h3>
          <p>Plannen moeten regelmatig worden bijgewerkt en getest.</p>
          
          <h3>Onrealistisch Optimisme</h3>
          <p>Ga ervan uit dat alles wat mis kan gaan, ook mis zal gaan.</p>
          
          <h2>BCP Ondersteuning</h2>
          <p>Advies N Consultancy helpt organisaties bij:</p>
          <ul>
            <li>BCP strategy ontwikkeling</li>
            <li>Risk assessments</li>
            <li>Plan implementatie</li>
            <li>Test coordinatie</li>
            <li>Crisis management training</li>
          </ul>
          
          <p>Een goede BCP kan het verschil maken tussen overleven en faillissement. Investeer in uw bedrijfscontinuïteit voordat het te laat is.</p>
        `,
        excerpt: 'Business Continuity Planning kan uw bedrijf redden bij calamiteiten. Leer van praktijkvoorbeelden hoe u een effectief BCP plan ontwikkelt.',
        featuredImage: 'https://www.alignedtg.com/wp-content/uploads/2024/06/Disaster-Recovery-.png',
        categories: [categories[3].id], // Business Continuity
        tags: [tags[7].id, tags[8].id], // Strategie, Implementatie
        publishedAt: new Date('2024-01-10'),
        viewCount: 156
      },
      {
        title: 'Cloud-First Strategie: Waarom en Hoe?',
        content: `
          <p>Steeds meer organisaties kiezen voor een cloud-first strategie. Maar wat houdt dit precies in en hoe implementeer je dit succesvol?</p>
          
          <h2>Wat is Cloud-First?</h2>
          <p>Een cloud-first strategie betekent dat de cloud de standaard keuze is voor nieuwe IT-investeringen. Voor elke nieuwe applicatie, systeem of service wordt eerst gekeken naar cloud-oplossingen.</p>
          
          <h2>Voordelen van Cloud-First</h2>
          
          <h3>Schaalbaarheid</h3>
          <p>Cloud-services kunnen snel op- en afgeschaald worden naar behoefte.</p>
          
          <h3>Kostenefficiëntie</h3>
          <p>Geen grote voorinvesteringen, betaal alleen voor wat je gebruikt.</p>
          
          <h3>Flexibiliteit</h3>
          <p>Snel nieuwe services uitrollen en aanpassen aan veranderende behoeften.</p>
          
          <h3>Veiligheid</h3>
          <p>Cloud providers investeren meer in security dan de meeste organisaties kunnen.</p>
          
          <h2>Implementatie Strategie</h2>
          
          <h3>Fase 1: Assessment</h3>
          <ul>
            <li>Huidige IT landscape in kaart brengen</li>
            <li>Cloud readiness beoordelen</li>
            <li>Kosten-baten analyse</li>
            <li>Risico assessment</li>
          </ul>
          
          <h3>Fase 2: Migratie Planning</h3>
          <ul>
            <li>Prioritering van applicaties</li>
            <li>Migratie roadmap</li>
            <li>Change management plan</li>
            <li>Training requirements</li>
          </ul>
          
          <h3>Fase 3: Executie</h3>
          <ul>
            <li>Pilot projecten</li>
            <li>Gefaseerde migratie</li>
            <li>Monitoring en optimalisatie</li>
            <li>Governance implementatie</li>
          </ul>
          
          <h2>Veelgemaakte Fouten</h2>
          
          <h3>Lift and Shift</h3>
          <p>Oude applicaties één-op-één naar de cloud verplaatsen zonder optimalisatie.</p>
          
          <h3>Vendor Lock-in</h3>
          <p>Te afhankelijk worden van één cloud provider.</p>
          
          <h3>Security Afterthought</h3>
          <p>Security niet vanaf het begin meenemen in de planning.</p>
          
          <h2>Cloud Security</h2>
          <p>Belangrijk om te beseffen:</p>
          <ul>
            <li>Shared responsibility model</li>
            <li>Identity and access management</li>
            <li>Data encryption</li>
            <li>Compliance requirements</li>
          </ul>
          
          <h2>Succesfactoren</h2>
          
          <h3>Executive Sponsorship</h3>
          <p>Zorg voor commitment van de top.</p>
          
          <h3>Skills Development</h3>
          <p>Investeer in training van je team.</p>
          
          <h3>Governance</h3>
          <p>Stel duidelijke regels op voor cloud gebruik.</p>
          
          <h3>Monitoring</h3>
          <p>Houd kosten en performance goed in de gaten.</p>
          
          <p>Een cloud-first strategie kan transformatief zijn voor je organisatie. Maar zorg voor een goede planning en begeleiding om maximaal te profiteren van de mogelijkheden.</p>
        `,
        excerpt: 'Cloud-first strategieën transformeren hoe organisaties IT inzetten. Ontdek de voordelen, valkuilen en succesfactoren voor een succesvolle cloud transitie.',
        featuredImage: 'https://img.freepik.com/premium-photo/infrastructure-cloud-computing-servers-data-centers-connected-by-fiber-optics-concept-cloud-computing-infrastructure-servers-data-centers-fiber-optics_918839-77759.jpg?w=2000',
        categories: [categories[0].id], // IT Trends
        tags: [tags[2].id, tags[5].id, tags[7].id], // Cloud, Digitalisering, Strategie
        publishedAt: new Date('2024-01-08'),
        viewCount: 134
      },
      {
        title: 'AVG Compliance: Praktische Gids voor 2024',
        content: `
          <p>Zes jaar na de invoering van de AVG worstelen nog steeds veel organisaties met compliance. Deze praktische gids helpt u op weg.</p>
          
          <h2>AVG Basics: Wat U Moet Weten</h2>
          <p>De Algemene Verordening Gegevensbescherming (AVG) regelt hoe organisaties omgaan met persoonsgegevens van EU-burgers.</p>
          
          <h2>Belangrijkste Principes</h2>
          
          <h3>1. Rechtmatigheid</h3>
          <p>U moet een geldige rechtsgrond hebben voor het verwerken van persoonsgegevens.</p>
          
          <h3>2. Doelbinding</h3>
          <p>Gegevens mogen alleen gebruikt worden voor het doel waarvoor ze zijn verzameld.</p>
          
          <h3>3. Minimalisatie</h3>
          <p>Verzamel alleen gegevens die nodig zijn voor het doel.</p>
          
          <h3>4. Juistheid</h3>
          <p>Zorg dat gegevens correct en up-to-date zijn.</p>
          
          <h3>5. Beperkte Bewaring</h3>
          <p>Bewaar gegevens niet langer dan nodig.</p>
          
          <h3>6. Beveiliging</h3>
          <p>Beveilig gegevens adequaat tegen verlies of misbruik.</p>
          
          <h2>Praktische Implementatie</h2>
          
          <h3>Stap 1: Data Mapping</h3>
          <p>Breng in kaart welke persoonsgegevens u verwerkt:</p>
          <ul>
            <li>Welke gegevens verzamelt u?</li>
            <li>Waar komen ze vandaan?</li>
            <li>Hoe worden ze gebruikt?</li>
            <li>Wie heeft toegang?</li>
            <li>Hoe lang worden ze bewaard?</li>
          </ul>
          
          <h3>Stap 2: Rechtsgronden Vaststellen</h3>
          <p>Voor elke verwerkingsactiviteit moet u een rechtsgrond hebben:</p>
          <ul>
            <li>Toestemming</li>
            <li>Uitvoering overeenkomst</li>
            <li>Wettelijke verplichting</li>
            <li>Vitaal belang</li>
            <li>Algemeen belang</li>
            <li>Gerechtvaardigd belang</li>
          </ul>
          
          <h3>Stap 3: Privacy Beleid</h3>
          <p>Ontwikkel een helder privacy beleid dat uitlegt:</p>
          <ul>
            <li>Welke gegevens u verzamelt</li>
            <li>Waarom u ze verzamelt</li>
            <li>Hoe u ze gebruikt</li>
            <li>Met wie u ze deelt</li>
            <li>Hoe lang u ze bewaart</li>
            <li>Welke rechten betrokkenen hebben</li>
          </ul>
          
          <h3>Stap 4: Procedures voor Betrokkenenrechten</h3>
          <p>Zorg voor procedures om te reageren op:</p>
          <ul>
            <li>Inzageverzoeken</li>
            <li>Correctieverzoeken</li>
            <li>Verwijderverzoeken</li>
            <li>Bezwaren tegen verwerking</li>
            <li>Overdraagbaarheidsverzoeken</li>
          </ul>
          
          <h3>Stap 5: Beveiliging</h3>
          <p>Implementeer technische en organisatorische maatregelen:</p>
          <ul>
            <li>Toegangscontroles</li>
            <li>Encryptie</li>
            <li>Backup procedures</li>
            <li>Logging en monitoring</li>
            <li>Awareness training</li>
          </ul>
          
          <h2>Veelgemaakte Fouten</h2>
          
          <h3>Onduidelijke Rechtsgronden</h3>
          <p>Vaak is niet duidelijk op welke rechtsgrond gegevens worden verwerkt.</p>
          
          <h3>Te Lange Bewaring</h3>
          <p>Gegevens worden vaak langer bewaard dan nodig.</p>
          
          <h3>Onvoldoende Beveiliging</h3>
          <p>Beveiligingsmaatregelen zijn niet adequaat voor de risico's.</p>
          
          <h3>Geen Procedures</h3>
          <p>Er zijn geen procedures voor het afhandelen van betrokkenenrechten.</p>
          
          <h2>Data Breach Procedures</h2>
          <p>Bij een datalek moet u:</p>
          <ul>
            <li>Binnen 72 uur melden bij de AP</li>
            <li>Betrokkenen informeren bij hoog risico</li>
            <li>Het lek documenteren</li>
            <li>Maatregelen nemen om verdere schade te voorkomen</li>
          </ul>
          
          <h2>AVG Compliance Checklist</h2>
          <ul>
            <li>□ Data mapping uitgevoerd</li>
            <li>□ Rechtsgronden vastgesteld</li>
            <li>□ Privacy beleid opgesteld</li>
            <li>□ Procedures voor betrokkenenrechten</li>
            <li>□ Beveiligingsmaatregelen geïmplementeerd</li>
            <li>□ Data breach procedures</li>
            <li>□ Training voor medewerkers</li>
            <li>□ Verwerkingsregister bijgehouden</li>
          </ul>
          
          <h2>Hulp bij AVG Compliance</h2>
          <p>Advies N Consultancy ondersteunt bij:</p>
          <ul>
            <li>AVG gap analyses</li>
            <li>Privacy impact assessments</li>
            <li>Beleidsontwikkeling</li>
            <li>Implementatie ondersteuning</li>
            <li>Training en awareness</li>
          </ul>
          
          <p>AVG compliance is een proces, geen eindpunt. Houd uw procedures up-to-date en zorg voor continue verbetering.</p>
        `,
        excerpt: 'Zes jaar na de AVG invoering worstelen veel organisaties nog met compliance. Deze praktische gids helpt u stap voor stap op weg.',
        featuredImage: 'https://www.i-scoop.eu/wp-content/uploads/2017/02/EU-General-Data-Protection-Regulation-summary-of-some-key-GDPR-changes-attention-read-the-details.jpg',
        categories: [categories[1].id], // Compliance
        tags: [tags[1].id, tags[3].id, tags[9].id], // AVG, Security, Best Practices
        publishedAt: new Date('2024-01-05'),
        viewCount: 201
      }
    ]

    // Create blog posts with relationships
    for (const postData of posts) {
      const { categories, tags, ...post } = postData
      
      const createdPost = await prisma.blogPost.create({
        data: {
          ...post,
          slug: BlogUtils.generateSlug(post.title),
          metaTitle: post.title,
          metaDescription: post.excerpt,
          keywords: BlogUtils.generateSEOKeywords(post.title, post.content),
          categories: {
            connect: categories.map(id => ({ id }))
          },
          tags: {
            connect: tags.map(id => ({ id }))
          }
        }
      })
      
      console.log(`✅ Created blog post: ${createdPost.title}`)
    }

    // Create sample newsletter subscribers
    const subscribers = [
      {
        email: 'jan.van.der.berg@techbedrijf.nl',
        name: 'Jan van der Berg',
        company: 'TechBedrijf B.V.',
        preferences: ['IT-trends', 'AI-insights'],
        source: 'website',
        leadScore: 25
      },
      {
        email: 'maria.de.jong@consultancy.nl',
        name: 'Maria de Jong',
        company: 'Consultancy Partners',
        preferences: ['Compliance', 'Business-continuity'],
        source: 'blog-post',
        leadScore: 35
      },
      {
        email: 'peter.janssen@mkb.nl',
        name: 'Peter Janssen',
        company: 'MKB Solutions',
        preferences: ['IT-trends', 'Compliance', 'AI-insights'],
        source: 'kenniscentrum',
        leadScore: 45
      }
    ]

    for (const subscriber of subscribers) {
      await prisma.newsletterSubscriber.create({
        data: subscriber
      })
      console.log(`✅ Created newsletter subscriber: ${subscriber.email}`)
    }

    // Create sample social media posts
    const socialPosts = [
      {
        platform: 'LINKEDIN',
        postId: 'li-post-nis2-2024',
        content: 'Nieuwe blog post over NIS2 compliance en wat dit betekent voor Nederlandse bedrijven. 🛡️ De deadline nadert snel - bent u er klaar voor? #NIS2 #Compliance #CyberSecurity',
        url: 'https://i.ytimg.com/vi/HbfNc0VyUcY/maxresdefault.jpg',
        imageUrl: 'https://www.slideteam.net/wp/wp-content/uploads/2022/12/Cybersecurity-Dashboard-with-Risk-and-Compliance.png',
        publishedAt: new Date('2024-01-16'),
        engagements: 28
      },
      {
        platform: 'LINKEDIN',
        postId: 'li-post-ai-mkb-2024',
        content: 'AI transformatie in het MKB: Het is niet meer de vraag ÓF, maar WANNEER. 5 praktische stappen om te beginnen met AI in je bedrijf. 🤖 #AI #MKB #Digitalisering',
        url: 'https://linkedin.com/posts/marcvandermeer-ai-mkb-2024',
        publishedAt: new Date('2024-01-13'),
        engagements: 19
      },
      {
        platform: 'TWITTER',
        postId: 'tw-post-bcp-2024',
        content: 'Business continuity planning is geen luxe maar een noodzaak. Nieuwe case study over hoe een MKB bedrijf ransomware overleefde dankzij goede voorbereiding. 📊 #BCP #CyberSecurity',
        url: 'https://twitter.com/adviesnconsult/status/1745123456',
        publishedAt: new Date('2024-01-11'),
        engagements: 12
      }
    ]

    for (const post of socialPosts) {
      await prisma.socialMediaPost.create({
        data: {
          ...post,
          platform: post.platform as any
        }
      })
      console.log(`✅ Created social media post: ${post.platform} - ${post.content.substring(0, 50)}...`)
    }

    console.log('🎉 Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
