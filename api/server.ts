import { ApolloServer } from 'apollo-server-micro'
import { NextApiHandler, PageConfig } from 'next'
import { createContext } from './context'
import { schema } from './schema'

const server = new ApolloServer({
  schema,
  context: createContext,
  introspection: true,
  playground: true,
})

const apolloHandler = server.createHandler({
  disableHealthCheck: true,
  path: '/api/graphql',
})

export const handler: NextApiHandler = async (req, res) => {
  // seed
  return apolloHandler(req, res)
}

// Apollo Server Micro takes care of body parsing
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}
