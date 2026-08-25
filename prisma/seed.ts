import { PrismaClient } from '@prisma/client'
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding...')

  // Create an admin user
  const adminEmail = 'admin@az.cbt'
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        password: 'admin', // Simple password for testing purposes
        role: 'ADMIN',
      }
    })
    console.log(`Created admin user with email: ${admin.email}`)
  } else {
    console.log('Admin user already exists.')
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
