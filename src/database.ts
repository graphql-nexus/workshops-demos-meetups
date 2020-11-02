// src/database.ts
export type Database = {
  posts: Post[]
  users: User[]
}

export type Post = {
  id: string
  title: string
  body: string
  published: boolean
  tags: string[]
  authors: User[]
}

export type User = {
  id: string
  handle: string
  email: string
  posts: Post[]
}

export const database: Database = {
  posts: [],
  users: [],
}
