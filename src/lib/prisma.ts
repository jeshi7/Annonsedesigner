import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prismaPromise: Promise<PrismaClient> | undefined
}

async function createPrismaClient(): Promise<PrismaClient> {
  const adapter = new PrismaBetterSqlite3({
    url: 'file:./prisma/dev.db',
  })
  const connection = await adapter.connect()
  return new PrismaClient({ adapter: connection })
}

// Lazy initialization
if (!globalForPrisma.prismaPromise) {
  globalForPrisma.prismaPromise = createPrismaClient()
}

// Export a function to get the prisma client
export async function getPrisma(): Promise<PrismaClient> {
  return globalForPrisma.prismaPromise!
}
