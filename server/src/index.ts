import * as bodyParser from 'body-parser'
import * as express from 'express'
import { graphqlExpress } from 'graphql-server-express'
import * as jwt from 'jsonwebtoken'

import schema from './schema'

const PORT = 4998

const app = express()

// const JWT_SECRET = 'lF5bv68eim5rFDM23KGCeFibGc1g55uyDawDhwYf4FlGFhE_6JZN_t3zTb8Xh-ow'
// const JWT_LEEWAY = 10
// const JWT_OPTIONS = {
//   algorithms: ['HS256'],
//   audience: 'https://space-conquerors.auth0.com/userinfo',
//   clockTolerance: JWT_LEEWAY,
// }

app.use('/graphql',
  (req, resp, next) => {
    const authorization = req.header('Authorization')
    const idTokenMatch = /^Bearer (.*)$/.exec(authorization)
    if (!idTokenMatch) {
      return resp.send(401, 'invalid_token')
    }
    try {
      // jwt.verify(idTokenMatch[1], JWT_SECRET, JWT_OPTIONS)
      const token = jwt.decode(idTokenMatch[1])
      // tslint:disable-next-line:no-string-literal
      req['token'] = token
    } catch (e) {
      return resp.send(401, 'invalid_authorization')
    }
    next()
  },
  bodyParser.json(),
  graphqlExpress((req) => ({
    schema,
    context: {
      userId: (req as any).token.email,
    },
  })),
)

app.listen(PORT)
// tslint:disable-next-line:no-console
console.log('service started on port', PORT)
