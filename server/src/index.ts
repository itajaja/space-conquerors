import * as bodyParser from 'body-parser'
import * as express from 'express'
import { graphqlExpress } from 'graphql-server-express'

import schema from './schema'

const PORT = 4998

const app = express()

app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema,
  context: { userId: 'a' }, // TODO temp
}))

app.listen(PORT)
// tslint:disable-next-line:no-console
console.log('service started on port', PORT)
