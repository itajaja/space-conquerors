import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as express from 'express'
import { graphqlExpress } from 'graphql-server-express'
import * as jwt from 'jsonwebtoken'
import * as createJwksClient from 'jwks-rsa'

import { initModels } from './models'
import { Context } from './resolvers'
import schema from './schema'

const PORT = process.env.PORT || 80

const JWT_OPTIONS = {
  audience: 'Nm7eKJDk5mroobvkEAOywzsRy4J3nNQW',
  algorithms: ['RS256'],
}

async function start() {
  const app = express()

  app.use(cors())

  const models = await initModels()

  const jwksClient = createJwksClient({
    jwksUri: 'https://space-conquerors.auth0.com/.well-known/jwks.json',
  })

  app.use('/graphql',
    (req, resp, next) => {
      const authorization = req.header('Authorization')
      const idTokenMatch = /^Bearer (.*)$/.exec(authorization!)
      if (!idTokenMatch) {
        return resp.status(401).send('invalid_token')
      }
      const token = jwt.decode(idTokenMatch[1], { complete: true })
      if (!token) {
        return resp.status(401).send('invalid_authorization')
      }

      const { payload, header } = (token as any)

      jwksClient.getSigningKey(header.kid, (err, key) => {
        if (err) {
          return resp.status(401).send('invalid_authorization_kid')
        }
        const signingKey = key.publicKey || key.rsaPublicKey!
        jwt.verify(idTokenMatch[1], signingKey, JWT_OPTIONS, onVerify)
      })

      const onVerify = (err) => {
        if (err) {
          return resp.status(401).send('invalid_authorization')
        }
        // tslint:disable-next-line:no-string-literal
        req['token'] = payload
        next()
      }
    },
    bodyParser.json(),
    graphqlExpress((req) => {
      const context: Context = {
        user: {
          id: (req as any).token.sub,
          meta: (req as any).token.app_metadata || {},
          name: (req as any).token.name,
          email: (req as any).token.email,
        },
      } as any

      context.models = models(context)

      return {
        schema,
        context,
      }
    }),
  )

  app.listen(PORT)
  // tslint:disable-next-line:no-console
  console.log('service started on port', PORT)
}

start()
