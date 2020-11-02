import {
  database,
  Database
} from './database'

export type Context = {
  database: Database
}

export function createContext(): Context {
  return { database }
}
