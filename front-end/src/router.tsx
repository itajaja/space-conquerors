import * as React from 'react'

import GameView, { Props as GameViewProps } from './gameView'
import AdminView from './localTest/adminPage'

type Props = {
  defaultView: React.ComponentClass<{ router?: Router }>,
}

type State = {
  currentView: JSX.Element | null,
}

export default class Router extends React.Component<Props, State> {
  constructor(props, ctx) {
    super(props, ctx)
    this.state = {
      currentView: null,
    }
  }

  game(props: GameViewProps) {
    this.setState({ currentView: <GameView {...props } /> })
  }

  admin() {
    this.setState({ currentView: <AdminView />})
  }

  main() {
    this.setState({ currentView: null })
  }

  render() {
    if (this.state.currentView) {
      return this.state.currentView
    }

    const View = this.props.defaultView
    return <View router={this} />
  }
}
