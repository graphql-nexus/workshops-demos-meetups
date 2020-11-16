import { extendType, objectType, stringArg } from '@nexus/schema'

export const User = objectType({
  name: 'User',
  nonNullDefaults: {
    output: true,
  },
  definition(t) {
    t.id('id')
    t.string('handle', {
      resolve(user) {
        return user.username
      },
    })
    t.string('email')
    t.field('posts', {
      type: 'Post',
      list: [true],
      resolve(user, _, ctx) {
        // return ctx.db.data.posts.filter((post) => {
        //   return (
        //     post.authors.filter((someUserId) => {
        //       return user.id === someUserId
        //     }).length > 0
        //   )
        // })
        return ctx.db.post.findMany({
          where: {
            authors: {
              some: {
                id: user.id,
              },
            },
          },
        })
      },
    })
  },
})

export const QueryUser = extendType({
  type: 'Query',
  definition(t) {
    t.field('users', {
      type: 'User',
      nullable: false,
      list: [true],
      resolve(_, __, ctx) {
        // return ctx.db.data.users
        return ctx.db.user.findMany()
      },
    })
  },
})

export const MutationUser = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('registerUser', {
      type: 'User',
      nullable: false,
      args: {
        email: stringArg({ required: true }),
        handle: stringArg({ required: true }),
      },
      resolve(_, args, ctx) {
        // return ctx.db.operations.createUser({
        //   username: args.handle,
        //   email: args.email,
        // })
        return ctx.db.user.create({
          data: {
            username: args.handle,
            email: args.email,
          },
        })
      },
    })
  },
})
