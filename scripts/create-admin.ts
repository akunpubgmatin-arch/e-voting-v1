import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { hash } from "bcryptjs"
import { createInterface } from "readline"
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function question(prompt: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function createAdmin() {
  try {
    const username = await question('Enter admin username: ')
    const password = await question('Enter admin password: ')
    const fullName = await question('Enter admin full name (press enter to use username): ') || username

    if (!username || !password) {
      console.error('Username and password are required')
      process.exit(1)
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        role: 'ADMIN',
      },
    })

    console.log(`Admin user created: ${user.username} (${user.fullName})`)
  } catch (error) {
    console.error('Error creating admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()