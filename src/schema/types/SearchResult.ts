import { extendType, stringArg, unionType } from '@nexus/schema'

export const SearchResult = unionType({
  name: 'SearchResult',
  resolveType(data) {
    return 'heading' in data ? 'Post' : 'User'
  },
  definition(t) {
    t.members('Post', 'User')
  },
})

export const QuerySerachResult = extendType({
  type: 'Query',
  definition(t) {
    t.field('serach', {
      type: 'SearchResult',
      args: {
        pattern: stringArg({ default: '.*' }),
      },
      list: [true],
      async resolve(_, args, ctx) {
        const pattern = args.pattern ?? '.*'
        const patternRegExp = new RegExp(pattern, 'i')
        // const items = [...ctx.db.data.posts, ...ctx.db.data.users]
        const items = [...(await ctx.db.post.findMany()), ...(await ctx.db.user.findMany())]
        return items.filter((item) => {
          let match = false

          if ('heading' in item) {
            match = Boolean(item.heading.match(patternRegExp)) || Boolean(item.content.match(patternRegExp))
          } else if ('username' in item) {
            match = Boolean(item.username.match(patternRegExp)) || Boolean(item.email.match(patternRegExp))
          }

          return match
        })
      },
    })
  },
})
