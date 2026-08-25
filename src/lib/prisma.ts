import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma2: PrismaClient };

let prisma: PrismaClient;

if (globalForPrisma.prisma2) {
  prisma = globalForPrisma.prisma2;
} else {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  prisma = new PrismaClient({ adapter, log: ["query"] });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma2 = prisma;

export { prisma };
