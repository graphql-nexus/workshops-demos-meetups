import { PrismaClient } from '@prisma/client'
import { database, Database } from './database'

const db = new PrismaClient()

export type Context = {
  database: Database
  db: PrismaClient
}

export function createContext(): Context {
  return {
    database,
    db,
  }
}
