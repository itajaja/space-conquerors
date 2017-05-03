import { css, StyleSheet } from 'aphrodite'
import * as _ from 'lodash'
import * as React from 'react'

import { ICell } from 'sco-engine/map'
import { IUnitState } from 'sco-engine/state'
import Store from './store'

type Props = {
  cell: ICell,
  store: Store,
  units: IUnitState[],
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

const styles = StyleSheet.create({
  planet: {
    cursor: 'pointer',
    stroke: 'grey',
  },
  destination: {
    cursor: 'pointer',
  },
  unit: {
    transform: 'scale(.6) translate(10px, -66px)',
    stroke: 'black',
    cursor: 'pointer',
  },
  noInteraction: {
    pointerEvents: 'none',
  },
})

export default class Cell extends React.Component<Props, State> {
  onPlanetClick = () => {
    const { cell, store } = this.props
    store.selectPlanet(cell.id)
  }

  onUnitsClick = (units: IUnitState[]) => {
    this.props.store.selectUnits(units)
  }

  onDestinationClick = () => {
    const { cell, store } = this.props
    store.moveUnits(cell.id)
  }

  playerColor(player: string) {
    const playerIndex = this.props.store.state.game.players.indexOf(player)
    return PLAYER_COLORS[playerIndex]
  }

  renderPlanet() {
    const { cell, store } = this.props
    if (!cell.planet) {
      return null
    }
    let fill = 'black'
    const planetState = store.state.gameState.planets[cell.id]
    if (planetState) {
      fill = planetState.ownerPlayerId
        ? this.playerColor(planetState.ownerPlayerId)
        : 'grey'
    }

    return (
      <circle
        onClick={this.onPlanetClick}
        r="20"
        fill={fill}
        className={css(styles.planet)}
      />
    )
  }

  renderDestination() {
    const { cell, store } = this.props
    if (store.state.selectedDestinations && store.state.selectedDestinations[cell.id]) {
      return (
        <g>
          <defs>
            <radialGradient id="destination" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="red" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle
            fill="url(#destination)"
            r="20"
            className={css(styles.destination)}
            onClick={this.onDestinationClick}
          />
        </g>
      )
    }

  }

  renderUnits = (units: IUnitState[], idx: number) => {
    return (
      <g key={idx}>
        <path
          onClick={() => this.onUnitsClick(units)}
          className={css(styles.unit)}
          d="M16 48 L32 40 L48 48 L32 16 Z"
          fill={this.playerColor(units[0].playerId)}
        />
      </g>
    )
  }

  render() {
    const { cell, units } = this.props
    const unitsByPlayer = _.groupBy(units, 'playerId')

    return (
      <g>
        {this.renderPlanet()}
        {_.values(unitsByPlayer).map(this.renderUnits)}
        <text
          className={css(styles.noInteraction)}
          fontSize="7"
          fill="white"
          textAnchor="middle"
        >
          {cell.name}
        </text>
        {this.renderDestination()}
      </g>
    )
  }
}
