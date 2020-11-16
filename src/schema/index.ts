import { makeSchema } from '@nexus/schema'
import * as Path from 'path'
import * as types from './types'

const schema = makeSchema({
  types,
  features: {
    abstractTypeStrategies: {
      resolveType: true,
    },
  },
  outputs: {
    schema: Path.join(__dirname, '../../schema.graphql'),
    typegen: Path.join(__dirname, '../../node_modules/@types/typegen-nexus/index.d.ts'),
  },
  typegenAutoConfig: {
    sources: [
      { alias: 'Context', source: Path.join(__dirname, '../context.ts') },
      // { alias: 'Database', source: Path.join(__dirname, '../database.ts') },
      { alias: 'PrismaClient', source: '.prisma/client' },
    ],
    contextType: 'Context.Context',
  },
})

export default schema
