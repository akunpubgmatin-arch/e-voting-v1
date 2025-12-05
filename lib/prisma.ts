import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg" // <--- Ini yang tadi kurang

const connectionString = process.env.DATABASE_URL

// Buat Pool koneksi menggunakan library 'pg'
const pool = new Pool({ connectionString })

// Sambungkan Pool tersebut ke Adapter Prisma
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // Gunakan adapter yang sudah benar
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma