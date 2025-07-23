
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...')
    
    // Check if admin user already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: 'admin@adviesnconsultancy.nl' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('AdminSecure2025!', 12)

    // Create admin user
    const adminUser = await prisma.admin.create({
      data: {
        email: 'admin@adviesnconsultancy.nl',
        name: 'Admin User',
        hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        createdBy: 'system'
      }
    })

    console.log('✅ Admin user created successfully')
    console.log('📧 Email: admin@adviesnconsultancy.nl')
    console.log('🔑 Password: AdminSecure2025!')
    console.log('🛡️ Role: SUPER_ADMIN')

    // Log admin creation
    await prisma.adminActivityLog.create({
      data: {
        adminId: adminUser.id,
        action: 'CREATE_ADMIN',
        resource: 'USER',
        details: {
          email: adminUser.email,
          role: adminUser.role,
          createdBy: 'system'
        }
      }
    })

    console.log('✅ Admin activity logged')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  }
}

async function main() {
  try {
    await createAdminUser()
    console.log('🎉 Admin user setup completed!')
  } catch (error) {
    console.error('❌ Admin user setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
