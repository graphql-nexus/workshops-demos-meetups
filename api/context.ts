import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type Context = {
  prisma: PrismaClient
  user: {
    id: string
  }
}

export async function createContext(): Promise<Context> {
  return {
    prisma,
    user: {
      id: 'foobar',
    },
  }
}
