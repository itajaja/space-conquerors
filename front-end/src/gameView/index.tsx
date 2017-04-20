import { css, StyleSheet } from 'aphrodite'
import * as React from 'react'

import IApi from '../api'
import MapView from './mapView'
import SidebarMenu from './sidebarMenu'
import Store, { State } from './store'

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
    this.setState({ game: game!, gameState: gameState! })
  }

  render() {
    const { game, gameState } = this.state
    if (!game || !gameState) {
      return null
    }

    return (
      <div className={css(styles.root)}>
        <MapView store={this.store} />
        <SidebarMenu store={this.store} />
      </div>
    )
  }
}
