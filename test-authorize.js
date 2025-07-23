require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testAuthorizeLogic() {
    const prisma = new PrismaClient();
    
    try {
        console.log('Testing authorize logic...');
        
        const credentials = {
            email: 'admin@adviesnconsultancy.nl',
            password: 'AdminAccount2024!'
        };
        
        console.log('Looking for user:', credentials.email);
        
        const user = await prisma.user.findUnique({
            where: {
                email: credentials.email
            }
        });
        
        console.log('User found:', user ? { id: user.id, email: user.email, role: user.role } : 'null');
        
        if (!user || !user.password) {
            console.log('User not found or no password');
            return null;
        }
        
        console.log('Comparing password...');
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        console.log('Password valid:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('Invalid password');
            return null;
        }
        
        const result = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };
        
        console.log('Authorize would return:', result);
        return result;
        
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    } finally {
        await prisma.$disconnect();
    }
}

testAuthorizeLogic();
