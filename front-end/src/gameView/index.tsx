import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { gql, graphql, InjectedGraphQLProps } from 'react-apollo'

import { Game } from '../gqlTypes'
import shortcircuit from '../shortcircuit'
import MapView from './mapView'
import Navbar from './Navbar'
import OverviewView from './overviewView'
import Store from './store'
import TurnView from './turnView'

const styles = StyleSheet.create({
  root: {
    height: '100%',
  },
})

export type Routes = 'map' | 'overview' | 'turn'

export type State = {
  selectedLocationId?: string,
  selectedUnits: string[],
  selectedDestinations?: { [idx: string]: true },
  selectedPath?: string[],
  view: Routes,
}

export type Props = InjectedGraphQLProps<{game: Game, viewer: any}> & {
  gameId: string,
}

const Query = gql`
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

@graphql(Query, {
  options: ({ gameId }) => ({
    variables: { gameId },
  }),
})
@shortcircuit(p => p.data.game && p.data.viewer)
export default class GameView extends React.Component<Props, State> {
  store: Store

  constructor(props, ctx) {
    super(props, ctx)

    this.state = { view: 'map', selectedUnits: [] }
    this.store = new Store(this)
  }

  renderView() {
    switch (this.state.view) {
      case 'map':
        return <MapView store={this.store} />
      case 'overview':
        return <OverviewView store={this.store} />
      case 'turn':
        return <TurnView store={this.store} />
      default:
        return null
    }
  }

  goTo = (view: Routes) => {
    this.setState({ view })
  }

  render() {
    const { viewer } = this.props.data!

    return (
      <div className={css(styles.root)}>
        <Navbar store={this.store} userId={viewer.user.id} />
        {this.renderView()}
      </div>
    )
  }
}
