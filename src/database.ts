import * as uuid from 'uuid'

export type Database = {
  data: {
    posts: Post[]
    users: User[]
  }
  operations: {
    createUser(input: Omit<User, 'posts' | 'id'>): User
    createPost(input: Omit<Post, 'id'>): Post
    updatePost(id: string, input: Partial<Omit<Post, 'id'>>): Post
  }
}

export type Post = {
  id: string
  heading: string
  content: string
  isPublished: boolean
  tags: string[]
  authors: string[]
}

export type User = {
  id: string
  username: string
  email: string
  posts: string[]
}

export const db: Database = {
  data: {
    posts: [],
    users: [],
  },
  operations: {
    createUser(input) {
      const id = uuid.v4()
      const user = { ...input, id, posts: [] }
      db.data.users.push(user)
      return user
    },
    createPost(input) {
      input.authors.forEach((authorId) => {
        const user = db.data.users.find((user) => user.id === authorId)
        if (!user) {
          throw new Error(`No such user ${authorId}`)
        }
      })
      const id = uuid.v4()
      const post = { ...input, id }
      user.posts.push(post.id)
      db.data.posts.push(post)
      return post
    },
    updatePost(id, input) {
      const post = db.data.posts.find((somePost) => somePost.id === id)
      if (!post) {
        throw new Error(`No such post ${id}`)
      }
      Object.assign(post, input)
      return post
    },
  },
}

// Seed some data

const user = db.operations.createUser({
  email: 'flavian@prisma.io',
  username: 'weakky',
})

db.operations.createPost({
  authors: [user.id],
  content: 'Today there was a toto',
  heading: 'In Todoland today',
  isPublished: false,
  tags: [],
})
