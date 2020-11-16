import { extendType, idArg, objectType, stringArg } from '@nexus/schema'

export const Post = objectType({
  name: 'Post',
  nonNullDefaults: {
    output: true,
  },
  definition(t) {
    t.id('id')
    t.string('title', {
      resolve(post) {
        return post.heading
      },
    })
    t.string('body', {
      resolve(post) {
        return post.content
      },
    })
    t.boolean('published', {
      resolve(post) {
        return post.isPublished
      },
    })
    t.string('tags', {
      list: [true],
    })
    t.field('authors', {
      type: 'User',
      list: [true],
      resolve(post, __, ctx) {
        // return ctx.database.users.filter((user) => {
        //   return (
        //     user.posts.filter((somePost) => {
        //       return post.id === somePost.id
        //     }).length > 0
        //   )
        // })
        return ctx.db.user.findMany({
          where: {
            posts: {
              some: {
                id: post.id,
              },
            },
          },
        })
      },
    })
  },
})

export const QueryPost = extendType({
  type: 'Query',
  definition(t) {
    t.field('posts', {
      type: 'Post',
      nullable: false,
      list: [true],
      resolve(_, __, ctx) {
        // return ctx.database.posts
        return ctx.db.post.findMany()
      },
    })
  },
})

export const MutationPost = extendType({
  type: 'Mutation',
  definition(t) {
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
        // const id = uuid.v4()
        // const post = {
        //   id,
        //   heading: args.title,
        //   content: args.body,
        //   tags: args.tags ?? [],
        //   isPublished: false,
        //   authors: args.authors.map((authorId) => {
        //     const user = ctx.database.users.find((user) => user.id === authorId)
        //     if (!user) {
        //       throw new Error(`No such user ${authorId}`)
        //     }
        //     return user
        //   }),
        // }
        // ctx.database.posts.push(post)
        // return post
        return ctx.db.post.create({
          data: {
            heading: args.title,
            content: args.body,
            isPublished: false,
            authors: {
              connect: args.authors.map((id) => ({ id })),
            },
          },
        })
      },
    })
    t.field('publishDraft', {
      type: 'Post',
      nullable: false,
      args: { id: idArg({ required: true }) },
      resolve(_, args, ctx) {
        // const post = ctx.database.posts.find((somePost) => somePost.id === args.id)
        // if (!post) {
        //   throw new Error(`No such post ${args.id}`)
        // }
        // post.isPublished = true
        // return post
        return ctx.db.post.update({
          data: {
            isPublished: true,
          },
          where: {
            id: args.id,
          },
        })
      },
    })
  },
})
