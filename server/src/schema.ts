import * as fs from 'fs'
import { makeExecutableSchema } from 'graphql-tools'

import resolvers from './resolvers'

const typeDefs = fs.readFileSync('./src/schema.gql').toString()

export default makeExecutableSchema({
  typeDefs,
  resolvers,
})
