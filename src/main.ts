import { ApolloServer } from 'apollo-server'
import { createContext } from './context'
import schema from './schema'

const server = new ApolloServer({
  schema,
  context: createContext,
})

server.listen({ port: 3000 }, () => {
  console.log('GraphQL API ready at: http://localhost:3000')
})
