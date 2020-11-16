import { PrismaClient } from '@prisma/client'
// import { db, Database } from './database'

const db = new PrismaClient()

export type Context = {
  // db: Database
  db: PrismaClient
}

export function createContext(): Context {
  return {
    db,
  }
}
