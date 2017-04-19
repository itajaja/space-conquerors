import * as React from 'react'

import IApi, { Game } from '../api'
import MapView from './mapView'

export type Props = {
  api: IApi,
  gameId: string,
}

export type State = {
  game: Game | null,
}

export default class GameView extends React.Component<Props, State> {
  constructor(props, ctx) {
    super(props, ctx)

    this.state = {
      game: null,
    }
    this.fetchGame()
  }

  async fetchGame() {
    const game = await this.props.api.getGame(this.props.gameId)
    this.setState({ game })
  }

  render() {
    const { game } = this.state
    if (!game) {
      return null
    }

    return (
      <MapView map={game.map} />
    )
  }
}

// HIGH WATERMARK?
