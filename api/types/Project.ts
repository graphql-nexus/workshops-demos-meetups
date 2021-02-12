import { capitalize } from 'lodash'
import { enumType, inputObjectType, mutationField, nonNull, objectType, unionType } from 'nexus'
import generateName from 'project-name-generator'
import { resourceNameMaxLength, resourceNamePattern } from '../helpers'

export const types = [
  /**
   * Mutations
   */

  inputObjectType({
    name: 'CreateProjectInput',
    definition(t) {
      t.nonNull.id('workspaceId')
      t.string('name')
      t.string('displayName')
    },
  }),

  unionType({
    name: 'CreateProjectResult',
    definition(t) {
      t.members('Project', 'CreateProjectClientErrors')
    },
  }),

  objectType({
    name: 'CreateProjectClientErrors',
    isTypeOf(model) {
      return 'errors' in model
    },
    definition(t) {
      t.list.field('errors', {
        type: 'CreateProjectClientError',
      })
    },
  }),

  unionType({
    name: 'CreateProjectClientError',
    definition(t) {
      t.members(
        'ClientErrorNameAlreadyTaken',
        'ClientErrorNameInvalid',
        'ClientErrorWorkspaceNotFound',
        'ClientErrorNotAuthorized'
      )
    },
  }),

  objectType({
    name: 'ClientErrorWorkspaceNotFound',
    isTypeOf(model) {
      return '__typename' in model && model.__typename === 'ClientErrorWorkspaceNotFound'
    },
    definition(t) {
      t.implements('ClientError')
    },
  }),

  mutationField('createProject', {
    type: 'CreateProjectResult',
    args: {
      input: nonNull('CreateProjectInput'),
    },
    async resolve(_, args, ctx) {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: {
          id: args.input.workspaceId,
        },
      })

      if (!workspace) {
        return {
          errors: [
            {
              __typename: 'ClientErrorWorkspaceNotFound',
              message: `No such workspace for given id "${args.input.workspaceId}".`,
              path: ['input', 'workspaceId'],
            },
          ],
        }
      }

      let resolvedName: string
      let resolvedDisplayName: string

      if (args.input?.name) {
        const maybeExistingProject = await ctx.prisma.workspace.findUnique({
          where: {
            name: args.input.name,
          },
        })
        if (maybeExistingProject) {
          return {
            errors: [
              {
                __typename: 'ClientErrorNameAlreadyTaken',
                message: `The given project name "${args.input.name}" has already been taken.`,
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
        let generatedName: string

        while (true) {
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
        resolvedDisplayName = args.input?.displayName ?? capitalize(generatedName)
      }

      return ctx.prisma.project.create({
        data: {
          workspace: {
            connect: {
              id: args.input.workspaceId,
            },
          },
          name: resolvedName,
          displayName: resolvedDisplayName,
        },
      })
    },
  }),

  /**
   * Objects
   */

  objectType({
    name: 'Project',
    isTypeOf(source) {
      return 'kind' in source && source.kind === 'project'
    },
    definition(t) {
      t.id('id')
      t.string('name')
      t.string('displayName')
      t.list.field('memberships', {
        type: 'ProjectMembership',
        resolve(project, _, ctx) {
          return ctx.prisma.projectMembership.findMany({
            where: {
              projectId: project.id,
            },
          })
        },
      })
    },
  }),

  enumType({
    name: 'ProjectRole',
    members: ['admin', 'developer'],
  }),

  objectType({
    name: 'ProjectMembership',
    definition(t) {
      t.id('id')
      t.field('role', {
        type: 'ProjectRole',
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
