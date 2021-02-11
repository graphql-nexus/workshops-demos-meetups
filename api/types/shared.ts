import { interfaceType, objectType } from 'nexus'

export const types = [
  interfaceType({
    name: 'ClientError',
    definition(t) {
      t.string('message')
      // todo remove useless resolve once https://github.com/graphql-nexus/nexus/issues/800 fixed
      t.nullable.list.string('path', {
        resolve(ClientError) {
          return ClientError.path
        },
      })
    },
  }),

  objectType({
    name: 'ClientErrorNameAlreadyTaken',
    isTypeOf(model) {
      return '__typename' in model && model.__typename === 'ClientErrorNameAlreadyTaken'
    },
    definition(t) {
      t.implements('ClientError')
    },
  }),

  objectType({
    name: 'ClientErrorNameInvalid',
    isTypeOf(model) {
      return '__typename' in model && model.__typename === 'ClientErrorNameInvalid'
    },
    definition(t) {
      t.implements('ClientError')
    },
  }),

  objectType({
    name: 'ClientErrorNotAuthorized',
    isTypeOf(model) {
      return '__typename' in model && model.__typename === 'ClientErrorNotAuthorized'
    },
    definition(t) {
      t.implements('ClientError')
    },
  }),
]
