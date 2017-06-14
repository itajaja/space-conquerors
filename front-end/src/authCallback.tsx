import * as React from 'react'
import { RouteComponentProps } from 'react-router-dom'

type Props = RouteComponentProps<any>

export default class AuthCallback extends React.Component<Props, never> {
  static contextTypes = {
    auth: React.PropTypes.object,
  }

  componentDidMount() {
    this.context.auth.handleAuthentication()
  }

  render() {
    return <div>Redirecting...</div>
  }
}
