export type Database = {
  posts: Post[]
  users: User[]
}

export type Post = {
  id: string
  heading: string
  content: string
  isPublished: boolean
  tags: string[]
  authors: User[]
}

export type User = {
  id: string
  username: string
  email: string
  posts: Post[]
}

export const database: Database = {
  posts: [],
  users: [],
}
