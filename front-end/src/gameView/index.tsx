import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'

import IApi from '../api'
import MapView from './mapView'
import Navbar from './Navbar'
import OverviewView from './overviewView'
import SidebarMenu from './sidebarMenu'
import Store, { State } from './store'
import TurnView from './turnView'

const styles = StyleSheet.create({
  root: {
    height: '100%',
  },
})

export type Props = {
  api: IApi,
  gameId: string,
}

export default class GameView extends React.Component<Props, State> {
  store: Store

  constructor(props, ctx) {
    super(props, ctx)

    this.store = new Store(this)
    this.state = {
      game: null,
      gameState: null,
    } as any
    this.fetchGame()
  }

  async fetchGame() {
    const game = await this.props.api.getGame(this.props.gameId)
    const gameState = await this.props.api.getGameState(this.props.gameId)
    const actions = await this.props.api.getActions(this.props.gameId)
    const log = await this.props.api.getLog(this.props.gameId)
    this.setState({
      game: game!,
      gameState: gameState!,
      actions,
      view: 'map',
      log,
    })
  }

  renderView() {
    switch (this.state.view) {
      case 'map':
        return <MapView store={this.store} />
      case 'overview':
        return <OverviewView store={this.store} />
      case 'turn':
        return <TurnView store={this.store} api={this.props.api} />
      default:
        return null
    }
  }

  render() {
    const { game, gameState } = this.state
    if (!game || !gameState) {
      return null
    }

    return (
      <div className={css(styles.root)}>
        <Navbar store={this.store} />
        {this.renderView()}
        <SidebarMenu store={this.store} />
      </div>
    )
  }
}
