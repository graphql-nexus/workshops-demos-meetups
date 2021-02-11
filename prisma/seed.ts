import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  if (!(await prisma.user.findUnique({ where: { id: 'foobar' } }))) {
    await prisma.user.create({
      data: {
        email: 'newton@prisma.io',
        name: 'Issac',
        id: 'foobar',
      },
    })
  }

  await prisma.$disconnect()
}

main()
