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
        // return ctx.database.posts.filter((post) => {
        //   return (
        //     post.authors.filter((someUser) => {
        //       return user.id === someUser.id
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
        // return ctx.database.users
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
        // const user = {
        //   id: uuid.v4(),
        //   username: args.handle,
        //   email: args.email,
        //   posts: [],
        // }
        // ctx.database.users.push(user)
        // return user
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
