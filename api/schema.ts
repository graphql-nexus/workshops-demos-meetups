import { makeSchema } from 'nexus'
import * as Path from 'path'
import * as types from './types'

export const schema = makeSchema({
  types,
  features: {
    abstractTypeStrategies: {
      isTypeOf: true,
    },
  },
  nonNullDefaults: {
    output: true,
  },
  outputs: {
    typegen: Path.join(process.cwd(), '/node_modules/@types/nexus-typegen/index.d.ts'),
    schema: Path.join(process.cwd(), '/api/schema.graphql'),
  },
  contextType: {
    module: Path.join(process.cwd(), '/api/context.ts'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      { module: '.prisma/client', alias: 'PrismaClient' },
      {
        module: Path.join(process.cwd(), 'api/typeSources.ts'),
        alias: 'TypeSources',
      },
    ],
  },
})
