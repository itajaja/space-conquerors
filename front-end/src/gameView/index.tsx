import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { DefaultChildProps, gql, graphql } from 'react-apollo'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom'

import { Game } from '../gqlTypes'
import shortcircuit from '../shortcircuit'
import MapView from './mapView'
import Navbar from './Navbar'
import OverviewView from './overviewView'
import Store from './store'
import TurnView from './turnView'

const styles = StyleSheet.create({
  root: {
    position: 'fixed',
    left: 0, top: 0, right: 0, bottom: 0,
  },
})

export type State = {
  selectedLocationId?: string,
  selectedUnits: string[],
  selectedDestinations?: { [idx: string]: true },
  selectedPath?: string[],
}

type ComponentProps = RouteComponentProps<any>
type ResultProps = { game: Game, viewer: any }
export type Props = DefaultChildProps<ComponentProps, ResultProps>

export const Query = gql`
  query GameView($gameId: String!) {
    game(gameId: $gameId) {
      id
      name
      createdAt
      currentTurnNumber
      players
      map
      mapLayout
      state
      actions
      log
    }
    viewer {
      user { id }
    }
  }
`

export class GameView extends React.Component<Props, State> {
  store: Store

  constructor(props, ctx) {
    super(props, ctx)

    this.state = { selectedUnits: [] }
    this.store = new Store(this)
  }

  render() {
    const { viewer } = this.props.data!

    return (
      <div className={css(styles.root)}>
        <Navbar store={this.store} userId={viewer.user.id} />
        <Switch>
          <Route
            path={`${this.props.match.url}/map`}
            render={() => <MapView store={this.store} />}
          />
          <Route
            path={`${this.props.match.url}/overview`}
            render={() => <OverviewView store={this.store} />}
          />
          <Route
            path={`${this.props.match.url}/turn`}
            render={() => <TurnView store={this.store} />}
          />
          <Redirect
            exact
            from={this.props.match.url}
            to={`${this.props.match.url}/map`}
          />
        </Switch>
      </div>
    )
  }
}

export default graphql<ResultProps, ComponentProps>(Query, {
  options: ({ match }) => ({
    variables: { gameId: match.params.gameId },
  }),
})(shortcircuit(p => p.data.game && p.data.viewer)(GameView))
