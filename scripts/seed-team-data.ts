
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const teamData = [
  {
    name: "Marc René",
    position: "Senior BCM Consultant & Eigenaar",
    bio: "Marc heeft meer dan 15 jaar ervaring in business continuity management en compliance. Hij is gecertificeerd ISO 22301 Lead Auditor en heeft talloze organisaties geholpen met het implementeren van robuuste BCM systemen.",
    imageUrl: "https://i.pinimg.com/originals/cd/26/7d/cd267d9afa3343b50c468b3daec610bc.jpg",
    email: "marc@adviesnconsultancy.nl",
    phone: "+31 6 22675520",
    linkedinUrl: "https://linkedin.com/in/marcrene",
    expertise: ["ISO 22301", "BCM Implementation", "Crisis Management", "Risk Assessment", "Compliance Auditing"],
    order: 1
  },
  {
    name: "Sarah van der Berg",
    position: "BCM Consultant",
    bio: "Sarah is gespecialiseerd in BCM voor de financiële sector en heeft uitgebreide ervaring met regulatory compliance. Ze helpt organisaties bij het navigeren door complexe compliance vereisten.",
    imageUrl: "https://usercontent.one/wp/haltung-zeigen.com/wp-content/uploads/fsqm-files/IAUFcTLR43LtGzBwSarahBuddeberg_190412_0558_Presse_KLEIN.jpg",
    email: "sarah@adviesnconsultancy.nl",
    phone: "+31 6 12345678",
    linkedinUrl: "https://linkedin.com/in/sarahvdberg",
    expertise: ["Financial Services BCM", "Regulatory Compliance", "Risk Management", "DORA Implementation"],
    order: 2
  },
  {
    name: "Thomas Jansen",
    position: "IT Security & BCM Specialist",
    bio: "Thomas combineert zijn expertise in cybersecurity met business continuity management. Hij helpt organisaties bij het integreren van IT security en BCM voor een holistische aanpak.",
    imageUrl: "https://blog.ai-headshots.net/wp-content/uploads/2024/05/professional-acting-headshots.png",
    email: "thomas@adviesnconsultancy.nl",
    phone: "+31 6 87654321",
    linkedinUrl: "https://linkedin.com/in/thomasjansen",
    expertise: ["Cybersecurity", "IT Risk Management", "Incident Response", "Recovery Planning"],
    order: 3
  },
  {
    name: "Linda Smit",
    position: "Training & Development Specialist",
    bio: "Linda ontwikkelt en verzorgt BCM training programma's voor organisaties. Ze heeft een achtergrond in adult learning en zorgt ervoor dat teams effectief worden opgeleid in BCM principes.",
    imageUrl: "https://lfcdypol.elementor.cloud/wp-content/uploads/2023/10/McDonald_Linda_5377868_SM.jpg",
    email: "linda@adviesnconsultancy.nl",
    phone: "+31 6 11223344",
    linkedinUrl: "https://linkedin.com/in/lindasmit",
    expertise: ["BCM Training", "Workshop Development", "Crisis Simulation", "Team Development"],
    order: 4
  }
]

async function seedTeamData() {
  try {
    console.log('🌱 Seeding team data...')

    // Check if team members already exist
    const existingMembers = await prisma.teamMember.findMany()
    
    if (existingMembers.length > 0) {
      console.log('✅ Team members already exist, skipping seed')
      return
    }

    // Create team members
    for (const member of teamData) {
      await prisma.teamMember.create({
        data: member
      })
    }

    console.log('✅ Team data seeded successfully!')
    console.log(`📊 Created ${teamData.length} team members`)

  } catch (error) {
    console.error('❌ Error seeding team data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedTeamData()
  .then(() => {
    console.log('🎉 Team data seeding completed!')
  })
  .catch((error) => {
    console.error('💥 Team data seeding failed:', error)
    process.exit(1)
  })
