import { objectType, queryField } from 'nexus'

export const types = [
  /**
   * Queries
   */

  queryField('me', {
    type: 'User',
    resolve(_, __, ctx) {
      return ctx.prisma.user.findUnique({
        rejectOnNotFound: true,
        where: {
          id: ctx.user.id,
        },
      })
    },
  }),

  /**
   * Objects
   */

  objectType({
    name: 'User',
    definition(t) {
      t.id('id')
      t.string('displayName', {
        resolve(user) {
          return user.displayName
        },
      })
      t.string('email')
      // todo remove useless resolve once https://github.com/graphql-nexus/nexus/issues/800 fixed
      t.nullable.string('image', {
        resolve(user) {
          return user.image
        },
      })
      t.list.field('workspaces', {
        type: 'Workspace',
        resolve(user, _, ctx) {
          return ctx.prisma.workspace.findMany({
            where: {
              memberships: {
                some: {
                  user: {
                    id: {
                      equals: user.id,
                    },
                  },
                },
              },
            },
          })
        },
      })
      t.list.field('projects', {
        type: 'Project',
        resolve: async (_, __, ctx) => {
          return ctx.prisma.project.findMany({
            where: {
              OR: [
                {
                  // All projects where this user was explicitly added to
                  memberships: {
                    some: {
                      userId: ctx.user.id,
                    },
                  },
                },
                {
                  // All projects that are in the workspaces this user belongs to
                  workspace: {
                    memberships: {
                      some: {
                        userId: ctx.user.id,
                      },
                    },
                  },
                },
              ],
            },
          })
        },
      })
    },
  }),
]
