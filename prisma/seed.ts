import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@ironpulse.com' },
        update: {},
        create: {
            memberCode: 'ADM-001',
            name: 'Admin IronPulse',
            email: 'admin@ironpulse.com',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    console.log('Akun Admin siap:', admin.email)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })