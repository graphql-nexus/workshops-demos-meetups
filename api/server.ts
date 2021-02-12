import { ApolloServer } from 'apollo-server-micro'
import { PageConfig } from 'next'
import { createContext } from './context'
import { schema } from './schema'

const server = new ApolloServer({
  schema,
  context: createContext,
})

export const handler = server.createHandler({
  path: '/api/graphql',
})

// Apollo Server Micro takes care of body parsing
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}
