import * as uuid from 'uuid'
import {
  mutationField,
  objectType,
  queryField,
  stringArg
} from '@nexus/schema'

export const User = objectType({
  name: 'User',
  nonNullDefaults: {
    output: true,
  },
  definition(t) {
    t.id('id')
    t.string('handle')
    t.string('email')
    t.field('posts', {
      type: 'Post',
      list: [true],
    })
  },
})

export const QueryFields = queryField((t) => {
  t.field('users', {
    type: 'User',
    nullable: false,
    list: [true],
    resolve(_, __, ctx) {
      return ctx.database.users
    },
  })
})

export const MutationFields = mutationField((t) => {
  t.field('registerUser', {
    type: 'User',
    nullable: false,
    args: {
      email: stringArg({ required: true }),
      handle: stringArg({ required: true }),
    },
    resolve(_, args, ctx) {
      const user = {
        id: uuid.v4(),
        handle: args.handle,
        email: args.email,
        posts: [],
      }
      ctx.database.users.push(user)
      return user
    },
  })
})
