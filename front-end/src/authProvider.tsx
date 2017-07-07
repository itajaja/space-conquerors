import * as auth0 from 'auth0-js'
import * as React from 'react'
import {
  ApolloClient, ApolloProvider, createBatchingNetworkInterface,
} from 'react-apollo'
import { RouteComponentProps, withRouter } from 'react-router'

import * as config from './config'

type AuthContext = {
  login: () => void,
  handleAuthentication: () => void,
  logout: () => void,
  isAuthenticated: () => void,
}

type Props = object & RouteComponentProps<any>

class AuthProvider extends React.Component<Props, any> {
  static childContextTypes = {
    auth: React.PropTypes.object.isRequired,
  }

  client: ApolloClient

  auth0 = new auth0.WebAuth({
    domain: 'space-conquerors.auth0.com',
    clientID: 'Nm7eKJDk5mroobvkEAOywzsRy4J3nNQW',
    redirectUri: `${location.origin}/auth/callback`,
    responseType: 'token id_token',
    scope: 'openid app_metadata profile email',
  })

  constructor(props, ctx) {
    super(props, ctx)
    this.refreshClient()
  }

  getChildContext(): { auth: AuthContext } {
    return {
      auth: {
        login: () => this.login(),
        handleAuthentication: () => this.handleAuthentication(),
        logout: () => this.logout(),
        isAuthenticated: () => this.isAuthenticated(),
      },
    }
  }

  login() {
    this.auth0.authorize()
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult)
        this.refreshClient()
        this.props.history.replace('/')
      } else {
        throw new Error(err)
      }
    })
  }

  setSession(authResult) {
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime())
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)
    localStorage.setItem('expires_at', expiresAt)
  }

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')

    this.refreshClient()

    this.props.history.replace('/')
  }

  isAuthenticated() {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '0')
    return new Date().getTime() < expiresAt
  }

  refreshClient() {
    const token = localStorage.getItem('id_token')

    this.client = new ApolloClient({
      queryDeduplication: true,
      networkInterface: createBatchingNetworkInterface({
        uri: `${config.UPSTREAM_ORIGIN}/graphql`,
        batchInterval: 10,
        opts: {
          headers: {
            Authorization: token && `Bearer ${token}`,
          },
        },
      }),
    })
  }

  render() {
    return (
      <ApolloProvider client={this.client}>
        {this.props.children}
      </ApolloProvider>
    )
  }
}

export default withRouter(AuthProvider)
