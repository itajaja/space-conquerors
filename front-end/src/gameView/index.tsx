import { StyleSheet } from 'aphrodite'
import * as React from 'react'
import { compose, DefaultChildProps, gql, graphql } from 'react-apollo'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom'
import * as ax from 'sco-engine/lib/actions'
import GameEngine from 'sco-engine/lib/gameEngine'
import GameValidator from 'sco-engine/lib/gameValidator'
import { ResourceCalculator } from 'sco-engine/lib/resources'
import * as sx from 'sco-engine/lib/state'
import { deepClone } from 'sco-engine/lib/utils'

import Layout from '../components/layout'
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
  main: {
    overflow: 'auto',
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
      turnReady
    }
    viewer {
      id
      user { id }
    }
  }
`

export class GameView extends React.Component<Props, State> {
  store: Store
  validator: GameValidator
  scheduledState: sx.IGameState
  scheduledStateValidator: GameValidator
  resourceCalculator: ResourceCalculator

  constructor(props, ctx) {
    super(props, ctx)

    this.state = { selectedUnits: [] }
    this.store = new Store(this)
    this.syncProps(props)
  }

  componentWillReceiveProps(props: Props) {
    this.syncProps(props)
  }

  syncProps(props: Props) {
    const { state, map, actions } = props.data!.game
    this.validator = new GameValidator(state, map)

    this.resourceCalculator = new ResourceCalculator(state)

    this.scheduledState = deepClone(state)
    const gameEngine = new GameEngine(this.scheduledState, map)
    const userId = props.data!.viewer.user.id
    const produceActions = actions[this.store.myPlayer.id].filter(ax.isProduceAction)
    gameEngine.schedulePlayerProduction(
      this.scheduledState.players[userId],
      produceActions,
    )
    this.scheduledStateValidator = new GameValidator(this.scheduledState, map)
  }

  render() {
    const { viewer } = this.props.data!

    return (
      <Layout classes={styles.root}>
        <Navbar store={this.store} userId={viewer.user.id} />
        <Layout grow classes={styles.main}>
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
        </Layout>
      </Layout>
    )
  }
}

export default compose(
  graphql<ResultProps, ComponentProps>(Query, {
    options: ({ match }) => ({
      variables: { gameId: match.params.gameId },
    }),
  }),
  shortcircuit(p => p.data.game && p.data.viewer),
)(GameView)
