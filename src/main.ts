import { ApolloServer } from 'apollo-server'
import * as Path from 'path'
import { makeSchema } from '@nexus/schema'
import { createContext } from './context'
import * as types from './schema'

const schema = makeSchema({
  types,
  outputs: {
    schema: Path.join(__dirname, '../schema.graphql'),
    typegen: Path.join(__dirname, '../node_modules/@types/nexus-typegen/index.d.ts'),
  },
  typegenAutoConfig: {
    sources: [
      {
        source: Path.join(__dirname, './context.ts'),
        alias: 'Context',
      },
    ],
    contextType: 'Context.Context',
  },
})

const server = new ApolloServer({
  schema,
  context() {
    return createContext()
  },
})

server.listen({ port: 3000 }, () => {
  console.log('http://localhost:3000')
})
