import * as uuid from 'uuid'
import {
  idArg,
  mutationField,
  objectType,
  queryField,
  stringArg
} from '@nexus/schema'

export const Post = objectType({
  name: 'Post',
  nonNullDefaults: {
    output: true,
  },
  definition(t) {
    t.id('id')
    t.string('title')
    t.string('body')
    t.boolean('published')
    t.string('tags', {
      list: [true],
    })
    t.field('authors', {
      type: 'User',
      list: [true],
      resolve(post, __, ctx) {
        return ctx.database.users.filter((user) => user.posts.filter((somePost) => post.id === somePost.id))
      },
    })
  },
})

export const QueryFields = queryField((t) => {
  t.field('posts', {
    type: 'Post',
    nullable: false,
    list: [true],
    resolve(_, __, ctx) {
      return ctx.database.posts
    },
  })
})

export const MutationFields = mutationField((t) => {
  t.field('publishDraft', {
    type: 'Post',
    nullable: false,
    args: { id: idArg() },
    resolve(_, args, ctx) {
      const post = ctx.database.posts.find((somePost) => somePost.id === args.id)
      if (!post) {
        throw new Error(`No such post ${args.id}`)
      }
      post.published = true
      return post
    },
  })
  t.field('createDraft', {
    type: 'Post',
    nullable: false,
    args: {
      title: stringArg({ required: true }),
      body: stringArg({ required: true }),
      authors: idArg({ list: [true], required: true }),
      tags: stringArg({ list: [true] }),
    },
    resolve(_, args, ctx) {
      const id = uuid.v4()
      const post = {
        ...args,
        id,
        tags: args.tags ?? [],
        published: false,
        authors: args.authors.map((authorId) => {
          const user = ctx.database.users.find((user) => user.id === authorId)
          if (!user) {
            throw new Error(`No such user ${authorId}`)
          }
          return user
        }),
      }
      ctx.database.posts.push(post)
      return post
    },
  })
})
