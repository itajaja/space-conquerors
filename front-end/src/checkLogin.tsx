import * as React from 'react'
// import { RouteComponentProps } from 'react-router-dom'

export default class CheckLogin extends React.Component<never, never> {
  static contextTypes = {
    auth: React.PropTypes.object,
  }

  render() {
    if (!this.context.auth.isAuthenticated()) {
      this.context.auth.login()
      return null
    }

    return <div>{this.props.children}</div>
  }
}
