import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'
import { compose, DefaultChildProps, gql, graphql } from 'react-apollo'
import { NavLink, Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom'
import * as ax from 'sco-engine/lib/actions'
import GameEngine from 'sco-engine/lib/gameEngine'
import GameValidator from 'sco-engine/lib/gameValidator'
import { ResourceCalculator } from 'sco-engine/lib/resources'
import * as sx from 'sco-engine/lib/state'
import { deepClone } from 'sco-engine/lib/utils'
import { Header } from 'semantic-ui-react'

import Layout from '../components/layout'
import Loading from '../components/loading'
import RenderInBody from '../components/renderInBody'
import { Game } from '../gqlTypes'
import shortcircuit from '../shortcircuit'
import { GameViewFragment } from './fragments'
import MapView from './mapView'
import Navbar from './Navbar'
import OverviewView from './overviewView'
import Store from './store'
import TurnView from './turnView'

const styles = StyleSheet.create({
  backdropRoot: {
    position: 'fixed',
    top: '0',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2000,
  },
  backdrop: {
    background: 'black',
    opacity: .2,
    width: '100%',
    height: '100%',
  },
  backdropLoading: {
    position: 'absolute',
    display: 'flex',
    top: '0',
    bottom: '0',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'scale(1.5)',
  },
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
  backdrop?: boolean,
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
      map
      mapLayout
      ...GameViewFragment
    }
    viewer {
      id
      user { id }
    }
  }

  ${GameViewFragment}
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
    const { game, viewer } = this.props.data!
    if (this.store.myPlayer.status === sx.PlayerStatus.Dead) {
      return (
        <Layout classes={styles.root}>
          <Header textAlign="center" as="h1" inverted>
            YOU LOST
            <Header.Subheader as={NavLink} to="/">
              go back
            </Header.Subheader>
          </Header>
        </Layout>
      )
    }
    if (game.state.gameOver) {
      return (
        <Layout classes={styles.root}>
          <Header textAlign="center" as="h1" inverted>
            YOU WON
            <Header.Subheader as={NavLink} to="/">
              go back
            </Header.Subheader>
          </Header>
        </Layout>
      )
    }

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
        {this.state.backdrop &&
          <RenderInBody>
            <div className={css(styles.backdropRoot)}>
              <div className={css(styles.backdrop)} />
              <Loading className={css(styles.backdropLoading)}/>
            </div>
          </RenderInBody>
        }
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
