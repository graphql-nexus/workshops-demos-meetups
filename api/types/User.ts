import { objectType, queryField, stringArg } from 'nexus'

export const types = [
  /**
   * Queries
   */

  queryField('me', {
    type: 'User',
    resolve(_, __, ctx) {
      return (
        ctx.prisma.user
          .findUnique({
            rejectOnNotFound: true,
            where: {
              id: ctx.user.id,
            },
          })
          // todo remove me once Prisma typing accurately models the effect of rejectOnNotFound :)
          .then((user) => user!)
      )
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
          // todo We need to change our user sign up flow to never allow empty user display names.
          return user.name ?? 'todo'
        },
      })
      // todo remove useless resolve once https://github.com/graphql-nexus/nexus/issues/800 fixed
      t.nullable.string('email', {
        resolve(user) {
          return user.email
        },
      })
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
        args: {
          workspaceId: stringArg({ description: 'ID of the workspace to look for projects in' }),
        },
        resolve: async (_, args, ctx) => {
          if (args.workspaceId) {
            // Look for projects in this requested workspace that the auth'ed user has access to
            return ctx.prisma.project.findMany({
              where: {
                OR: [
                  {
                    // Covers the case when the user belongs to this requested workspace
                    workspace: {
                      id: args.workspaceId,
                      memberships: {
                        some: {
                          userId: ctx.user.id,
                        },
                      },
                    },
                  },
                  {
                    // Covers the case when the user does not belong to this requested workspace,
                    // and only has access to specific projects in this requested workspace
                    workspaceId: args.workspaceId,
                    memberships: {
                      some: {
                        userId: ctx.user.id,
                      },
                    },
                  },
                ],
              },
            })
          } else {
            // Look for projects in all workspaces that the auth'ed use has access to
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
          }
        },
      })
    },
  }),
]
