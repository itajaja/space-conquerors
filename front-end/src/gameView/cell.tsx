import * as React from 'react'

import { ICell } from 'sco-engine/src/map'
import Store from './store'

type Props = {
  cell: ICell,
  store: Store,
}

type State = {
  shift: boolean,
}

const PLAYER_COLORS = [
  'red',
  'blue',
  'green',
  'gold',
  'purple',
  'pink',
  'aqua',
  'greenyellow',
]

export default class Cell extends React.Component<Props, State> {
  playerColor(player: string) {
    const playerIndex = this.props.store.state.game.players.indexOf(player)
    return PLAYER_COLORS[playerIndex]
  }

  renderPlanet() {
    const { cell, store } = this.props
    if (!cell.planet) {
      return null
    }
    const style = {
      stroke: 'grey',
      fill: 'black',
    }
    const planetState = store.state.gameState.planets[cell.id]
    if (planetState) {
      style.fill = planetState.ownerPlayerId
        ? this.playerColor(planetState.ownerPlayerId)
        : 'grey'
    }

    return <circle r="20" {...style} />
  }

  onClick = () => {
    const { cell, store } = this.props
    if (!cell.planet) {
      return
    }
    store.selectPlanet(cell.id)
  }

  render() {
    return (
      <g onClick={this.onClick}>
        {this.renderPlanet()}
        <text
          fontSize="7"
          fill="white"
          textAnchor="middle"
        >
          {this.props.cell.name}
        </text>
      </g>
    )
  }
}
