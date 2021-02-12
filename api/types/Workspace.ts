import { capitalize } from 'lodash'
import { enumType, inputObjectType, mutationField, nonNull, objectType, unionType } from 'nexus'
import generateName from 'project-name-generator'
import { resourceNameMaxLength, resourceNamePattern } from '../helpers'

export const types = [
  /**
   * Mutations
   */

  inputObjectType({
    name: 'CreateWorkspaceInput',
    definition(t) {
      t.string('name')
      t.string('displayName')
    },
  }),

  unionType({
    name: 'CreateWorkspaceResult',
    definition(t) {
      t.members('Workspace', 'CreateWorkspaceErrors')
    },
  }),

  objectType({
    name: 'CreateWorkspaceErrors',
    isTypeOf(model) {
      return 'errors' in model
    },
    definition(t) {
      t.list.field('errors', {
        type: 'CreateWorkspaceError',
      })
    },
  }),

  unionType({
    name: 'CreateWorkspaceError',
    definition(t) {
      t.members('ClientErrorNameAlreadyTaken', 'ClientErrorNameInvalid')
    },
  }),

  mutationField('createWorkspace', {
    type: 'CreateWorkspaceResult',
    args: {
      input: 'CreateWorkspaceInput',
    },
    async resolve(_, args, ctx) {
      let resolvedName: string
      let resolvedDisplayName: string

      if (args.input?.name) {
        const maybeExistingWorkspace = await ctx.prisma.workspace.findUnique({
          where: {
            name: args.input.name,
          },
        })
        if (maybeExistingWorkspace) {
          return {
            errors: [
              {
                __typename: 'ClientErrorNameAlreadyTaken',
                message: `The given workspace name "${args.input.name}" has already been taken.`,
                path: ['input', 'name'],
              },
            ],
          }
        }
        if (!args.input.name.match(resourceNamePattern)) {
          //prettier-ignore
          return {
            errors: [
              {
                __typename: "ClientErrorNameInvalid",
                message: `The given project name "${args.input.name}" does not conform to the required pattern of ${resourceNamePattern.toString()}.`,
                path: ["input", "name"],
              }
            ]
          }
        }
        if (args.input.name.length > resourceNameMaxLength) {
          //prettier-ignore
          return {
            errors: [
              {
                __typename: "ClientErrorNameInvalid",
                message: `The given project name "${args.input.name}" is ${args.input.name.length} characters long which exceeds the maximum allowed of ${resourceNameMaxLength}.`,
                path: ["input", "name"],
              }
            ]
          }
        }

        resolvedName = args.input.name
        resolvedDisplayName = args.input?.displayName ?? args.input.name
      } else {
        let generatedName

        while (true) {
          // todo we need to check how many possible names can be generated, it should be a high number to avoid infinite loops etc.!
          const candidateGeneratedName = generateName({ words: 2 }).dashed
          const maybeExistingWorkspace = await ctx.prisma.workspace.findUnique({
            where: {
              name: candidateGeneratedName,
            },
          })

          if (!maybeExistingWorkspace) {
            generatedName = candidateGeneratedName
            break
          }
        }

        resolvedName = generatedName
        resolvedDisplayName = capitalize(generatedName)
      }

      return ctx.prisma.workspace.create({
        data: {
          name: resolvedName,
          displayName: resolvedDisplayName,
          memberships: {
            create: {
              role: 'admin',
              user: {
                connect: {
                  id: ctx.user.id,
                },
              },
            },
          },
        },
      })
    },
  }),

  inputObjectType({
    name: 'InviteUserInput',
    definition(t) {
      t.nonNull.id('userId')
      t.nonNull.id('workspaceId')
      t.nonNull.field('role', {
        type: 'WorkspaceRole',
      })
    },
  }),

  unionType({
    name: 'InviteUserToWorkspaceResult',
    definition(t) {
      t.members('Workspace', 'InviteUserToWorkspaceErrors')
    },
  }),

  objectType({
    name: 'InviteUserToWorkspaceErrors',
    isTypeOf(model) {
      return 'errors' in model
    },
    definition(t) {
      t.list.field('errors', {
        type: 'InviteUserToWorkspaceError',
      })
    },
  }),

  unionType({
    name: 'InviteUserToWorkspaceError',
    definition(t) {
      t.members('ClientErrorWorkspaceNotFound', 'ClientErrorAlreadyInWorkspace')
    },
  }),

  objectType({
    name: 'ClientErrorAlreadyInWorkspace',
    isTypeOf(model) {
      return '__typename' in model && model.__typename === 'ClientErrorAlreadyInWorkspace'
    },
    definition(t) {
      t.implements('ClientError')
    },
  }),

  mutationField('inviteUserToWorkspace', {
    type: 'Workspace',
    args: {
      input: nonNull('InviteUserInput'),
    },
    async resolve(_, args, ctx) {
      if (ctx.user.id === args.input.userId) {
        throw new Error(`You cannot invite yourself to a workspace`)
      }

      const workspace = await ctx.prisma.workspace.findUnique({
        where: {
          id: args.input.workspaceId,
        },
        select: {
          name: true,
        },
      })

      if (!workspace) {
      }

      return ctx.prisma.workspace.update({
        where: {
          id: args.input.workspaceId,
        },
        data: {
          memberships: {
            create: {
              role: args.input.role,
              user: {
                connect: {
                  id: args.input.userId,
                },
              },
            },
          },
        },
      })
    },
  }),

  inputObjectType({
    name: 'DeleteWorkspaceInput',
    definition(t) {
      t.nonNull.id('id')
    },
  }),

  mutationField('deleteWorkspace', {
    type: 'Workspace',
    args: {
      input: nonNull('DeleteWorkspaceInput'),
    },
    async resolve(_, args, ctx) {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: {
          id: args.input.id,
        },
        select: {
          id: true,
          kind: true,
          memberships: true,
        },
        rejectOnNotFound: true,
      })

      return ctx.prisma.workspace.delete({
        where: {
          id: args.input.id,
        },
      })
    },
  }),

  /**
   * objects
   */

  objectType({
    name: 'Workspace',
    isTypeOf(model) {
      return 'kind' in model && model.kind === 'workspace'
    },
    definition(t) {
      t.id('id')
      t.string('name')
      t.string('displayName')
      t.list.field('projects', {
        type: 'Project',
        resolve(workspace, _, ctx) {
          return ctx.prisma.project.findMany({
            where: {
              workspaceId: {
                equals: workspace.id,
              },
            },
          })
        },
      })
      t.list.field('memberships', {
        type: 'WorkspaceMembership',
        resolve(workspace, _, ctx) {
          return ctx.prisma.workspaceMembership.findMany({
            where: {
              workspaceId: {
                equals: workspace.id,
              },
            },
          })
        },
      })
    },
  }),

  enumType({
    name: 'WorkspaceRole',
    members: ['admin', 'developer'],
  }),

  objectType({
    name: 'WorkspaceMembership',
    definition(t) {
      t.id('id')
      t.field('role', {
        type: 'WorkspaceRole',
      })
      t.field('user', {
        type: 'User',
        resolve(membership, __, ctx) {
          return ctx.prisma.user.findUnique({
            where: {
              id: membership.userId,
            },
            rejectOnNotFound: true,
          })
        },
      })
    },
  }),
]
